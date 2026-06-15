"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import {
  FileText, FileUp, PlayCircle, GitCompare, Zap, AlertTriangle, X,
} from "lucide-react";
import TextEditorWorkspace from "@/components/analyzer/TextEditorWorkspace";
import PdfUploadPanel, { type PdfSubmitMeta } from "@/components/analyzer/PdfUploadPanel";

type InputMode = "text" | "pdf" | "youtube" | "compare";

interface UsageData {
  plan: "free" | "pro";
  analysis_count: number;
  analysis_limit: number;
  pdf_upload_count: number;
  pdf_upload_limit: number | null;
  period_type: "weekly" | "monthly";
}

interface LimitError {
  errorCode: string;
  message: string;
}

const TABS = [
  { mode: "text"    as InputMode, icon: FileText,   label: "Paste Text",     locked: false, badge: undefined as string | undefined },
  { mode: "pdf"     as InputMode, icon: FileUp,     label: "Upload PDF",     locked: false, badge: "Pro" },
  { mode: "youtube" as InputMode, icon: PlayCircle, label: "YouTube / Link", locked: true,  badge: undefined },
  { mode: "compare" as InputMode, icon: GitCompare, label: "Compare",        locked: true,  badge: undefined },
];

const PIPELINE = ["Source", "Framing", "Claims", "Evidence", "Perspectives", "Report"] as const;

const ANNOTATION_CHIPS = [
  { label: "Framing lens",        dot: "bg-emerald-500" },
  { label: "Loaded language",     dot: "bg-red-400"     },
  { label: "Weak evidence",       dot: "bg-amber-400"   },
  { label: "Missing perspective", dot: "bg-blue-400"    },
];

const SCAN_ITEMS = [
  { dot: "bg-emerald-400", label: "Framing lens & stance"     },
  { dot: "bg-rose-400",    label: "Loaded language phrases"   },
  { dot: "bg-amber-400",   label: "Bias risk scores (4×)"     },
  { dot: "bg-orange-400",  label: "Claims & fallacies"        },
  { dot: "bg-blue-400",    label: "Missing perspectives"      },
  { dot: "bg-purple-400",  label: "Pro: Neutral rewrite"      },
  { dot: "bg-teal-400",    label: "Pro: Socratic questions"   },
];

function ComingSoonPanel({ mode }: { mode: "youtube" | "compare" }) {
  const Icon = mode === "youtube" ? PlayCircle : GitCompare;
  const title = mode === "youtube" ? "YouTube / Link" : "Compare Sources";
  const desc =
    mode === "youtube"
      ? "Analyze public rhetoric across YouTube videos and web articles."
      : "Compare how two different sources frame the same event or issue side-by-side.";
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl border"
        style={{ backgroundColor: "#e8f2e8", borderColor: "#b8d0b8" }}
      >
        <Icon className="h-5 w-5" style={{ color: "#4a7050" }} />
      </div>
      <div>
        <p className="text-sm font-semibold" style={{ color: "#1c2018" }}>{title} — Coming Soon</p>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed" style={{ color: "#4a6a4c" }}>{desc}</p>
      </div>
    </div>
  );
}

export default function AnalyzerPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<InputMode>("text");
  const [workspaceKey, setWorkspaceKey] = useState(0);
  // devOverride is null by default — real plan from /api/usage drives everything.
  // Set to "free" or "pro" via the toggle to preview a different plan visually.
  const [devOverride, setDevOverride] = useState<"free" | "pro" | null>(null);
  const [consoleFocused, setConsoleFocused] = useState(false);
  const submittingRef = useRef(false);

  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [limitError, setLimitError] = useState<LimitError | null>(null);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

  // Detect ?upgraded=true after Stripe checkout success and clean the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true") {
      setShowUpgradeBanner(true);
      params.delete("upgraded");
      const cleaned = params.size ? `?${params.toString()}` : "";
      window.history.replaceState({}, "", `${window.location.pathname}${cleaned}`);
    }
  }, []);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: UsageData | null) => {
        if (data) {
          setUsageData(data);
          if (process.env.NODE_ENV === "development") {
            console.log("[FrameFinder/plan] real plan from /api/usage:", data.plan);
          }
        }
      })
      .catch(() => {});
  }, []);

  // Single source of truth: real plan unless dev explicitly overrides.
  const realPlan = usageData?.plan ?? "free";
  const effectivePlan = devOverride ?? realPlan;
  const isPro = effectivePlan === "pro";
  // True only when the dev toggle is actively showing a different plan than reality.
  const devIsOverriding = devOverride !== null && devOverride !== realPlan;

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        "[FrameFinder/plan] realPlan:", realPlan,
        "| devOverride:", devOverride ?? "none",
        "| effectivePlan:", effectivePlan,
        "| isPro:", isPro,
      );
    }
  }, [realPlan, devOverride, effectivePlan, isPro]);

  const handleNewAnalysis = useCallback(() => {
    submittingRef.current = false;
    setActiveTab("text");
    setWorkspaceKey((k) => k + 1);
  }, []);

  const MAX_CHARS_TO_ANALYZE = 20_000;

  async function submit(
    text: string,
    sourceType: "paste" | "pdf" = "paste",
    pdfMeta?: PdfSubmitMeta
  ): Promise<void> {
    if (submittingRef.current) {
      console.warn("[FrameFinder] submit() blocked — already in flight");
      return;
    }
    submittingRef.current = true;
    sessionStorage.removeItem("ff_report");

    const wasTruncatedByChar = text.length > MAX_CHARS_TO_ANALYZE;
    const analyzedText = wasTruncatedByChar ? text.slice(0, MAX_CHARS_TO_ANALYZE) : text;

    const requestId = Math.random().toString(36).slice(2, 9);
    if (process.env.NODE_ENV === "development") {
      console.log("[FrameFinder] submit", {
        requestId, sourceType,
        rawChars: text.length, analyzedChars: analyzedText.length, wasTruncatedByChar,
        wordCount: analyzedText.trim().split(/\s+/).length,
        ts: new Date().toISOString(),
        ...(pdfMeta && { pdfMeta }),
      });
    }

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: analyzedText,
          sourceType,
          mode: isPro ? "pro" : "free",
          requestId,
          // Send extracted page count, not total — server enforces against what was actually analyzed.
          ...(pdfMeta && { pdfPageCount: pdfMeta.extractedPages }),
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          geminiMessage?: string; geminiStatus?: number;
          error?: string; errorCode?: string; requestId?: string;
        };

        if (res.status === 403 && body.errorCode) {
          setLimitError({ errorCode: body.errorCode, message: body.error ?? "Usage limit reached." });
          setWorkspaceKey((k) => k + 1);
          submittingRef.current = false;
          return;
        }

        const detail = body.geminiMessage ?? body.error ?? `HTTP ${res.status}`;
        throw new Error(
          `Analysis failed: ${detail}${body.requestId ? ` [req:${body.requestId}]` : ""}`
        );
      }
      const { report, topic, _usedMockFallback, fallbackReason } = await res.json();

      const pdfReportMeta = pdfMeta
        ? {
            totalPages: pdfMeta.totalPages,
            extractedPages: pdfMeta.extractedPages,
            analyzedChars: analyzedText.length,
            wasTruncatedByPage: pdfMeta.wasTruncatedByPage,
            wasTruncatedByChar,
          }
        : undefined;

      sessionStorage.setItem(
        "ff_report",
        JSON.stringify({
          report, topic, isPro,
          sourceText: analyzedText, sourceType,
          _usedMockFallback: _usedMockFallback ?? false,
          fallbackReason: fallbackReason ?? null,
          pdfMeta: pdfReportMeta,
        })
      );
      router.push("/analyzer/report");
    } catch (err) {
      submittingRef.current = false;
      throw err;
    }
  }

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">

      {/* ── Main workspace — rich sage-green editorial canvas ── */}
      <div
        className="relative flex flex-1 flex-col overflow-y-auto"
        style={{
          backgroundColor: "#dde8dd",
          backgroundImage: [
            "radial-gradient(ellipse 70% 55% at 28% 0%, rgba(16,185,129,0.18) 0%, transparent 60%)",
            "radial-gradient(ellipse 45% 40% at 90% 45%, rgba(16,185,129,0.10) 0%, transparent 65%)",
            "radial-gradient(circle, rgba(44,90,44,0.10) 1px, transparent 1px)",
          ].join(", "),
          backgroundSize: "auto, auto, 28px 28px",
          backgroundRepeat: "no-repeat, no-repeat, repeat",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.42, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative px-6 py-7 md:px-10"
        >

          {/* Stripe checkout success banner */}
          {showUpgradeBanner && (
            <div
              className="mb-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
              style={{ backgroundColor: "rgba(16,185,129,0.10)", borderColor: "rgba(16,185,129,0.28)" }}
            >
              <div className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 shrink-0 text-emerald-500" />
                <p className="text-[13px] font-semibold" style={{ color: "#1e2c20" }}>
                  Welcome to Student Pro! Your full access is now active.
                </p>
              </div>
              <button
                onClick={() => setShowUpgradeBanner(false)}
                className="shrink-0 rounded p-0.5 transition-colors hover:bg-emerald-500/10"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4 text-emerald-600" />
              </button>
            </div>
          )}

          {/* ── Header ── */}
          <div className="mb-8">

            {/* Brand pill — forest green on sage canvas */}
            <div
              className="mb-5 inline-flex items-center gap-2.5 rounded-full border px-4 py-1.5"
              style={{ backgroundColor: "#1e2c20", borderColor: "rgba(16,185,129,0.20)" }}
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[13px] font-medium" style={{ color: "#a8bfaa" }}>
                Rhetorical Analysis Engine
              </span>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-[30px] font-black leading-[1.06] tracking-tight sm:text-[38px]" style={{ color: "#1c2018" }}>
                  Analyze any source.
                </h1>
                <p className="mt-3 max-w-lg text-[14px] leading-relaxed" style={{ color: "#2c4a2e" }}>
                  Paste text or upload a PDF. FrameFinder surfaces{" "}
                  <span className="font-semibold" style={{ color: "#1e2c20" }}>
                    framing patterns, loaded language, and missing perspectives
                  </span>{" "}
                  — structured, not a chatbot.
                </p>

                {/* Annotation chips — ivory cards floating on sage */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {ANNOTATION_CHIPS.map(({ label, dot }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2 rounded-lg border px-3 py-1.5 shadow-sm"
                      style={{ backgroundColor: "#fdfbf5", borderColor: "#c0d0c0" }}
                    >
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                      <span className="whitespace-nowrap text-[11px] font-semibold tracking-wide" style={{ color: "#2c4a2e" }}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dev tier toggle — only rendered in development builds */}
              {process.env.NODE_ENV === "development" && (
                <div className="flex shrink-0 items-center gap-2 pt-1">
                  <span
                    className="select-none rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider"
                    style={{ backgroundColor: "rgba(30,44,32,0.15)", color: "#4a7050" }}
                  >
                    dev
                  </span>
                  <div
                    className="flex items-center rounded-full p-0.5"
                    style={{ backgroundColor: "#1e2c20", border: "1px solid rgba(16,185,129,0.20)" }}
                  >
                    <button
                      onClick={() => setDevOverride("free")}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${
                        !isPro ? "bg-white text-[#1c2018] shadow-sm" : "hover:opacity-80"
                      }`}
                      style={{ color: !isPro ? undefined : "#6a8a6a" }}
                    >
                      Free
                    </button>
                    <button
                      onClick={() => setDevOverride("pro")}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${
                        isPro ? "bg-amber-400 text-[#1c2018] shadow-sm" : "hover:opacity-80"
                      }`}
                      style={{ color: isPro ? undefined : "#6a8a6a" }}
                    >
                      Pro ✦
                    </button>
                  </div>
                  {devIsOverriding && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">
                      preview
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Usage limit error card ── */}
          {limitError && (
            <div
              className="mb-6 overflow-hidden rounded-2xl border"
              style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}
            >
              <div className="flex items-start gap-3.5 px-5 py-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-bold" style={{ color: "#1c2018" }}>
                    {limitError.errorCode === "WEEKLY_ANALYSIS_LIMIT" || limitError.errorCode === "MONTHLY_ANALYSIS_LIMIT"
                      ? "Analysis limit reached"
                      : limitError.errorCode === "WORD_LIMIT"
                      ? "Text too long"
                      : limitError.errorCode === "PDF_WEEKLY_LIMIT"
                      ? "PDF upload limit reached"
                      : limitError.errorCode === "PDF_PAGE_LIMIT"
                      ? "PDF too long"
                      : "Limit reached"}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed" style={{ color: "#687070" }}>
                    {limitError.message}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-[12.5px] font-semibold text-white shadow-sm transition-all hover:bg-emerald-600"
                    >
                      View Pricing →
                    </Link>
                    <button
                      onClick={() => setLimitError(null)}
                      className="text-[12.5px] font-medium transition-colors hover:text-[#1c2018]"
                      style={{ color: "#7a8e7c" }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setLimitError(null)}
                  className="mt-0.5 shrink-0 transition-colors hover:text-[#687070]"
                  style={{ color: "#c4bfb8" }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── Analysis Console — floating ivory card on sage canvas ── */}
          <div className="relative">

            {/* Atmospheric green glow behind the card */}
            <div
              className={`pointer-events-none absolute inset-4 -z-10 rounded-2xl blur-[36px] transition-opacity duration-500 ${
                consoleFocused ? "opacity-55" : "opacity-35"
              }`}
              style={{ backgroundColor: "#1a3820" }}
            />

            <div
              className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                consoleFocused
                  ? "border-emerald-500/50 shadow-[0_20px_60px_rgba(0,0,0,0.14),0_0_0_1px_rgba(16,185,129,0.18)]"
                  : "border-[#8ab09a]/40 shadow-[0_16px_48px_rgba(0,0,0,0.10),0_0_0_1px_rgba(44,90,44,0.12)]"
              }`}
              style={{ backgroundColor: "#fdfbf5" }}
            >

              {/* Top accent line */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

              {/* Dark forest header strip */}
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{ backgroundColor: "#1e2c20" }}
              >
                <div className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                <span className="ml-2 text-[11px] font-semibold tracking-wider" style={{ color: "#a8bfaa" }}>
                  FrameFinder Analysis
                </span>
                <div className="ml-auto h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-emerald-500/20" />
              </div>

              {/* Source mode tabs — light sage */}
              <div
                className="flex items-center gap-0.5 overflow-x-auto border-b px-3.5 pb-2.5 pt-2"
                style={{ backgroundColor: "#e8f2e8", borderColor: "#c0d8c0" }}
              >
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.mode;
                  return (
                    <button
                      key={tab.mode}
                      onClick={() => { if (!tab.locked) setActiveTab(tab.mode); }}
                      title={tab.locked ? `${tab.label} — Coming Soon` : undefined}
                      className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-[8px] text-[12.5px] font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-white border border-[#c0d0c0] font-semibold shadow-sm"
                          : tab.locked
                          ? "cursor-default"
                          : "cursor-pointer hover:bg-white/70"
                      }`}
                      style={{
                        color: isActive ? "#1c2018" : tab.locked ? "#9abcaa" : "#3a5a3e",
                      }}
                    >
                      <Icon
                        className="h-3.5 w-3.5 shrink-0"
                        style={{ color: isActive ? "#2c6a38" : undefined }}
                      />
                      {tab.label}
                      {tab.badge && !isPro && (
                        <span className="rounded border border-emerald-200 bg-emerald-50 px-1 py-px text-[8.5px] font-bold uppercase tracking-wide text-emerald-700">
                          Pro
                        </span>
                      )}
                      {tab.locked && (
                        <span
                          className="rounded border px-1.5 py-px text-[9px] font-medium"
                          style={{ backgroundColor: "#d8ecd8", borderColor: "#b0c8b0", color: "#7aaa7a" }}
                        >
                          Soon
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Pipeline strip — light sage */}
              <div
                className="flex min-w-max items-center overflow-x-auto border-b px-4 py-2.5"
                style={{ backgroundColor: "#e8f2e8", borderColor: "#c0d8c0" }}
              >
                <span
                  className="mr-3.5 shrink-0 font-mono text-[8px] font-black uppercase tracking-[0.24em]"
                  style={{ color: "#7aaa7a" }}
                >
                  Pipeline
                </span>
                {PIPELINE.map((label, i) => {
                  const isFirst = i === 0;
                  const isLast  = i === PIPELINE.length - 1;
                  return (
                    <div key={label} className="flex items-center">
                      {i > 0 && <div className="mx-2 h-px w-4 shrink-0" style={{ backgroundColor: "#b0c8b0" }} />}
                      <div
                        className={`flex items-center gap-1.5 ${
                          isLast ? "rounded-full border px-2.5 py-[3px]" : ""
                        }`}
                        style={isLast ? { backgroundColor: "rgba(16,185,129,0.10)", borderColor: "#7aaa8a" } : {}}
                      >
                        <span
                          className={`h-[5px] w-[5px] shrink-0 rounded-full ${isLast ? "bg-emerald-500" : ""}`}
                          style={!isLast ? { backgroundColor: isFirst ? "#2c6a38" : "#b0c8b0" } : {}}
                        />
                        <span
                          className="text-[10px] font-semibold"
                          style={{
                            color: isLast ? "#2c8a40" : isFirst ? "#1c3820" : "#8aaa8a",
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ── Ivory paper editor surface ── */}
              <div style={{ backgroundColor: "#fdfbf5" }}>
                <div className={activeTab !== "text" ? "hidden" : ""}>
                  <TextEditorWorkspace
                    key={workspaceKey}
                    onSubmit={(text) => submit(text, "paste")}
                    isPro={isPro}
                    onFocusChange={setConsoleFocused}
                  />
                </div>
                <div className={activeTab !== "pdf" ? "hidden" : ""}>
                  <PdfUploadPanel
                    key={workspaceKey}
                    onSubmit={(text, meta) => submit(text, "pdf", meta)}
                    isPro={isPro}
                  />
                </div>
                {(activeTab === "youtube" || activeTab === "compare") && (
                  <ComingSoonPanel mode={activeTab} />
                )}
              </div>
            </div>
          </div>

          {/* ── Dark forest analysis strip — anchors the workspace ── */}
          <div
            className="mt-4 overflow-hidden rounded-xl"
            style={{ backgroundColor: "#1e2c20" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-5 py-3.5">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="shrink-0 font-mono text-[8px] font-black uppercase tracking-[0.22em]" style={{ color: "rgba(16,185,129,0.55)" }}>
                  What gets analyzed
                </span>
                {SCAN_ITEMS.map(({ dot, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                    <span className="text-[11.5px]" style={{ color: "#a8bfaa" }}>{label}</span>
                  </div>
                ))}
              </div>
              <div className="flex shrink-0 items-center gap-4">
                {usageData && (
                  <span className="hidden text-[11px] sm:block" style={{ color: "#6a8a6a" }}>
                    {usageData.plan === "pro"
                      ? `Pro: ${usageData.analysis_count}/${usageData.analysis_limit} scans this month`
                      : `Free: ${usageData.analysis_count}/${usageData.analysis_limit} scans this week · PDF: ${usageData.pdf_upload_count}/${usageData.pdf_upload_limit ?? "∞"} used`}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-400">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Reports save automatically
                </span>
              </div>
            </div>
          </div>

          {/* Mobile: reset workspace */}
          <div className="mt-5 md:hidden">
            <button
              onClick={handleNewAnalysis}
              className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-[13px] font-semibold transition-all hover:-translate-y-[1px] active:scale-[0.98]"
              style={{ backgroundColor: "#d8e8d8", borderColor: "#b0c8b0", color: "#1e2c20" }}
            >
              <Zap className="h-3.5 w-3.5" />
              Reset workspace
            </button>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
