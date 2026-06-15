"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Zap,
  ScrollText,
  BarChart3,
  Highlighter,
  Scale,
  AlertTriangle,
  Eye,
  PenLine,
  HelpCircle,
  FileSearch,
  ChevronDown,
} from "lucide-react";
import { MOCK_REPORT, SAMPLE_TEXT } from "@/lib/mockData";
import FramingSummary from "@/components/report/FramingSummary";
import BiasRiskScore from "@/components/report/BiasRiskScore";
import LoadedLanguageTable from "@/components/report/LoadedLanguageTable";
import ClaimsChecker from "@/components/report/ClaimsChecker";
import LogicalFallacies from "@/components/report/LogicalFallacies";
import MissingPerspectives from "@/components/report/MissingPerspectives";
import NeutralRewrite from "@/components/report/NeutralRewrite";
import SocraticModeToggle from "@/components/report/SocraticModeToggle";

// ── Types ────────────────────────────────────────────────────────────────────

type Tab =
  | "summary"
  | "scores"
  | "language"
  | "claims"
  | "fallacies"
  | "perspectives"
  | "rewrite"
  | "protools";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "summary",      label: "Summary",      icon: FileSearch    },
  { id: "scores",       label: "Bias Score",   icon: BarChart3     },
  { id: "language",     label: "Language",     icon: Highlighter   },
  { id: "claims",       label: "Claims",       icon: Scale         },
  { id: "fallacies",    label: "Fallacies",    icon: AlertTriangle },
  { id: "perspectives", label: "Perspectives", icon: Eye           },
  { id: "rewrite",      label: "Rewrite",      icon: PenLine       },
  { id: "protools",     label: "Pro Tools",    icon: HelpCircle    },
];

const RISK_META: Record<string, { bg: string; border: string; text: string }> = {
  "High":        { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700"    },
  "Medium-High": { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700"   },
  "Medium":      { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-600"   },
  "Low":         { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
};

// ── Phrase segmenting ────────────────────────────────────────────────────────

function segmentText(
  text: string,
  phrases: string[]
): Array<{ text: string; phraseIdx: number | null }> {
  if (!text || phrases.length === 0) return [{ text, phraseIdx: null }];
  const escaped = phrases.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const result: Array<{ text: string; phraseIdx: number | null }> = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) result.push({ text: text.slice(last, m.index), phraseIdx: null });
    const lower = m[0].toLowerCase();
    const idx = phrases.findIndex((p) => p.toLowerCase() === lower);
    result.push({ text: m[0], phraseIdx: idx >= 0 ? idx : 0 });
    last = m.index + m[0].length;
  }
  if (last < text.length) result.push({ text: text.slice(last), phraseIdx: null });
  return result;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SampleReportPage() {
  const [activeTab, setActiveTab]       = useState<Tab>("summary");
  const [socraticMode, setSocraticMode] = useState(false);
  const [sourceOpen, setSourceOpen]     = useState(false);

  const wordCount = SAMPLE_TEXT.trim().split(/\s+/).length;
  const phrases   = MOCK_REPORT.loadedPhrases.map((p) => p.phrase);
  const segments  = segmentText(SAMPLE_TEXT, phrases);
  const risk      = MOCK_REPORT.biasRiskScores.overall;
  const riskMeta  = RISK_META[risk] ?? RISK_META["Medium-High"];

  function renderTabContent() {
    switch (activeTab) {
      case "summary":      return <FramingSummary      data={MOCK_REPORT.framingSummary}                          />;
      case "scores":       return <BiasRiskScore        data={MOCK_REPORT.biasRiskScores}                          />;
      case "language":     return <LoadedLanguageTable  phrases={MOCK_REPORT.loadedPhrases}              isSample />;
      case "claims":       return <ClaimsChecker        claims={MOCK_REPORT.claims}                      isSample />;
      case "fallacies":    return <LogicalFallacies     fallacies={MOCK_REPORT.fallacies}                isSample />;
      case "perspectives": return <MissingPerspectives  perspectives={MOCK_REPORT.missingPerspectives}   isSample />;
      case "rewrite":      return <NeutralRewrite       rewrite={MOCK_REPORT.neutralRewrite}             isSample />;
      case "protools":     return (
        <SocraticModeToggle
          enabled={socraticMode}
          onToggle={setSocraticMode}
          questions={MOCK_REPORT.socraticQuestions}
        />
      );
    }
  }

  // Highlighted source text nodes (shared between panels)
  const HighlightedText = (
    <p className="select-text whitespace-pre-wrap break-words text-[13px] leading-[1.9]" style={{ color: "#1c2018" }}>
      {segments.map((seg, i) =>
        seg.phraseIdx !== null ? (
          <mark
            key={i}
            title={MOCK_REPORT.loadedPhrases[seg.phraseIdx]?.whyItMatters}
            className="cursor-help rounded-[3px] px-px"
            style={{
              backgroundColor: "rgba(251,113,133,0.16)",
              color: "#9f1239",
              textDecoration: "underline",
              textDecorationStyle: "wavy",
              textDecorationColor: "rgba(244,63,94,0.45)",
              textDecorationThickness: "1px",
            }}
          >
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </p>
  );

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse 90% 45% at 50% -10%, rgba(16,185,129,0.09) 0%, transparent 55%), " +
          "linear-gradient(175deg, #eaf4ea 0%, #f0ede3 18%, #f4f0e6 45%, #fdf9f0 100%)",
      }}
    >

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl px-4 pb-6 pt-12 text-center sm:px-6">
        {/* Pills */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-widest text-emerald-700">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            Live Demo
          </span>
          <span
            className="rounded-full border px-3 py-1 text-[10.5px] font-semibold"
            style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4", color: "#4a7050" }}
          >
            Full Pro Analysis Preview
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-[28px] font-black leading-tight tracking-tight sm:text-[34px]"
          style={{ color: "#1c2018" }}
        >
          From raw opinion to{" "}
          <span className="relative inline-block" style={{ color: "#166534" }}>
            structured insight
            <span
              className="absolute -bottom-0.5 left-0 h-[2px] w-full rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(22,101,52,0.4), transparent)" }}
            />
          </span>
        </h1>

        <p className="mx-auto mt-3 max-w-lg text-[13.5px] leading-relaxed" style={{ color: "#687070" }}>
          See exactly what FrameFinder produces. This analysis was generated from a short opinion piece
          about school phone policies using Gemini AI.
        </p>

        {/* Status chips */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span
            className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium"
            style={{ backgroundColor: "#fdfbf5", borderColor: "#d8d3c8", color: "#687070" }}
          >
            <FileText className="h-2.5 w-2.5" style={{ color: "#7a8e7c" }} />
            {wordCount} words analyzed
          </span>
          <span
            className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium"
            style={{ backgroundColor: "#fdfbf5", borderColor: "#d8d3c8", color: "#687070" }}
          >
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            {phrases.length} phrases flagged
          </span>
          <span
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${riskMeta.bg} ${riskMeta.border} ${riskMeta.text}`}
          >
            {risk} Risk
          </span>
          <span
            className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium"
            style={{ backgroundColor: "#fdfbf5", borderColor: "#d8d3c8", color: "#687070" }}
          >
            <Zap className="h-2.5 w-2.5 text-emerald-500" />
            Gemini 2.5 Flash Lite
          </span>
        </div>
      </div>

      {/* ── Demo composition ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1080px] px-3 sm:px-5">

        {/* Desktop: side-by-side */}
        <div className="hidden gap-4 md:grid md:grid-cols-[400px_1fr]">

          {/* LEFT — source card */}
          <div
            className="flex flex-col overflow-hidden rounded-2xl"
            style={{
              border: "1px solid #b8ccb8",
              boxShadow: "0 4px 28px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            {/* Forest green header bar */}
            <div
              className="flex flex-shrink-0 items-center justify-between px-4 py-3"
              style={{
                background: "linear-gradient(135deg, #152019 0%, #1e2c20 100%)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center gap-2">
                <ScrollText className="h-3.5 w-3.5 text-emerald-400/80" />
                <span className="font-mono text-[7.5px] font-black uppercase tracking-[0.22em] text-emerald-300/80">
                  Source Text
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 ring-1 ring-emerald-500/30">
                  {wordCount} words
                </span>
                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-bold text-rose-300 ring-1 ring-rose-500/30">
                  {phrases.length} flagged
                </span>
              </div>
            </div>

            {/* Warm paper body */}
            <div
              className="flex-1 overflow-y-auto px-5 py-4"
              style={{ backgroundColor: "#fdfbf5", maxHeight: "360px" }}
            >
              {HighlightedText}
            </div>

            {/* Footer */}
            <div
              className="flex flex-shrink-0 items-center justify-between border-t px-4 py-2"
              style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4" }}
            >
              <span className="text-[10px]" style={{ color: "#7a8e7c" }}>
                Hover phrases to preview analysis
              </span>
              <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: "#4a7050" }}>
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                analyzed
              </span>
            </div>
          </div>

          {/* RIGHT — report card */}
          <div
            className="flex flex-col overflow-hidden rounded-2xl"
            style={{
              border: "1px solid #c4d4c4",
              boxShadow: "0 4px 28px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05)",
              background: "linear-gradient(160deg, #eaf4ea 0%, #f0f7f0 25%, #f4f9f4 60%, #fdfbf5 100%)",
            }}
          >
            {/* Report card header */}
            <div
              className="flex flex-shrink-0 items-center justify-between border-b px-4 py-3"
              style={{ backgroundColor: "#f0ece0", borderColor: "#d8d3c8" }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-lg"
                  style={{ backgroundColor: "#dce8dc", color: "#2c5c34" }}
                >
                  <FileSearch className="h-3 w-3" />
                </div>
                <div>
                  <span className="text-[12.5px] font-bold" style={{ color: "#1c2018" }}>
                    Framing Analysis
                  </span>
                  <span className="ml-2 text-[11px]" style={{ color: "#7a8e7c" }}>
                    · School Phone Bans
                  </span>
                </div>
              </div>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${riskMeta.bg} ${riskMeta.border} ${riskMeta.text}`}
              >
                {risk} Risk
              </span>
            </div>

            {/* Tab bar */}
            <div
              className="flex flex-shrink-0 items-center gap-px overflow-x-auto px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ backgroundColor: "#dce8dc", borderBottom: "1px solid #c4d4c4" }}
            >
              {TABS.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] transition-all"
                    style={
                      isActive
                        ? {
                            backgroundColor: "#f0faf4",
                            border: "1px solid rgba(16,185,129,0.40)",
                            color: "#1a4030",
                            fontWeight: 600,
                            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                          }
                        : { color: "#687070", border: "1px solid transparent" }
                    }
                  >
                    <Icon className={`h-2.5 w-2.5 shrink-0 ${isActive ? "text-emerald-600" : ""}`} />
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div
              className="flex-1 overflow-y-auto p-3.5"
              style={{ maxHeight: "420px" }}
            >
              {renderTabContent()}
            </div>
          </div>
        </div>

        {/* Mobile: stacked */}
        <div className="flex flex-col gap-3 md:hidden">
          {/* Report first */}
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              border: "1px solid #c4d4c4",
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
              background: "linear-gradient(160deg, #eaf4ea 0%, #f0f7f0 35%, #fdfbf5 100%)",
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{ backgroundColor: "#f0ece0", borderColor: "#d8d3c8" }}
            >
              <span className="text-[12.5px] font-bold" style={{ color: "#1c2018" }}>
                Framing Analysis
              </span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${riskMeta.bg} ${riskMeta.border} ${riskMeta.text}`}
              >
                {risk} Risk
              </span>
            </div>
            <div
              className="flex items-center gap-px overflow-x-auto px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ backgroundColor: "#dce8dc", borderBottom: "1px solid #c4d4c4" }}
            >
              {TABS.map(({ id, label, icon: Icon }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] transition-all"
                    style={
                      isActive
                        ? { backgroundColor: "#f0faf4", border: "1px solid rgba(16,185,129,0.40)", color: "#1a4030", fontWeight: 600 }
                        : { color: "#687070", border: "1px solid transparent" }
                    }
                  >
                    <Icon className="h-2.5 w-2.5 shrink-0" />
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="p-3">{renderTabContent()}</div>
          </div>

          {/* Source accordion */}
          <div
            className="overflow-hidden rounded-2xl"
            style={{ border: "1px solid #b8ccb8", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <button
              onClick={() => setSourceOpen(!sourceOpen)}
              className="flex w-full items-center justify-between px-4 py-3"
              style={{ background: "linear-gradient(135deg, #152019 0%, #1e2c20 100%)" }}
            >
              <div className="flex items-center gap-2">
                <ScrollText className="h-3.5 w-3.5 text-emerald-400/80" />
                <span className="font-mono text-[7.5px] font-black uppercase tracking-[0.22em] text-emerald-300/80">
                  Source Text
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 ring-1 ring-emerald-500/30">
                  {wordCount} words
                </span>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-emerald-400/60 transition-transform duration-200 ${sourceOpen ? "rotate-180" : ""}`}
              />
            </button>
            {sourceOpen && (
              <div
                className="max-h-72 overflow-y-auto border-t px-5 py-4"
                style={{ backgroundColor: "#fdfbf5", borderColor: "#c4d4c4" }}
              >
                {HighlightedText}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1080px] px-3 pb-14 pt-6 sm:px-5">
        <div
          className="overflow-hidden rounded-2xl border"
          style={{
            backgroundColor: "#fdfbf5",
            borderColor: "#c4d4c4",
            boxShadow: "0 2px 20px rgba(0,0,0,0.06), inset 0 0 40px rgba(16,185,129,0.03)",
          }}
        >
          <div className="flex flex-col items-center gap-5 px-8 py-7 text-center sm:flex-row sm:text-left">
            <div className="flex-1">
              <p
                className="font-mono text-[8px] font-black uppercase tracking-[0.2em]"
                style={{ color: "#7a8e7c" }}
              >
                Try it yourself
              </p>
              <h2
                className="mt-1 text-xl font-black leading-snug"
                style={{ color: "#1c2018" }}
              >
                Analyze your own{" "}
                <span className="text-emerald-700">source text</span>
              </h2>
              <p
                className="mt-1.5 max-w-sm text-[13px] leading-relaxed"
                style={{ color: "#687070" }}
              >
                Paste any article, speech, or argument. Results in seconds. Free tier — no account required.
              </p>
            </div>
            <div className="flex flex-col items-center gap-1.5 sm:items-end">
              <Link
                href="/analyzer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3 text-[13.5px] font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-[1px] hover:bg-emerald-600 active:translate-y-0"
              >
                Start Analyzing
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-[10.5px]" style={{ color: "#a8bfaa" }}>
                Free · No account needed
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
