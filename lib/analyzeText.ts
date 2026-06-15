/**
 * analyzeText.ts
 *
 * All mock analysis logic lives here. When you're ready to connect real AI,
 * replace the `generateReport` function with an API call — the MockReport
 * return type stays the same, so no other file needs to change.
 */

import type { MockReport } from "./mockData";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type TopicKey = "ai" | "phones" | "climate" | "college" | "social-media" | "peer-support" | "generic";

interface PhraseEntry {
  pattern: RegExp;
  displayPhrase: string;
  whyItMatters: string;
  impact: "High" | "Medium";
}

interface NeutralRewriteOption {
  keyPhrase: string; // looked up in actual text; first match wins
  original: string;
  neutral: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADED LANGUAGE DICTIONARY
// Scanned against the actual pasted text — phrases the user wrote appear first.
// ─────────────────────────────────────────────────────────────────────────────

const PHRASE_DICT: PhraseEntry[] = [
  // ── Emotional framing ─────────────────────────────────────────────────────
  { pattern: /reckless(ly)?/i, displayPhrase: "reckless / recklessly", whyItMatters: "Emotional framing: creates an impression of carelessness before any evidence is presented, priming the reader to reject the subject on feeling rather than fact.", impact: "High" },
  { pattern: /disastr/i, displayPhrase: "disastrous / disaster", whyItMatters: "Emotional framing: activates catastrophic mental imagery so readers predict worst-case outcomes before the probability of those outcomes has been established.", impact: "High" },
  { pattern: /\btoxic\b/i, displayPhrase: "toxic", whyItMatters: "Emotional framing: borrows the severity of chemical contamination to describe a social phenomenon, loading the reader's perception before the evidence is examined.", impact: "High" },
  { pattern: /catastroph/i, displayPhrase: "catastrophe / catastrophic", whyItMatters: "Emotional framing: signals total, irreversible harm — foreclosing partial impacts, reversibility, and mitigation before they can be considered.", impact: "High" },
  { pattern: /dangerous mistake/i, displayPhrase: '"dangerous mistake"', whyItMatters: "Emotional framing: bundles a harm claim and an error accusation into a single phrase, treating both as established before either has been argued.", impact: "High" },
  { pattern: /damage it can cause/i, displayPhrase: '"the damage it can cause"', whyItMatters: "Emotional framing: presupposes harm as a settled fact, skipping the step of demonstrating that the causal relationship exists.", impact: "High" },

  // ── Overgeneralization / false consensus ──────────────────────────────────
  { pattern: /everyone knows/i, displayPhrase: '"everyone knows"', whyItMatters: "Overgeneralization: invokes a consensus that is never defined or evidenced, foreclosing scrutiny of the very claim being made.", impact: "Medium" },
  { pattern: /everyone acts like/i, displayPhrase: '"everyone acts like"', whyItMatters: "Overgeneralization: erases individual variation to manufacture agreement, positioning the reader to feel they must either accept the framing or be the exception.", impact: "Medium" },
  { pattern: /any reasonable person/i, displayPhrase: '"any reasonable person"', whyItMatters: "Overgeneralization: implies that disagreement is a sign of unreasonableness, pressuring acceptance of the claim without engaging counterarguments.", impact: "Medium" },
  { pattern: /\bepidemic\b/i, displayPhrase: "epidemic", whyItMatters: "Overgeneralization: medical crisis framing implies a scale and rate of spread that is rarely evidenced when applied to social phenomena.", impact: "Medium" },
  { pattern: /unprecedented/i, displayPhrase: "unprecedented", whyItMatters: "Overgeneralization: often factually contestable; used to manufacture novelty and urgency rather than to describe a verified historical absence.", impact: "Medium" },

  // ── Moral pressure / character attack ────────────────────────────────────
  { pattern: /if\b.{0,30}truly cared/i, displayPhrase: '"if [they] truly cared"', whyItMatters: "Moral pressure: reframes a policy disagreement as evidence of not caring — a character attack disguised as a conditional that forecloses good-faith debate.", impact: "High" },
  { pattern: /out[\-\s]of[\-\s]touch/i, displayPhrase: "out-of-touch", whyItMatters: "Character-based criticism: dismisses decision-makers by attacking their empathy rather than engaging with their stated reasoning.", impact: "High" },
  { pattern: /laz(y|iness)/i, displayPhrase: "lazy / laziness", whyItMatters: "Character-based criticism: attacks the intellectual character of the subject rather than examining specific behaviors or outcomes.", impact: "Medium" },
  { pattern: /lazy thinkers?/i, displayPhrase: '"lazy thinkers"', whyItMatters: "Character-based criticism: dismisses those who use AI by labeling their cognition as deficient — substituting insult for analysis of how or why the tool is being used.", impact: "High" },
  { pattern: /\bcheat/i, displayPhrase: "cheat / cheating", whyItMatters: "Moral pressure: applies a broad moral accusation without distinguishing different types of AI-assisted work, collapsing a spectrum of behaviors into a single condemnation.", impact: "High" },
  { pattern: /plagiar/i, displayPhrase: "plagiarism", whyItMatters: "Moral pressure: conflates AI-assisted writing with passing off another's work as one's own — a serious accusation that requires defining the line being crossed.", impact: "High" },
  { pattern: /\bdeserve\b/i, displayPhrase: "deserve", whyItMatters: "Moral pressure: presents an entitlement claim as objective fact, bypassing the need to argue for the standard being applied.", impact: "Medium" },
  { pattern: /bureaucrat/i, displayPhrase: "bureaucrats", whyItMatters: "Character-based criticism: a dismissive label that substitutes for engagement with the actual reasoning of the people being criticized.", impact: "Medium" },
  { pattern: /unqualified/i, displayPhrase: "unqualified", whyItMatters: "Character-based criticism: dismisses individuals based on a label rather than examining their actual performance or preparation.", impact: "High" },

  // ── Unsupported certainty ─────────────────────────────────────────────────
  { pattern: /inevitabl/i, displayPhrase: "inevitably / inevitable", whyItMatters: "Unsupported certainty: presents a speculative outcome as though no alternative trajectory is possible, closing off analysis before it can begin.", impact: "Medium" },
  { pattern: /obvious risk/i, displayPhrase: '"obvious risk"', whyItMatters: "Unsupported certainty: signals the reader that scrutiny is unnecessary — suppressing the very critical thinking the argument ostensibly defends.", impact: "Medium" },
  { pattern: /\bdestroy\b/i, displayPhrase: "destroy", whyItMatters: "Unsupported certainty: forecloses any middle-ground outcome — partial impact, reversibility, and mitigation disappear behind an absolute prediction.", impact: "High" },
  { pattern: /\bfailure\b/i, displayPhrase: "failure", whyItMatters: "Unsupported certainty: absolute verdict that erases partial success, context, or the possibility of improvement from consideration.", impact: "Medium" },
  { pattern: /overreach/i, displayPhrase: "overreach", whyItMatters: "Unsupported certainty: presupposes that a policy exceeds legitimate authority without establishing what the appropriate limits actually are.", impact: "High" },

  // ── Hidden motive / conspiracy framing ───────────────────────────────────
  { pattern: /\bagenda\b/i, displayPhrase: "agenda", whyItMatters: "Conspiracy framing: shifts attention from a policy's stated rationale to a speculated hidden motive — a move that short-circuits factual engagement entirely.", impact: "High" },
  { pattern: /\bexploit/i, displayPhrase: "exploit / exploitation", whyItMatters: "Conspiracy framing: attributes the most predatory possible motive to the subject; intent claims require internal evidence that is rarely presented.", impact: "High" },
  { pattern: /manipulat/i, displayPhrase: "manipulate / manipulation", whyItMatters: "Conspiracy framing: once a reader accepts the manipulation frame, all subsequent facts get filtered through an assumption of deliberate wrongdoing.", impact: "High" },
  { pattern: /indoctrinat/i, displayPhrase: "indoctrinate / indoctrination", whyItMatters: "Conspiracy framing: attributes ideological intent to educational content — a claim that requires evidence of deliberate design, not just disagreement with the content.", impact: "High" },
  { pattern: /\bpropaganda\b/i, displayPhrase: "propaganda", whyItMatters: "Conspiracy framing: a serious accusation deployed rhetorically; it requires evidence of deliberate deception, not merely a perspective the author disagrees with.", impact: "High" },
  { pattern: /chasing the newest|chasing.*trend/i, displayPhrase: '"chasing the newest trend"', whyItMatters: "Conspiracy framing: reframes deliberate adoption of new tools as uncritical trend-following, bypassing any engagement with the reasons people choose to use the technology.", impact: "Medium" },

  // ── Borrowed authority / extreme comparison ───────────────────────────────
  { pattern: /draconian/i, displayPhrase: "draconian", whyItMatters: "Borrowed authority: imports the moral weight of ancient Athenian harshness; the comparison requires the reader to accept it as apt without any evidence.", impact: "High" },
  { pattern: /authoritarian/i, displayPhrase: "authoritarian", whyItMatters: "Borrowed authority: borrows the gravity of political authoritarianism to describe an institutional policy, a comparison that demands justification not provided.", impact: "High" },
  { pattern: /takeover/i, displayPhrase: "takeover", whyItMatters: "Borrowed authority: imports the adversarial connotations of a political or corporate takeover to describe a process that may have no adversarial character.", impact: "High" },
  { pattern: /surveillance/i, displayPhrase: "surveillance", whyItMatters: "Borrowed authority: invokes the imagery of state surveillance without establishing that the monitoring described meets that threshold.", impact: "High" },
  { pattern: /\bwoke\b/i, displayPhrase: "woke", whyItMatters: "Borrowed authority: politically loaded shorthand that signals tribal alignment rather than making a substantive argument about the specific policy or behavior.", impact: "High" },

  // ── Urgency / crisis framing ──────────────────────────────────────────────
  { pattern: /\bcrisis\b/i, displayPhrase: "crisis", whyItMatters: "Urgency framing: signals that normal evaluative standards should be suspended — a frame that benefits the author's call to action but disadvantages the reader's deliberation.", impact: "Medium" },
  { pattern: /\bepidemic\b/i, displayPhrase: "epidemic", whyItMatters: "Urgency framing: medical contagion language implies a rate of spread and severity that is rarely evidenced when applied to behavioral or social trends.", impact: "Medium" },

  // ── Dismissive framing ───────────────────────────────────────────────────
  { pattern: /\bradical\b/i, displayPhrase: "radical", whyItMatters: "Dismissive framing: positions the subject as extreme or dangerous without evidence that it falls outside the range of legitimate mainstream positions.", impact: "High" },
  { pattern: /\balarmist\b/i, displayPhrase: "alarmist", whyItMatters: "Dismissive framing: characterizes concern as emotional overreaction, delegitimizing the opposing view without engaging its substance.", impact: "High" },
  { pattern: /hyster(ia|ical)/i, displayPhrase: "hysteria / hysterical", whyItMatters: "Dismissive framing: historically gendered term used to pathologize opposition; applies a clinical label to a position as a substitute for counter-argument.", impact: "High" },
  { pattern: /shortcut/i, displayPhrase: "shortcut", whyItMatters: "Dismissive framing: implies that a method is inherently easier or inferior without examining whether the outcomes actually differ.", impact: "Medium" },
  { pattern: /undermin/i, displayPhrase: "undermine", whyItMatters: "Dismissive framing: the gradual, quiet connotation does rhetorical work the author hasn't earned — it implies damage that may not appear in any available evidence.", impact: "Medium" },

  // ── Rights / dignity framing ─────────────────────────────────────────────
  { pattern: /strip (away )?(our|the|their|student)/i, displayPhrase: "strip away rights/autonomy", whyItMatters: "Rights framing: implies a constitutional or moral violation without establishing what right is being removed or what standard it violates.", impact: "High" },
  { pattern: /replace (human|teacher|student|worker)/i, displayPhrase: "replace humans / replace teachers", whyItMatters: "Displacement framing: triggers fear of job or identity loss without evidence that replacement — rather than augmentation — is the likely or intended outcome.", impact: "High" },
  { pattern: /reverse discrimination/i, displayPhrase: "reverse discrimination", whyItMatters: "Rights framing: a legally and semantically contested term deployed as settled fact to frame equity policies as violations rather than remedies.", impact: "High" },

  // ── Economic / policy fear ────────────────────────────────────────────────
  { pattern: /job[\-\s]killing/i, displayPhrase: "job-killing", whyItMatters: "Economic fear: applies a negative employment outcome as a label before any economic evidence has been assessed.", impact: "High" },
  { pattern: /green agenda/i, displayPhrase: '"green agenda"', whyItMatters: "Economic fear: frames environmental policy as ideologically motivated — implying the goal is ideology rather than outcomes — without evidence of that motivation.", impact: "High" },

  // ── Addictive / clinical borrowing ────────────────────────────────────────
  { pattern: /\baddictive\b/i, displayPhrase: "addictive", whyItMatters: "Clinical borrowing: imports a DSM-adjacent concept that carries a specific medical definition; applying it loosely implies a level of harm that requires clinical evidence to establish.", impact: "High" },

  // ── Corruption / fraud ───────────────────────────────────────────────────
  { pattern: /\brigged\b/i, displayPhrase: "rigged", whyItMatters: "Corruption framing: implies systematic, deliberate manipulation without identifying the mechanism, the actors, or the evidence of coordinated wrongdoing.", impact: "High" },
];

// ─────────────────────────────────────────────────────────────────────────────
// TOPIC DETECTION
// Order matters — more specific patterns first.
// ─────────────────────────────────────────────────────────────────────────────

export function detectTopic(text: string): TopicKey {
  const t = text.toLowerCase();

  // Peer support / school counseling — checked first; "classroom" appears in
  // these docs and would otherwise falsely trigger the AI branch.
  if (
    /\bpeerbridge\b/.test(t) ||
    /\b(peer support|peer counseling|peer mentor(ing)?|peer helper|peer program|peer advisor|peer-led)\b/.test(t) ||
    /\b(supervised peer|peer.to.peer support|mental health referral|student wellness program|referral platform)\b/.test(t)
  ) {
    return "peer-support";
  }

  // AI in education — "classrooms?" removed; it matches any school document.
  if (
    /\b(artificial intelligence|chatgpt|gpt|llm|machine learning|chatbot|ai tool|ai in)\b/.test(t) ||
    /\bai\b/.test(t) ||
    /\b(copy answers?|academic integrity.*machine|machine.*academic|algorithms? in school)\b/.test(t)
  ) {
    return "ai";
  }

  if (
    /\b(climate change|global warming|carbon emissions?|fossil fuels?|renewable energy|greenhouse gas|net zero|paris agreement|ipcc)\b/.test(t)
  ) {
    return "climate";
  }

  if (
    /\b(college admissions?|university admissions?|affirmative action|sat scores?|act scores?|college application|ivy league|admissions office|merit.based admission)\b/.test(t)
  ) {
    return "college";
  }

  if (
    /\b(social media|instagram|tiktok|facebook|twitter|snapchat|influencer|doom.?scroll|content algorithm|for you page|screen time|likes? and comment)\b/.test(t)
  ) {
    return "social-media";
  }

  if (
    /\b(phone ban|smartphone ban|cell phone|ban phones?|confiscat|screen time|phone.?free|devices? in (school|class))\b/.test(t)
  ) {
    return "phones";
  }

  return "generic";
}

// ─────────────────────────────────────────────────────────────────────────────
// SCAN ACTUAL TEXT FOR LOADED PHRASES
// Phrases the user actually wrote are surfaced first in the report.
// ─────────────────────────────────────────────────────────────────────────────

function scanForLoadedPhrases(text: string): MockReport["loadedPhrases"] {
  const found: MockReport["loadedPhrases"] = [];
  const seen = new Set<string>();

  for (const entry of PHRASE_DICT) {
    if (seen.has(entry.displayPhrase)) continue;
    const match = text.match(entry.pattern);
    if (match) {
      seen.add(entry.displayPhrase);
      found.push({
        phrase: match[0].toLowerCase(),
        whyItMatters: entry.whyItMatters,
        impact: entry.impact,
      });
    }
  }

  return found;
}

// ─────────────────────────────────────────────────────────────────────────────
// NEUTRAL REWRITE SELECTOR
// Picks the rewrite pair whose key phrase appears in the actual text.
// ─────────────────────────────────────────────────────────────────────────────

function pickNeutralRewrite(
  text: string,
  options: NeutralRewriteOption[]
): { original: string; neutral: string } {
  const lower = text.toLowerCase();
  for (const opt of options) {
    if (lower.includes(opt.keyPhrase)) {
      return { original: opt.original, neutral: opt.neutral };
    }
  }
  return { original: options[0].original, neutral: options[0].neutral };
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPIC DATA
// Full mock report content for every supported topic.
// ─────────────────────────────────────────────────────────────────────────────

const TOPIC_DATA: Record<
  TopicKey,
  {
    framingSummary: MockReport["framingSummary"];
    biasRiskScores: MockReport["biasRiskScores"];
    fallbackPhrases: MockReport["loadedPhrases"];
    claims: MockReport["claims"];
    fallacies: MockReport["fallacies"];
    missingPerspectives: MockReport["missingPerspectives"];
    neutralRewrites: NeutralRewriteOption[];
    socraticQuestions: MockReport["socraticQuestions"];
  }
> = {
  // ── AI IN SCHOOLS ──────────────────────────────────────────────────────────
  ai: {
    framingSummary: {
      topic: "AI and Academic Integrity in Schools",
      mainArgument:
        "The author argues that AI tools like ChatGPT undermine genuine learning, enable academic dishonesty, and should be restricted or banned from classrooms.",
      likelyStance: "Strongly opposed to student use of AI tools",
      tone: "Alarmed and moralistic",
      framingLens: "Academic integrity vs. technological inevitability",
    },
    biasRiskScores: {
      loadedLanguage: 8,
      evidenceQuality: 3,
      missingCounterarguments: 8,
      emotionalFraming: 7,
      overall: "Medium-High",
    },
    fallbackPhrases: [
      { phrase: "intellectual laziness", whyItMatters: "Character-based attack that substitutes for an argument about actual learning outcomes.", impact: "High" },
      { phrase: "academic dishonesty", whyItMatters: "Broad moral accusation that conflates many different behaviors under a single label.", impact: "High" },
      { phrase: '"shortcut generation"', whyItMatters: "Generational framing that dismisses an entire cohort without evidence.", impact: "Medium" },
      { phrase: "AI takeover", whyItMatters: "Dystopian framing borrowed from science fiction; applied without evidence of displacement.", impact: "High" },
      { phrase: "destroying critical thinking", whyItMatters: "Absolute causal claim with no mechanism or supporting evidence cited.", impact: "High" },
      { phrase: "replace teachers", whyItMatters: "Displacement framing triggers fear without evidence that replacement — not augmentation — is occurring.", impact: "High" },
      { phrase: '"the research is clear"', whyItMatters: "Appeals to unnamed research to silence debate without providing a citation.", impact: "Medium" },
    ],
    claims: [
      { claim: "AI makes students unable to think for themselves.", evidenceProvided: "None — stated as obvious fact.", risk: "Unsupported" },
      { claim: "Students who use AI to write are cheating.", evidenceProvided: "Assumed definition only — no institutional or scholarly definition cited.", risk: "Weak" },
      { claim: "ChatGPT will make learning obsolete.", evidenceProvided: "None — speculative worst-case framing.", risk: "Unsupported" },
      { claim: "Teachers cannot detect AI-generated writing.", evidenceProvided: "No citation — contradicted by evidence on detection tools.", risk: "Weak" },
    ],
    fallacies: [
      { name: "Slippery Slope", explanation: "Using AI for one task is presented as inevitably leading to a complete collapse of independent academic thinking — with no intermediate steps evidenced." },
      { name: "False Dilemma", explanation: "The text implies that the only options are a complete ban on AI or the total destruction of academic integrity, ignoring supervised, structured AI use." },
      { name: "Appeal to Tradition", explanation: "Pre-AI methods are treated as inherently superior without arguing why traditional difficulty translates to better learning outcomes." },
    ],
    missingPerspectives: [
      "Students who use AI responsibly as a research scaffold or writing aid are not represented.",
      "Teachers who have successfully integrated AI into their curriculum as a learning tool are absent.",
      "Research on AI as a cognitive scaffold for struggling or neurodivergent learners is not cited.",
      "Technology companies' stated educational goals and safety guidelines are not addressed.",
    ],
    neutralRewrites: [
      { keyPhrase: "cheat", original: "Students who use AI are cheating.", neutral: "Some educators argue that AI-assisted work may blur established lines around academic integrity, though others contend responsible use can support and accelerate learning." },
      { keyPhrase: "destroy", original: "AI is destroying students' ability to think critically.", neutral: "Some educators argue that unrestricted AI use may affect the development of independent critical thinking, while others contend it shifts cognitive effort toward higher-order skills." },
      { keyPhrase: "lazy", original: "AI tools are making students intellectually lazy and dependent.", neutral: "Critics suggest AI tools may reduce the effort students invest in certain tasks, while proponents argue they shift cognitive effort toward synthesis and evaluation." },
      { keyPhrase: "obsolete", original: "AI will make teachers and classrooms obsolete.", neutral: "Some argue that AI tools may reduce demand for certain traditional teaching roles, while others contend AI will augment rather than replace human educators." },
    ],
    socraticQuestions: [
      "What evidence would prove that AI use reduces critical thinking, rather than shifting the form it takes?",
      "Is using AI to assist with writing more similar to using a calculator in math, or to copying someone else's answers? What is the key distinction?",
      "Whose perspective is most absent from this argument? How might that person describe the same situation?",
      "The text uses the word 'cheating' — what definition of cheating is assumed? Is that definition stated or just implied?",
      "If AI became standard in professional workplaces, how should schools prepare students for that reality?",
    ],
  },

  // ── SCHOOL PHONE BANS ──────────────────────────────────────────────────────
  phones: {
    framingSummary: {
      topic: "School Phone Bans",
      mainArgument:
        "The author argues that phone bans harm student independence, constitute an authoritarian overreach, and were designed by administrators out of touch with student needs.",
      likelyStance: "Strongly opposed to phone bans",
      tone: "Critical and emotionally charged",
      framingLens: "Student freedom vs. administrative control",
    },
    biasRiskScores: {
      loadedLanguage: 8,
      evidenceQuality: 3,
      missingCounterarguments: 7,
      emotionalFraming: 9,
      overall: "Medium-High",
    },
    fallbackPhrases: [
      { phrase: "reckless policy", whyItMatters: "Implies careless decision-making without evidencing that characterization.", impact: "High" },
      { phrase: '"everyone knows"', whyItMatters: 'False consensus — "everyone" is rarely accurate and discourages critical examination.', impact: "Medium" },
      { phrase: "disastrous consequences", whyItMatters: "Catastrophizing language designed to amplify fear beyond what evidence supports.", impact: "High" },
      { phrase: "draconian measures", whyItMatters: "Loaded historical reference evoking extreme repression, applied without justifying the comparison.", impact: "High" },
      { phrase: "out-of-touch administrators", whyItMatters: "Ad hominem framing that attacks character rather than engaging with stated reasoning.", impact: "High" },
      { phrase: '"any reasonable person"', whyItMatters: "Implies disagreement is unreasonable; shuts down legitimate debate.", impact: "Medium" },
      { phrase: "authoritarian overreach", whyItMatters: "Extreme political framing applied to a school policy without justification.", impact: "High" },
    ],
    claims: [
      { claim: "This policy will destroy student independence.", evidenceProvided: "None", risk: "Unsupported" },
      { claim: "The research is clear: students need their phones.", evidenceProvided: "Vague reference — no study, author, or data cited.", risk: "Weak" },
      { claim: "Banning phones will inevitably create anxiety.", evidenceProvided: "None — stated as certainty with no causal mechanism shown.", risk: "Unsupported" },
      { claim: "Administrators fear what they do not understand.", evidenceProvided: "No evidence — speculative motive attribution.", risk: "Fallacy" },
    ],
    fallacies: [
      { name: "False Dilemma", explanation: "The text presents phone access and student independence as an either/or, ignoring nuanced middle-ground policies like limited phone zones or supervised use." },
      { name: "Appeal to Emotion", explanation: 'Words like "reckless," "disastrous," "draconian," and "authoritarian" trigger emotional responses rather than engaging evidence or logic.' },
      { name: "Hasty Generalization", explanation: '"Everyone knows" and "any reasonable person" generalize from no stated evidence base, treating one perspective as universal.' },
    ],
    missingPerspectives: [
      "The article does not include the perspective of teachers who support phone restrictions to reduce classroom distractions.",
      "No student voices who support the ban or report improved focus are cited.",
      "School administrators' rationale — including academic performance data or mental health research — is not presented.",
      "Parents who favor restrictions for child safety or attention reasons are entirely absent.",
    ],
    neutralRewrites: [
      { keyPhrase: "reckless", original: "This reckless policy will destroy student independence.", neutral: "Critics argue that the policy may limit student independence, though proponents contend it could reduce distractions and improve focus." },
      { keyPhrase: "authoritarian", original: "This is nothing short of authoritarian overreach in our schools.", neutral: "Opponents argue the policy represents an excessive restriction of student autonomy, while supporters contend it falls within schools' established authority over the learning environment." },
      { keyPhrase: "draconian", original: "These draconian measures strip teenagers of their autonomy.", neutral: "Critics argue these measures limit student autonomy in ways that may be counterproductive, while supporters contend structured boundaries support a focused learning environment." },
    ],
    socraticQuestions: [
      "What emotion does the phrase 'reckless policy' create in you as a reader? Is that emotion supported by evidence in the text?",
      "The author says 'the research is clear' — what specific research would you need to see to find this claim convincing?",
      "Whose perspective is missing from this argument? How might an administrator or supportive teacher describe the same situation?",
      "Is 'authoritarian overreach' an accurate description of a school rule? What assumptions does that comparison require you to accept?",
      "If you rewrote the opening sentence to be completely neutral, which words would you change first, and why?",
    ],
  },

  // ── CLIMATE CHANGE ─────────────────────────────────────────────────────────
  climate: {
    framingSummary: {
      topic: "Climate Policy and Economic Impact",
      mainArgument:
        "The author argues that aggressive climate policies prioritize ideological goals over economic reality, threatening jobs and energy security without proportionate environmental benefit.",
      likelyStance: "Skeptical of climate policy scope, not necessarily climate science",
      tone: "Dismissive of policy, economically concerned",
      framingLens: "Economic pragmatism vs. environmental activism",
    },
    biasRiskScores: {
      loadedLanguage: 7,
      evidenceQuality: 4,
      missingCounterarguments: 8,
      emotionalFraming: 7,
      overall: "Medium-High",
    },
    fallbackPhrases: [
      { phrase: '"green agenda"', whyItMatters: "Frames environmental policy as ideologically driven rather than evidence-based, implying hidden motive.", impact: "High" },
      { phrase: "job-killing regulations", whyItMatters: "Economic fear framing applied before evidence of actual employment impact is assessed.", impact: "High" },
      { phrase: "climate alarmism", whyItMatters: "Delegitimizes scientific concern as emotional overreaction without engaging the underlying evidence.", impact: "High" },
      { phrase: "radical environmentalists", whyItMatters: "Characterizes policy supporters as extreme without defining what moderate positions look like.", impact: "High" },
      { phrase: "energy poverty", whyItMatters: "Legitimate concern invoked rhetorically without evidence that proposed policies produce that outcome.", impact: "Medium" },
      { phrase: '"settled science"', whyItMatters: "Used dismissively to suggest scientific consensus is itself a form of political pressure rather than evidence.", impact: "Medium" },
      { phrase: "economy-destroying", whyItMatters: "Absolute economic outcome framing applied without economic modeling or citation.", impact: "High" },
    ],
    claims: [
      { claim: "Climate policies will destroy millions of jobs.", evidenceProvided: "No economic modeling or study cited.", risk: "Unsupported" },
      { claim: "Renewable energy cannot power a modern economy.", evidenceProvided: "Asserted without engaging available evidence on grid-scale renewables.", risk: "Weak" },
      { claim: "Climate targets are economically impossible to meet.", evidenceProvided: "No economic analysis cited — contradicted by studies not referenced.", risk: "Weak" },
      { claim: "Climate scientists have a political agenda.", evidenceProvided: "Motive attributed without evidence.", risk: "Fallacy" },
    ],
    fallacies: [
      { name: "Appeal to Consequences", explanation: "The argument that climate policy is bad because it would have bad economic outcomes does not engage the scientific evidence for inaction's costs — it conflates policy preference with factual dispute." },
      { name: "False Dilemma", explanation: "The text implies the only options are maintaining fossil fuel infrastructure or destroying the economy, ignoring transition frameworks and phased policy approaches." },
      { name: "Slippery Slope", explanation: "Any climate regulation is presented as inevitably leading to economic collapse, without evidence that intermediate policy steps cannot be calibrated." },
    ],
    missingPerspectives: [
      "Climate scientists and their specific findings on risk and uncertainty are not cited or engaged.",
      "Workers in rapidly growing renewable energy sectors are absent from the economic framing.",
      "Communities already experiencing climate-related economic losses (flooding, drought, crop failure) are not mentioned.",
      "Economic analyses supporting net job creation in green transition scenarios are not referenced.",
    ],
    neutralRewrites: [
      { keyPhrase: "agenda", original: "The radical green agenda will destroy our economy and eliminate millions of jobs.", neutral: "Critics argue that certain proposed climate policies carry significant short-term economic costs, while proponents contend that the long-term costs of climate inaction would be greater." },
      { keyPhrase: "alarmism", original: "This is nothing more than climate alarmism used to justify radical economic changes.", neutral: "Some argue that climate projections are overstated, while climate scientists contend their models reflect current evidence and peer-reviewed consensus." },
      { keyPhrase: "job-killing", original: "These job-killing regulations will devastate working families.", neutral: "Opponents of the policy argue it risks job losses in energy-intensive sectors, while supporters point to projected job creation in renewable industries." },
    ],
    socraticQuestions: [
      "What specific economic evidence would change your assessment of this text's claims about job losses?",
      "The text describes climate concern as 'alarmism' — what would a non-alarmist, evidence-based version of the same concern look like?",
      "Whose economic perspective is missing from this argument? How might communities affected by climate-related disasters frame the same policy debate?",
      "Is it possible to accept the scientific evidence for climate change while still disagreeing with a specific policy? How does this text handle that distinction?",
      "What claims in this text are about facts, and which are about values? Is that distinction made clearly?",
    ],
  },

  // ── COLLEGE ADMISSIONS ─────────────────────────────────────────────────────
  college: {
    framingSummary: {
      topic: "College Admissions Fairness",
      mainArgument:
        "The author argues that college admissions processes favor certain groups over others, undermining merit-based selection and denying qualified applicants their rightful place.",
      likelyStance: "Critical of current admissions practices, favoring merit-based criteria",
      tone: "Aggrieved and moralistic",
      framingLens: "Merit vs. equity in higher education",
    },
    biasRiskScores: {
      loadedLanguage: 7,
      evidenceQuality: 4,
      missingCounterarguments: 7,
      emotionalFraming: 8,
      overall: "Medium-High",
    },
    fallbackPhrases: [
      { phrase: '"rigged system"', whyItMatters: "Implies deliberate corruption without identifying a mechanism or providing evidence.", impact: "High" },
      { phrase: "deserving students", whyItMatters: "Moral framing that treats one admissions outcome as objectively just without defining the standard.", impact: "Medium" },
      { phrase: "unfair advantage", whyItMatters: "Frames equity considerations as zero-sum without examining institutional intent or historical context.", impact: "High" },
      { phrase: "hardworking applicants", whyItMatters: "Implies that students admitted through other criteria are not equally hardworking — an unsubstantiated contrast.", impact: "Medium" },
      { phrase: "reverse discrimination", whyItMatters: "Legally and semantically contested term used as settled fact to frame equity policies negatively.", impact: "High" },
      { phrase: "academic excellence ignored", whyItMatters: "Asserts that excellence is being discarded without evidence that admitted students underperform.", impact: "High" },
      { phrase: '"true merit"', whyItMatters: 'Treats "merit" as an objective, neutral measure without acknowledging that its definition is itself contested.', impact: "Medium" },
    ],
    claims: [
      { claim: "Merit is no longer the primary factor in admissions decisions.", evidenceProvided: "No institutional data cited — contradicted by available statistics at selective schools.", risk: "Weak" },
      { claim: "Qualified students are being denied spots they deserve.", evidenceProvided: "No definition of 'qualified' or 'deserve' provided; no evidence of outcomes cited.", risk: "Unsupported" },
      { claim: "Admissions offices are politically motivated.", evidenceProvided: "Motive attributed without internal evidence or institutional testimony.", risk: "Fallacy" },
      { claim: "The system punishes students for their background.", evidenceProvided: "Framing assumes the conclusion — no comparative outcome data cited.", risk: "Weak" },
    ],
    fallacies: [
      { name: "Zero-Sum Fallacy", explanation: "The text assumes that supporting access for underrepresented students necessarily harms other applicants — without engaging evidence about expanding overall capacity or multi-factor outcomes." },
      { name: "Appeal to Fairness", explanation: "Uses a contested definition of 'fairness' as if it were objective and universally agreed upon, without acknowledging that fairness in admissions is itself a values debate." },
      { name: "Hasty Generalization", explanation: "Isolated anecdotal cases are used to characterize the entire admissions system — without evidence that these cases are representative." },
    ],
    missingPerspectives: [
      "Admissions officers explaining their institutional reasoning and holistic review criteria are absent.",
      "Students from underrepresented backgrounds and their documented experiences of structural barriers are not included.",
      "Research on K–12 inequalities that shape college preparedness is not cited.",
      "Historical context of openly exclusionary admissions policies at selective universities is missing.",
    ],
    neutralRewrites: [
      { keyPhrase: "rigged", original: "The rigged admissions system denies deserving students their rightful spots.", neutral: "Critics argue that current admissions criteria disadvantage certain applicants, while supporters contend the policies address documented inequalities in educational opportunity." },
      { keyPhrase: "reverse discrimination", original: "This policy amounts to reverse discrimination against hardworking students.", neutral: "Opponents argue the policy disadvantages some applicants based on background, while proponents contend it counteracts structural barriers that affect other groups." },
      { keyPhrase: "merit", original: "True merit no longer matters in college admissions.", neutral: "Some critics argue that non-academic factors have grown in weight within admissions, while admissions officers contend that holistic review better predicts student success and campus contribution." },
    ],
    socraticQuestions: [
      "How does this text define 'merit'? Is that definition stated explicitly, or is it assumed? What are two different reasonable definitions of merit in admissions?",
      "The text describes certain students as 'deserving' — what standard of desert is being applied? Who decides?",
      "Whose perspective is most absent from this argument? How might that person describe the same admissions process?",
      "Is it possible to believe in merit-based admissions AND support considering socioeconomic background? How would you construct that argument?",
      "What evidence would you need to see to fairly evaluate whether the admissions system is 'rigged'?",
    ],
  },

  // ── SOCIAL MEDIA ───────────────────────────────────────────────────────────
  "social-media": {
    framingSummary: {
      topic: "Social Media and Youth Mental Health",
      mainArgument:
        "The author argues that social media platforms are deliberately engineered to be addictive, are causing a mental health crisis among young people, and require significant regulation.",
      likelyStance: "Strongly critical of social media platforms and current regulation",
      tone: "Alarmed and accusatory",
      framingLens: "Child safety vs. corporate profit and free expression",
    },
    biasRiskScores: {
      loadedLanguage: 8,
      evidenceQuality: 5,
      missingCounterarguments: 7,
      emotionalFraming: 9,
      overall: "Medium-High",
    },
    fallbackPhrases: [
      { phrase: '"addictive by design"', whyItMatters: "Asserts deliberate corporate intent as established fact — intent requires internal evidence not typically available publicly.", impact: "High" },
      { phrase: "toxic platforms", whyItMatters: "Absolute characterization treating all content and interaction as harmful regardless of context or user experience.", impact: "High" },
      { phrase: "exploit children", whyItMatters: "Criminal-level framing applied without legal or behavioral evidence establishing exploitation as defined.", impact: "High" },
      { phrase: "mental health epidemic", whyItMatters: "Oversimplifies complex, contested causation and may mischaracterize statistical trends in adolescent mental health.", impact: "Medium" },
      { phrase: "algorithmic manipulation", whyItMatters: "Frames content personalization as deliberate harm without establishing intent or showing mechanism.", impact: "High" },
      { phrase: "doom-scrolling crisis", whyItMatters: "Combines behavioral description with crisis framing, amplifying urgency beyond what evidence typically supports.", impact: "Medium" },
      { phrase: "no ability to resist", whyItMatters: "Removes human agency entirely, a claim that requires developmental evidence not cited.", impact: "High" },
    ],
    claims: [
      { claim: "Social media is the primary cause of teen depression and anxiety.", evidenceProvided: "Correlation cited as causation — no causal mechanism established.", risk: "Weak" },
      { claim: "Platforms deliberately engineer addictive experiences.", evidenceProvided: "Intent claim requires internal company documents not cited.", risk: "Weak" },
      { claim: "Children have no ability to resist these platforms.", evidenceProvided: "No developmental psychology research cited.", risk: "Unsupported" },
      { claim: "Regulation is the only solution to the crisis.", evidenceProvided: "No analysis of alternative interventions or evidence of regulatory effectiveness elsewhere.", risk: "Weak" },
    ],
    fallacies: [
      { name: "Post Hoc Fallacy", explanation: "Teen mental health declined after social media adoption; therefore social media caused the decline. The correlation does not establish causation — other variables (academic pressure, economic uncertainty) are not controlled for." },
      { name: "Appeal to Emotion", explanation: "The argument relies heavily on worst-case outcomes and emotionally charged language rather than statistical evidence or representative data." },
      { name: "False Dilemma", explanation: "The text implies the only options are banning or heavily regulating social media, or accepting a youth mental health crisis — ignoring digital literacy education, parental controls, and platform design reforms." },
    ],
    missingPerspectives: [
      "Young people who report positive social, mental health, and community benefits from online connections are absent.",
      "Researchers who dispute or qualify the causal link between social media and mental health are not cited.",
      "Platform designers explaining safety features, moderation efforts, and algorithmic changes are not represented.",
      "The role of other contributing factors — academic pressure, family dynamics, economic anxiety — is not examined.",
    ],
    neutralRewrites: [
      { keyPhrase: "exploit", original: "Social media companies are exploiting our children and deliberately destroying their mental health.", neutral: "Some researchers and advocates argue that social media platforms may contribute to mental health challenges among young users, while others note the social and community benefits these platforms provide." },
      { keyPhrase: "addictive", original: "These platforms are addictive by design, engineered to capture children's attention at any cost.", neutral: "Critics argue that platform design choices — such as infinite scroll and variable rewards — may promote prolonged use, while companies contend these features are designed to maximize relevance, not harm." },
      { keyPhrase: "epidemic", original: "Social media has caused a mental health epidemic among teenagers.", neutral: "Some studies show correlations between heavy social media use and certain mental health indicators, though researchers debate whether the relationship is causal and the degree of effect size." },
    ],
    socraticQuestions: [
      "The text says social media 'causes' mental health problems — what would you need to distinguish correlation from causation here?",
      "Is 'addictive by design' a factual claim or a framing choice? What evidence would settle the question of intent?",
      "Whose perspective is most absent from this argument? How might a teenager who relies on online communities for support describe the same platforms?",
      "What other factors — academic pressure, family dynamics, economic stress — might also explain the trends in teen mental health? Why might the text not mention them?",
      "If you were redesigning one social media feature to reduce harm while preserving benefit, what would you change and why?",
    ],
  },

  // ── PEER SUPPORT / SCHOOL COUNSELING ─────────────────────────────────────
  "peer-support": {
    framingSummary: {
      topic: "School Peer Support Programs",
      mainArgument:
        "The author argues that structured, school-supervised peer support programs provide meaningful mental health benefits, reduce stigma around help-seeking, and offer a scalable complement to professional counseling resources.",
      likelyStance: "Supportive of peer-led student wellness initiatives",
      tone: "Advocacy-oriented and evidence-referencing",
      framingLens: "Community resilience vs. professional-only mental health models",
    },
    biasRiskScores: {
      loadedLanguage: 4,
      evidenceQuality: 6,
      missingCounterarguments: 6,
      emotionalFraming: 5,
      overall: "Medium",
    },
    fallbackPhrases: [
      { phrase: "crisis", whyItMatters: "Urgency framing: signals that normal evaluative standards should be suspended — benefits the call to action but may overstate the baseline problem.", impact: "Medium" },
      { phrase: "epidemic", whyItMatters: "Medical contagion language applied to mental health trends; implies a rate and severity that individual data may not always support.", impact: "Medium" },
      { phrase: "life-saving", whyItMatters: "High-stakes framing that is difficult to contest and requires clinical outcome evidence that advocacy documents rarely provide.", impact: "High" },
      { phrase: "at-risk", whyItMatters: "Risk labelling can stigmatize the population it aims to support; 'students who need additional support' is typically more precise.", impact: "Medium" },
      { phrase: "falling through the cracks", whyItMatters: "Failure framing attributed to the institution without quantifying the gap or engaging what existing services currently cover.", impact: "Medium" },
      { phrase: "proven to work", whyItMatters: "Asserts efficacy without specifying what was proven, in what context, at what effect size, or compared to what alternative.", impact: "Medium" },
      { phrase: "overlooked", whyItMatters: "Implies deliberate neglect rather than resource constraints or differing priorities — a framing that requires evidence of intent.", impact: "Medium" },
    ],
    claims: [
      { claim: "Peer support programs reduce rates of student anxiety and depression.", evidenceProvided: "Some studies cited; effect size and generalizability not always specified.", risk: "Weak" },
      { claim: "Students are more likely to seek help from a peer than from a counselor.", evidenceProvided: "Plausible but often asserted without controlling for disclosure severity, age, or context.", risk: "Weak" },
      { claim: "School counselors are too overstretched to meet demand alone.", evidenceProvided: "Counselor-to-student ratios sometimes cited; the gap between demand and capacity is not always fully quantified.", risk: "Weak" },
      { claim: "Peer support programs are cost-effective.", evidenceProvided: "Asserted without a full cost-benefit analysis that includes training, supervision, liability, and long-term outcomes.", risk: "Unsupported" },
    ],
    fallacies: [
      { name: "Appeal to Popularity", explanation: "Wide adoption of peer support at other schools or in other countries is used as evidence of effectiveness — but adoption rates and efficacy are distinct claims that require separate evidence." },
      { name: "False Dilemma", explanation: "Peer programs are framed as the solution to a professional counseling gap, without engaging hybrid or alternative models such as expanded mental health staffing, telehealth partnerships, or structured referral systems." },
      { name: "Anecdotal Evidence", explanation: "Student testimonials, while valuable qualitatively, are used as primary evidence of program-level effectiveness without controlling for selection bias, self-report limitations, or other concurrent factors." },
    ],
    missingPerspectives: [
      "School counselors and psychologists who may raise concerns about scope-of-practice, liability, and the risk of over-relying on untrained peers for serious disclosures.",
      "Students who found peer support unhelpful, uncomfortable, or a barrier to accessing professional care.",
      "Parents and guardians whose consent, concerns, and views on peer-led mental health conversations are not represented.",
      "Research on cases where peer programs produced adverse outcomes — including inappropriate disclosure handling or reinforcement of harmful coping strategies.",
    ],
    neutralRewrites: [
      { keyPhrase: "crisis", original: "Students are in crisis and peer support is the answer.", neutral: "Some researchers argue that youth mental health needs have grown faster than available professional resources, and that structured peer programs may offer a scalable supplement — though the evidence base varies significantly by program model and population." },
      { keyPhrase: "life-saving", original: "These programs are life-saving for students who have nowhere else to turn.", neutral: "Advocates contend that peer support provides an accessible first point of contact for students who might not otherwise seek help; critics note that peer volunteers require careful supervision to handle serious disclosures safely." },
      { keyPhrase: "at-risk", original: "At-risk students are falling through the cracks without peer support.", neutral: "Students who may benefit from additional mental health support are not always reached by existing professional services; peer programs may reduce that access gap, though appropriate scope and supervision require careful delineation." },
    ],
    socraticQuestions: [
      "What specific evidence would distinguish a peer support program that helps from one that causes harm? What would a rigorous evaluation of this program look like?",
      "The argument assumes students prefer peer support over professional counseling — in what situations might the reverse be true, and does the text address those cases?",
      "What safeguards ensure peer volunteers don't encounter disclosures they are not equipped to handle? Does the text specify a referral and escalation protocol?",
      "Is 'peer support' one uniform thing, or are there meaningfully different models with different outcomes? Does the text distinguish between them?",
      "Who is responsible if a peer volunteer gives harmful advice or fails to escalate a crisis disclosure? How should that accountability be structured?",
    ],
  },

  // ── GENERIC FALLBACK ───────────────────────────────────────────────────────
  generic: {
    framingSummary: {
      topic: "Contested Policy Debate",
      mainArgument:
        "The author presents a strong position on a contested issue, using persuasive language that favors one perspective and employs emotional framing in place of systematic evidence.",
      likelyStance: "Advocating one side of a contested debate",
      tone: "Persuasive and assertive",
      framingLens: "Us vs. them / Progress vs. tradition",
    },
    biasRiskScores: {
      loadedLanguage: 6,
      evidenceQuality: 5,
      missingCounterarguments: 6,
      emotionalFraming: 6,
      overall: "Medium",
    },
    fallbackPhrases: [
      { phrase: "radical agenda", whyItMatters: "Combines two high-signal loaded terms to trigger distrust without substantiating the characterization.", impact: "High" },
      { phrase: "common sense", whyItMatters: "Frames one position as obvious, implying opponents lack basic reasoning — without engaging their arguments.", impact: "Medium" },
      { phrase: "everyone agrees", whyItMatters: "False consensus framing that discourages scrutiny of the claim being made.", impact: "Medium" },
      { phrase: "clearly biased", whyItMatters: "Accuses without specific evidence — 'clearly' signals the author expects you not to probe the claim.", impact: "High" },
      { phrase: "undeniable fact", whyItMatters: "Pre-empts scrutiny by framing the claim as beyond dispute before evidence is provided.", impact: "Medium" },
      { phrase: "they don't care", whyItMatters: "Attributes bad faith or indifference without evidence of intent.", impact: "High" },
      { phrase: "it's obvious that", whyItMatters: "Presents a contested claim as self-evident, bypassing the need for argument.", impact: "Medium" },
    ],
    claims: [
      { claim: "The evidence overwhelmingly supports this position.", evidenceProvided: "No specific evidence cited despite the strong claim.", risk: "Weak" },
      { claim: "Anyone who disagrees is misinformed.", evidenceProvided: "None — ad hominem substitution for engagement.", risk: "Fallacy" },
      { claim: "This will inevitably lead to serious harm.", evidenceProvided: "No causal mechanism or historical precedent cited.", risk: "Unsupported" },
      { claim: "The other side has no valid arguments.", evidenceProvided: "Opposing arguments are not presented or engaged.", risk: "Unsupported" },
    ],
    fallacies: [
      { name: "Appeal to Emotion", explanation: "The argument relies on emotionally charged language to create a sense of urgency or threat rather than providing and evaluating evidence." },
      { name: "Straw Man", explanation: "Opposing viewpoints are characterized in their weakest or most extreme form rather than engaged in their strongest version." },
      { name: "False Dilemma", explanation: "The text presents two options — typically the author's position and an extreme alternative — while ignoring the range of positions between them." },
    ],
    missingPerspectives: [
      "The perspective of those most directly affected by the policy described is not included.",
      "Expert voices with domain-specific knowledge are absent or unnamed.",
      "Historical context that might complicate the author's framing is not provided.",
      "Stakeholders who would be harmed by the author's preferred outcome are not represented.",
    ],
    neutralRewrites: [
      { keyPhrase: "radical", original: "This radical policy will have devastating consequences for everyone.", neutral: "Critics argue that the policy could have significant negative consequences, while proponents contend the benefits outweigh the risks and point to evidence from comparable contexts." },
      { keyPhrase: "obvious", original: "It's obvious that anyone who supports this doesn't understand the issue.", neutral: "Those who oppose the policy argue that supporters have not adequately considered its full implications." },
      { keyPhrase: "agenda", original: "This is nothing but a political agenda dressed up as policy.", neutral: "Critics argue that the policy is motivated more by political considerations than by evidence, while supporters contend it addresses a documented and urgent problem." },
    ],
    socraticQuestions: [
      "What is the strongest argument the other side could make? Does this text engage it?",
      "Which words in this text carry the most emotional weight? Would the argument survive if those words were replaced with neutral ones?",
      "What specific evidence would make you more or less confident in the author's main claim?",
      "Whose perspective is most absent from this argument? How might they describe the same situation?",
      "Is the author's goal to inform you, persuade you, or both? How can you tell?",
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
//
// To replace with real AI later:
//   export async function generateReport(text: string): Promise<MockReport> {
//     const res = await fetch('/api/analyze', { method: 'POST', body: JSON.stringify({ text }) });
//     return res.json();
//   }
// ─────────────────────────────────────────────────────────────────────────────

export function generateReport(text: string): MockReport {
  const topic = detectTopic(text);
  const data = TOPIC_DATA[topic];

  // Phrases actually found in the pasted text come first
  const fromText = scanForLoadedPhrases(text);
  const seenPhrases = new Set(fromText.map((p) => p.phrase));
  const fallbacks = data.fallbackPhrases.filter((p) => !seenPhrases.has(p.phrase));
  const loadedPhrases = [...fromText, ...fallbacks].slice(0, 7);

  // Neutral rewrite pair whose "original" key phrase appears in the text
  const neutralRewrite = pickNeutralRewrite(text, data.neutralRewrites);

  return {
    framingSummary: data.framingSummary,
    biasRiskScores: data.biasRiskScores,
    loadedPhrases,
    claims: data.claims,
    fallacies: data.fallacies,
    missingPerspectives: data.missingPerspectives,
    neutralRewrite,
    socraticQuestions: data.socraticQuestions,
  };
}
