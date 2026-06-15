import { generateReport, detectTopic } from "@/lib/analyzeText";
import type { MockReport } from "@/lib/mockData";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createServiceClient } from "@/lib/supabase";
import { checkUsageLimits, incrementUsage } from "@/lib/usageLimits";

let _devCallCount = 0;

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "development") {
    console.log("[/api/analyze] ROUTE HIT at", new Date().toISOString());
    console.log("[/api/analyze] env —", {
      GEMINI_API_KEY: !!process.env.GEMINI_API_KEY,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
  }
  let requestId = Math.random().toString(36).slice(2, 9);

  // Supabase Auth — wrapped so an auth error never crashes analysis generation.
  let userId: string | null = null;
  try {
    const authClient = await createServerSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();
    userId = user?.id ?? null;
  } catch (err) {
    console.warn(`[/api/analyze] ${requestId} — Supabase auth error (proceeding without userId):`, err);
  }

  let text: string;
  let sourceType = "unknown";
  let pdfPageCount: number | undefined;
  try {
    const body = await request.json();
    text = body.text;
    sourceType = body.sourceType ?? "unknown";
    pdfPageCount = typeof body.pdfPageCount === "number" ? body.pdfPageCount : undefined;
    if (body.requestId && typeof body.requestId === "string") requestId = body.requestId;
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!text || typeof text !== "string" || text.trim().length < 10) {
    return Response.json({ error: "text is required" }, { status: 400 });
  }

  const wordCount = text.trim().split(/\s+/).length;
  const topic = detectTopic(text);

  // The client pre-truncates to MAX_CHARS_TO_ANALYZE before sending. The slice in the Gemini
  // prompt is a belt-and-suspenders safety net for any direct API calls.
  const charsReceived = text.length;
  const charsToGemini = Math.min(text.length, 20_000);
  const charsTruncatedByApi = text.length > 20_000;

  console.log(
    `[/api/analyze] ${requestId} — sourceType:${sourceType} charsReceived:${charsReceived} charsToGemini:${charsToGemini}${
      charsTruncatedByApi ? " (truncated by API — client should have pre-truncated)" : ""
    } wordCount:${wordCount}`
  );

  if (process.env.NODE_ENV === "development") {
    console.log(`[/api/analyze] #${++_devCallCount} start — requestId:${requestId} userId:${userId ?? "none"} sourceType:${sourceType} wordCount:${wordCount}`);
  }

  const log = {
    requestId,
    timestamp: new Date().toISOString(),
    sourceType,
    wordCount,
    geminiCalled: false,
    geminiSucceeded: null as boolean | null,
    errorStatus: null as number | null,
    errorMessage: null as string | null,
    fallbackReason: null as string | null,
  };

  // Usage limit check — signed-in users only; errors allow through rather than block
  if (userId) {
    try {
      const limitCheck = await checkUsageLimits(userId, wordCount, sourceType, pdfPageCount);
      if (!limitCheck.ok) {
        return Response.json(
          { error: limitCheck.violation.message, errorCode: limitCheck.violation.errorCode },
          { status: 403 },
        );
      }
    } catch (err) {
      console.error(`[/api/analyze] ${requestId} — Usage check failed (allowing through):`, err);
    }
  }

  if (!process.env.GEMINI_API_KEY) {
    log.fallbackReason = "no_api_key";
    console.log("[/api/analyze]", log);
    const report = generateReport(text);
    const analysisId = await saveAnalysis({ requestId, userId, report, text, sourceType, wordCount, usedMockFallback: true });
    if (userId && analysisId !== null) await incrementUsage(userId, sourceType);
    return Response.json({ report, topic, _usedMockFallback: true, fallbackReason: "no_api_key", analysisId });
  }

  log.geminiCalled = true;

  try {
    const report = await callGemini(text);
    log.geminiSucceeded = true;
    log.fallbackReason = null;
    console.log(`[/api/analyze] ${requestId} — Gemini succeeded`);
    console.log("[/api/analyze]", log);
    const analysisId = await saveAnalysis({ requestId, userId, report, text, sourceType, wordCount, usedMockFallback: false });
    if (userId && analysisId !== null) await incrementUsage(userId, sourceType);
    return Response.json({ report, topic, analysisSource: "gemini", analysisId });
  } catch (err) {
    log.geminiSucceeded = false;
    log.fallbackReason = "gemini_error";
    if (err instanceof Error) {
      const statusMatch = err.message.match(/^Gemini (\d+):/);
      log.errorStatus = statusMatch ? parseInt(statusMatch[1]) : null;
      log.errorMessage = err.message;
    } else {
      log.errorMessage = String(err);
    }
    const isQuota = log.errorStatus === 429 || /quota|rate.?limit/i.test(log.errorMessage ?? "");

    if (isQuota) {
      log.fallbackReason = "gemini_quota";
      console.warn(`[/api/analyze] ${requestId} — Gemini quota/rate limit, falling back to mock:`, log.errorMessage);
      const report = generateReport(text);
      const analysisId = await saveAnalysis({ requestId, userId, report, text, sourceType, wordCount, usedMockFallback: true });
      if (userId && analysisId !== null) await incrementUsage(userId, sourceType);
      return Response.json({ report, topic, _usedMockFallback: true, fallbackReason: "gemini_quota", analysisId });
    }

    console.error(`[/api/analyze] ${requestId} — Gemini failed:`, log);

    if (process.env.NODE_ENV === "development") {
      return Response.json(
        { error: "Gemini failed", geminiStatus: log.errorStatus, geminiMessage: log.errorMessage, requestId },
        { status: 500 }
      );
    }

    const report = generateReport(text);
    const analysisId = await saveAnalysis({ requestId, userId, report, text, sourceType, wordCount, usedMockFallback: true });
    if (userId && analysisId !== null) await incrementUsage(userId, sourceType);
    return Response.json({ report, topic, _usedMockFallback: true, fallbackReason: "gemini_error", analysisId });
  }
}

async function saveAnalysis({
  requestId,
  userId,
  report,
  text,
  sourceType,
  wordCount,
  usedMockFallback,
}: {
  requestId: string;
  userId: string | null;
  report: MockReport;
  text: string;
  sourceType: string;
  wordCount: number;
  usedMockFallback: boolean;
}): Promise<string | null> {
  if (!userId) {
    console.log(`[/api/analyze] ${requestId} — skipping Supabase save (no userId)`);
    return null;
  }
  // Resolve the best human-readable topic in priority order.
  const resolvedTopic =
    report.framingSummary?.topic?.trim() ||
    (report as unknown as { topic?: string }).topic?.trim() ||
    text.trim().slice(0, 60) ||
    "Untitled Analysis";
  try {
    console.log(`[/api/analyze] ${requestId} — saving to Supabase (userId:${userId} topic:"${resolvedTopic}")`);
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("analyses")
      .insert({
        user_id: userId,
        report,
        topic: resolvedTopic,
        source_type: sourceType,
        word_count: wordCount,
        used_mock_fallback: usedMockFallback,
        input_text: text,
      })
      .select("id")
      .single();
    if (error) throw error;
    const analysisId = (data as { id: string }).id;
    console.log(`[/api/analyze] ${requestId} — Supabase save ok (analysisId:${analysisId})`);
    return analysisId;
  } catch (err) {
    console.error(`[/api/analyze] ${requestId} — Supabase save failed:`, err);
    return null;
  }
}

const SYSTEM = `You are a rhetorical and narrative framing analyst. Your task is to identify HOW a text frames its subject — not to judge whether the source is reliable or "biased" in a dismissive sense.

CORE PRINCIPLE — FRAMING RISK ≠ SOURCE UNRELIABILITY:
All writing involves framing. Framing risk measures how strongly a text guides interpretation through tone, emphasis, evidence selection, and omitted perspectives. A high-framing text can be factually accurate. A low-framing text can still contain errors. Your analysis helps readers understand the framing — it does not render a verdict on the source.

STEP 1 — Infer the likely source type from the content before scoring:
- academic / textbook / historical / educational — formal explanatory tone, references to evidence or scholarly context, historical or scientific subject matter, explanatory rather than persuasive purpose
- news article — factual reporting, named sources, journalistic structure, inverted pyramid
- opinion / editorial / commentary / political speech — stated position, first-person or clear stance, argumentative and persuasive intent
- marketing / promotional — sales intent, benefit-focused, risks minimized or absent
- profile / sports journalism — narrative-driven, person-focused, often celebratory or promotional
- student essay — analytical intent, possibly informal or unsupported
- policy / institutional document — official procedural language, regulatory or administrative focus

STEP 2 — Apply source-type-calibrated scoring:

ACADEMIC / TEXTBOOK / HISTORICAL / EDUCATIONAL sources:
- Strong evaluative language grounded in historical consensus is NOT loaded language. Phrases like "forced labor," "unprecedented mortality," "systematic exploitation," "brutal conquest," "mass displacement," or "demographic collapse" reflect established scholarly terminology — not rhetorical manipulation. Do not penalize factual historical description of harm, violence, or oppression.
- Medium or High overall risk requires: contested claims stated as definitively settled fact, major relevant perspectives demonstrably absent beyond the source's scope, evidence selectively chosen to misrepresent scholarly consensus, or evaluative assertions that go unsupported by any evidence in the text.
- If the text is primarily explanatory and evidence-grounded, score Low or Medium even with a clear critical or interpretive lens.
- loadedLanguage score for academic/historical sources: 1–4 unless phrases are genuinely unsupported by evidence or context. Scores of 5–7 only if rhetoric exceeds what the evidence in the text justifies.

OPINION / EDITORIAL / COMMENTARY / POLITICAL SPEECH:
- Apply heightened scrutiny — these texts are designed to persuade.
- Flag loaded language, missing counterarguments, and emotional framing clearly.
- Medium risk is the normal baseline; Medium-High or High if unsupported claims, pervasive fallacies, or major omitted perspectives are present.

MARKETING / PROMOTIONAL content:
- loadedLanguage and emotionalFraming likely 5–9. Flag missing perspectives (costs, risks, failure modes, alternatives).
- Overall risk Medium to High almost always warranted.

NEWS ARTICLES:
- Standard scoring. Watch for source imbalance, selective quotation, angle-setting in the lede, and what is omitted.

SPORTS / PROFILES / ENTERTAINMENT:
- Flag hero narrative construction, promotional hyperbole, cherry-picked statistics, and absent critical perspectives (e.g. opponents' views, defensive shortcomings, career context).

LOADED PHRASE RULES:
Do NOT flag a phrase as loaded solely because it is emotionally resonant, historically significant, or describes something disturbing.
Flag it only if:
1. The emotional weight clearly exceeds what the evidence in the text supports, OR
2. The phrase asserts certainty about genuinely contested empirical claims, OR
3. The phrasing is designed to manipulate rather than to accurately describe.
For each flagged phrase, whyItMatters must explain whether the language is rhetorically manipulative beyond its evidentiary support, or whether it is strong but contextually appropriate.

OVERALL SCORE GUIDELINES:
- Low: Primarily explanatory or factual; framing is light or consistent with the source type; key claims are supported by evidence or context.
- Medium: Noticeable interpretive framing or perspective emphasis; some viewpoints underrepresented; rhetoric occasionally exceeds strict evidence, but core content is reasonable and grounded.
- Medium-High: Significant persuasive framing; multiple weakly-supported or unsupported claims; key perspectives conspicuously absent; rhetoric clearly leans toward persuasion over explanation.
- High: Strongly persuasive or manipulative; pervasive unsupported loaded language; critical perspectives ignored; likely promotional, political, or advocacy content with minimal factual grounding.

Do NOT score academic, educational, or historical sources as Medium-High or High unless the text demonstrably misrepresents scholarly consensus or makes unsupported factual claims that a careful reader would find misleading.

Do NOT default to policy framing for non-policy content. A sports article is not a "Contested Policy Debate."

Respond with ONLY a JSON object — no markdown code fences, no preamble, no commentary.`;

async function callGemini(text: string): Promise<MockReport> {
  const prompt = `Analyze this text and return exactly this JSON schema. Enum values must match exactly (case-sensitive). Base every field on the actual text — apply the source-type calibration rules from your system instructions before scoring.

SCHEMA:
{
  "framingSummary": {
    "topic": string,
    // 5–8 word label for the actual subject.
    // Examples: "Ja Morant 2021-22 NBA Breakout Season", "Atlantic World Colonization and Disease", "School Phone Ban Policy Debate"
    // Do NOT write "Contested Policy Debate" unless the text is literally about a contested policy.

    "mainArgument": string,
    // 1–2 sentences summarizing the central argument, narrative, or explanatory purpose.
    // For academic/historical: describe the scholarly lens and what the text explains or argues.
    // For profiles/sports: describe the narrative arc being constructed.

    "likelyStance": string,
    // The author's apparent position, angle, or scholarly perspective.
    // Examples: "Celebratory and promotional", "Critical historical analysis of colonial impact", "Neutral informational", "Strongly argumentative", "Balanced academic overview"

    "tone": string,
    // 2–5 word tone description.
    // Examples: "Enthusiastic and laudatory", "Measured and analytical", "Alarmist and urgent", "Scholarly and interpretive"

    "framingLens": string
    // The core interpretive frame or scholarly lens the author uses.
    // For academic/historical: e.g. "Critical history of colonial impact", "Economic history of forced labor systems", "Post-colonial historical analysis"
    // For opinion: e.g. "Individual liberty vs. institutional authority", "Progress vs. tradition"
    // Do NOT use generic political frames for non-political content.
  },

  "biasRiskScores": {
    "loadedLanguage": number,
    // integer 1–10. Measures whether language is rhetorically manipulative beyond what the evidence supports.
    // For academic/historical sources: 1–4 unless phrases genuinely exceed evidential support. Strong historical language (violence, oppression, exploitation) grounded in scholarly consensus is NOT loaded. Score 5+ only if rhetoric exceeds what the text's evidence justifies.
    // For opinion/promotional: standard scrutiny, 1–10.
    // 10 = pervasively manipulative or promotional language with no evidentiary support.

    "evidenceQuality": number,
    // integer 1–10 (10 = very strong evidence, citations, or contextual grounding provided)
    // For academic/historical: cite specific textual evidence (references, data, scholarly framing) when scoring.

    "missingCounterarguments": number,
    // integer 1–10 (10 = many important perspectives entirely absent)
    // For academic/historical: consider what perspectives a reader would reasonably expect. A history chapter focused on one dimension is not automatically a 9.

    "emotionalFraming": number,
    // integer 1–10. Measures emotionally manipulative framing disproportionate to evidence.
    // For academic/historical: emotionally resonant language describing historical facts (deaths, suffering, exploitation) is NOT manipulative framing. Score 1–4 unless emotion is used to distort rather than describe.
    // 10 = pervasively emotional, manipulative tone with little factual grounding.

    "overall": "Low" | "Medium" | "Medium-High" | "High"
    // Low = primarily explanatory; framing consistent with source type; claims supported.
    // Medium = noticeable framing lens; some perspectives underrepresented; reasonable core content.
    // Medium-High = significant persuasive framing; multiple weakly-supported claims; key perspectives absent.
    // High = strongly manipulative or promotional; pervasive unsupported loaded language; critical perspectives ignored.
    // Academic/educational/historical sources must NOT reach Medium-High or High unless the text demonstrably misrepresents scholarly consensus.
  },

  "loadedPhrases": [
    {
      "phrase": string,
      // Exact lowercase phrase from the text.
      // For academic/historical: only include phrases where the rhetoric exceeds what the evidence supports. Do NOT flag historically grounded evaluative language (e.g. "forced labor", "brutal conditions") as loaded.
      // For opinion/promotional: include politically charged, emotionally manipulative, or unsupported evaluative language.

      "whyItMatters": string,
      // 1–2 sentence analysis. For each phrase, explicitly state whether:
      // (a) the language is rhetorically manipulative or unsupported, OR
      // (b) the language is strong but historically/evidentially grounded (and note if it is appropriate in context).
      // Do NOT write that a historically accurate phrase "guides the reader toward a negative view" without explaining what would make that problematic.

      "impact": "High" | "Medium"
    }
    // 4–8 phrases. For academic/historical sources, err toward fewer flagged phrases at lower impact ratings unless genuine rhetorical manipulation is evident.
  ],

  "claims": [
    {
      "claim": string,
      // A specific assertion (factual, predictive, or evaluative) made in the text.

      "evidenceProvided": string,
      // What support is actually given in the text for this claim.
      // Examples: "Historical data cited", "Scholarly consensus referenced", "No source — asserted as fact", "Vague reference to 'experts'"

      "risk": "Unsupported" | "Weak" | "Fallacy" | "Supported"
      // For academic/historical: claims consistent with widely accepted historical scholarship should be "Supported" even without in-text citations.
    }
    // 3–5 claims
  ],

  "fallacies": [
    {
      "name": string,
      // Named reasoning or narrative pattern.
      // For academic/historical: use only if a genuine logical or argumentative error is present (e.g. overgeneralization, false certainty about contested causation).
      // For opinion: "Appeal to Emotion", "False Dilemma", "Straw Man", "Slippery Slope", "Ad Hominem", etc.
      // For sports/profiles: "Cherry-Picking Statistics", "Hasty Generalization", "False Inevitability", "Bandwagon Appeal".

      "explanation": string
      // 1–2 sentences showing exactly where and how this pattern appears.
    }
    // 0–4 items. For academic/educational sources, include only genuine logical errors — not interpretive choices.
  ],

  "missingPerspectives": string[],
  // 3–5 items: voices, data points, or viewpoints a careful reader would expect but that are absent.
  // For academic/historical: perspectives that would genuinely add balance or completeness to the scholarly account, not just "the other side."
  // For opinion/editorial: opposing stakeholders, counterevidence, affected communities.
  // For sports: opponents' perspective, defensive metrics, career context, statistical caveats.
  // Be specific — identify what is actually missing given the text's scope and claims.

  "neutralRewrite": {
    "original": string,  // A loaded, hyperbolic, or one-sided sentence from the text (verbatim or near-verbatim)
    "neutral": string    // Rewritten to reduce framing while preserving the factual core. For academic/historical, rewrite only if the original language genuinely exceeds its evidential support.
  },

  "socraticQuestions": string[]
  // Exactly 5 questions that help a reader think critically about the text's assumptions, framing, evidence, or missing context.
  // For academic/historical: ask about interpretive choices, evidence scope, and whose perspectives are centered.
}

TEXT TO ANALYZE:
"""
${text.slice(0, 20_000)}
"""`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = await res.json();
  const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!raw) throw new Error("Gemini returned empty content");

  const json = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  return JSON.parse(json) as MockReport;
}
