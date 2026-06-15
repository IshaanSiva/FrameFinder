"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  FileSearch,
  BarChart2,
  AlignLeft,
  CheckSquare,
  Users,
  PenLine,
  HelpCircle,
  ScrollText,
  ChevronDown,
  Copy,
  Check,
  Lock,
  Sparkles,
  Shield,
  Info,
  AlertTriangle,
  MessageSquare,
  Eye,

} from "lucide-react";
import type { MockReport, ImpactLevel, RiskLevel } from "@/lib/mockData";

type Tab = "summary" | "scores" | "language" | "claims" | "perspectives" | "rewrite" | "socratic";

const TABS: { id: Tab; label: string; icon: React.ElementType; proOnly?: boolean }[] = [
  { id: "summary",      label: "Summary",      icon: FileSearch  },
  { id: "scores",       label: "Scores",        icon: BarChart2   },
  { id: "language",     label: "Language",      icon: AlignLeft   },
  { id: "claims",       label: "Claims",        icon: CheckSquare },
  { id: "perspectives", label: "Perspectives",  icon: Users,      proOnly: true },
  { id: "rewrite",      label: "Rewrite",       icon: PenLine,    proOnly: true },
  { id: "socratic",     label: "Socratic",      icon: HelpCircle, proOnly: true },
];

const RISK_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  "High":        { text: "text-rose-600",    bg: "bg-rose-50",      border: "border-rose-200"      },
  "Medium-High": { text: "text-amber-600",   bg: "bg-amber-50",     border: "border-amber-200"     },
  "Medium":      { text: "text-amber-500",   bg: "bg-amber-50/60",  border: "border-amber-200/70"  },
  "Low":         { text: "text-emerald-600", bg: "bg-emerald-50",   border: "border-emerald-200"   },
};

const JUNK_TOPICS = new Set(["generic", "ai", "unknown", "untitled", "untitled analysis"]);

function resolveDisplayTopic(report: MockReport, savedTopic?: string): string {
  const fsTopic = report.framingSummary?.topic?.trim();
  if (fsTopic && !JUNK_TOPICS.has(fsTopic.toLowerCase())) return fsTopic;
  const st = savedTopic?.trim();
  if (st && !JUNK_TOPICS.has(st.toLowerCase())) return st;
  return "Saved Report";
}

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

// ── Sub-components ──────────────────────────────────────────────────────────

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct   = Math.min((value / 10) * 100, 100);
  const level = pct >= 70 ? "High" : pct >= 40 ? "Med" : "Low";
  const bar   = pct >= 70 ? "bg-rose-500"   : pct >= 40 ? "bg-amber-400"   : "bg-emerald-500";
  const txt   = pct >= 70 ? "text-rose-600" : pct >= 40 ? "text-amber-600" : "text-emerald-600";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12.5px] font-medium text-[#1c2018]">{label}</span>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className={`text-[10.5px] font-bold ${txt}`}>{level}</span>
          <span className="tabular-nums text-[10.5px] text-[#687070]">{value}/10</span>
        </div>
      </div>
      <div className="h-[5px] w-full overflow-hidden rounded-full" style={{ backgroundColor: "#ccdccc" }}>
        <div className={`h-full rounded-full transition-all duration-500 ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ImpactBadge({ impact }: { impact: ImpactLevel }) {
  return (
    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1 ${
      impact === "High"
        ? "bg-rose-50 text-rose-700 ring-rose-200/80"
        : "bg-amber-50 text-amber-700 ring-amber-200/80"
    }`}>
      {impact}
    </span>
  );
}

function RiskBadge({ risk }: { risk: RiskLevel }) {
  const s: Record<RiskLevel, string> = {
    Unsupported: "bg-rose-50 text-rose-700 ring-rose-200/80",
    Weak:        "bg-amber-50 text-amber-700 ring-amber-200/80",
    Fallacy:     "bg-purple-50 text-purple-700 ring-purple-200/80",
    Supported:   "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
  };
  return (
    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ring-1 ${s[risk]}`}>
      {risk}
    </span>
  );
}

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className={`flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium text-[#4a7050] transition-colors hover:text-[#1c2018] ${className ?? ""}`}
      style={{ backgroundColor: "#e8f2e8", borderColor: "#b8ccb8" }}
    >
      {copied ? <Check className="h-2.5 w-2.5 text-emerald-600" /> : <Copy className="h-2.5 w-2.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function ProLockOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 backdrop-blur-[2px]"
      style={{ backgroundColor: "rgba(234,245,234,0.96)" }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1e2c20] shadow-md">
        <Lock className="h-4 w-4 text-emerald-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-[#1c2018]">Pro feature</p>
        <p className="mt-1 max-w-[200px] text-[11px] leading-relaxed text-[#687070]">
          Upgrade to unlock all analysis tabs.
        </p>
      </div>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-4 py-2 text-xs font-bold text-[#1c2018] shadow-sm transition-all hover:from-amber-300 hover:to-orange-300"
      >
        <Sparkles className="h-3 w-3" />
        Unlock Pro
      </Link>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

interface Props {
  report: MockReport;
  defaultIsPro?: boolean;
  sourceText?: string;
  topic?: string;
  date?: string;
  wordCount?: number;
  sourceType?: string;
  usedMockFallback?: boolean;
  fallbackReason?: string | null;
  pdfTruncated?: boolean;
  pdfExtractedPages?: number;
  pdfTotalPages?: number;
}

export default function ReportWorkspace({
  report,
  defaultIsPro = false,
  sourceText,
  topic,
  date,
  wordCount,
  sourceType,
  usedMockFallback,
  fallbackReason,
  pdfTruncated,
  pdfExtractedPages,
  pdfTotalPages,
}: Props) {
  const [activeTab, setActiveTab]           = useState<Tab>("summary");
  const [isPro, setIsPro]                   = useState(defaultIsPro);
  const [expandedClaim, setExpandedClaim]   = useState<number | null>(null);
  const [flashIdx, setFlashIdx]             = useState<number | null>(null);
  const [splitPct, setSplitPct]             = useState(50);
  const [dragging, setDragging]             = useState(false);

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);

  const displayTopic = resolveDisplayTopic(report, topic);
  const sourceLabel  = sourceType === "pdf" ? "PDF" : sourceType === "paste" ? "Text" : undefined;
  const phrases      = report.loadedPhrases?.map((p) => p.phrase) ?? [];
  const segments     = segmentText(sourceText ?? "", phrases);
  const riskColor    = RISK_COLORS[report.biasRiskScores.overall] ?? RISK_COLORS["Low"];

  const scrollToPhrase = useCallback((phraseIdx: number) => {
    const el = leftScrollRef.current?.querySelector<HTMLElement>(`[data-phrase-idx="${phraseIdx}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setFlashIdx(phraseIdx);
      setTimeout(() => setFlashIdx(null), 1200);
    }
  }, []);

  // ── Drag-to-resize ──
  const onDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const raw  = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(Math.max(raw, 22), 72));
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  useEffect(() => {
    if (dragging) {
      document.body.style.cursor     = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor     = "";
      document.body.style.userSelect = "";
    }
    return () => {
      document.body.style.cursor     = "";
      document.body.style.userSelect = "";
    };
  }, [dragging]);

  return (
    <div
      className="flex flex-1 flex-col min-h-0 overflow-hidden"
      style={{ backgroundColor: "#f4f0e6" }}
    >

      {/* ── Report top bar ── */}
      <div
        className="flex flex-shrink-0 items-center justify-between gap-4 border-b px-5 py-3"
        style={{ backgroundColor: "#f0ece0", borderColor: "#d8d3c8" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="max-w-[300px] truncate text-[14px] font-bold leading-tight text-[#1c2018]"
            title={displayTopic}
          >
            {displayTopic}
          </span>
          <div className="hidden items-center gap-2 md:flex">
            {sourceLabel && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                {sourceLabel}
              </span>
            )}
            {wordCount !== undefined && wordCount > 0 && (
              <span className="text-[10.5px] text-[#687070]">
                {wordCount.toLocaleString()} words
              </span>
            )}
            {date && <span className="text-[10.5px] text-[#687070]">· {date}</span>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {usedMockFallback !== undefined && (
            <span className={`hidden rounded border px-2 py-0.5 text-[10px] font-medium sm:inline ${
              usedMockFallback
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}>
              {usedMockFallback
                ? `Sample${fallbackReason === "gemini_quota" ? " · Rate limited" : fallbackReason === "no_api_key" ? " · No key" : ""}`
                : "Gemini"}
            </span>
          )}
          <span className="select-none rounded bg-[#e8e4da] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-[#c4bfb8]">
            dev
          </span>
          <div className="flex items-center rounded-full border border-[#d4cfc5] bg-[#ede9df] p-0.5">
            <button
              onClick={() => setIsPro(false)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold leading-none transition-all ${
                !isPro ? "bg-white text-[#1c2018] shadow-sm" : "text-[#a8bfaa] hover:text-[#687070]"
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setIsPro(true)}
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold leading-none transition-all ${
                isPro ? "bg-amber-400 text-[#1c2018] shadow-sm" : "text-[#a8bfaa] hover:text-[#687070]"
              }`}
            >
              Pro ✦
            </button>
          </div>
        </div>
      </div>

      {/* ── Resizable split body ── */}
      <div
        ref={containerRef}
        className="flex flex-1 min-h-0 overflow-hidden p-3 gap-0"
        style={{ backgroundColor: "#f4f0e6" }}
      >

        {/* LEFT: warm-paper source document */}
        <div
          className="hidden md:flex flex-shrink-0 flex-col min-h-0 overflow-hidden rounded-2xl border shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
          style={{ width: `${splitPct}%`, backgroundColor: "#fdfbf5", borderColor: "#d8d3c8" }}
        >
          {/* Panel header */}
          <div
            className="flex flex-shrink-0 flex-col border-b"
            style={{ backgroundColor: "#f0ece0", borderColor: "#d8d3c8" }}
          >
            <div className="flex items-center gap-2 px-4 py-2.5">
              <ScrollText className="h-3.5 w-3.5 text-[#7a8e7c]" />
              <span className="font-mono text-[8.5px] font-black uppercase tracking-[0.2em] text-[#7a8e7c]">
                Source Text
              </span>
              {sourceText && wordCount && wordCount > 0 && (
                <span className="ml-auto tabular-nums text-[10px] text-[#7a8e7c]">
                  {wordCount.toLocaleString()} words
                </span>
              )}
            </div>
            {pdfTruncated && (
              <div className="flex items-start gap-2 border-t border-amber-200 bg-amber-50 px-4 py-2">
                <Info className="mt-px h-3 w-3 shrink-0 text-amber-600" />
                <p className="text-[10.5px] leading-snug text-amber-800">
                  {pdfExtractedPages && pdfTotalPages && pdfTotalPages > pdfExtractedPages
                    ? `Analyzed first ${pdfExtractedPages} of ${pdfTotalPages} pages of this PDF.`
                    : "Analyzed partial PDF excerpt only."}
                </p>
              </div>
            )}
          </div>

          {/* Scrollable text body */}
          <div ref={leftScrollRef} className="flex-1 min-h-0 overflow-y-auto px-6 py-5" style={{ backgroundColor: "#fdfbf5" }}>
            {sourceText ? (
              <p className="select-text whitespace-pre-wrap break-words text-[13.5px] leading-[1.9] text-[#1c2018]">
                {segments.map((seg, i) =>
                  seg.phraseIdx !== null ? (
                    <mark
                      key={i}
                      data-phrase-idx={seg.phraseIdx}
                      className={`rounded px-0.5 transition-all duration-300 ${
                        flashIdx === seg.phraseIdx
                          ? "bg-rose-200 text-rose-900 ring-2 ring-rose-400"
                          : "bg-rose-100/80 text-rose-800"
                      }`}
                    >
                      {seg.text}
                    </mark>
                  ) : (
                    <span key={i}>{seg.text}</span>
                  )
                )}
              </p>
            ) : (
              <div className="flex flex-col items-center gap-3 pt-16 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#d4cfc5] bg-[#ede8db]">
                  <FileText className="h-4 w-4 text-[#b8b0a0]" />
                </div>
                <p className="text-sm font-medium text-[#687070]">Source text not available</p>
                <p className="max-w-[190px] text-[11px] leading-relaxed text-[#8a9280]">
                  Original text is not stored with saved reports.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Draggable divider — desktop only ── */}
        <div
          className="relative hidden md:flex flex-shrink-0 w-3 cursor-col-resize select-none items-center justify-center group"
          onMouseDown={onDividerMouseDown}
        >
          {/* Full-height hairline */}
          <div
            className={`absolute inset-y-0 left-1/2 w-px -translate-x-1/2 transition-colors duration-150 ${
              dragging ? "bg-emerald-400/50" : "bg-[#d0cbbf] group-hover:bg-emerald-300/40"
            }`}
          />
          {/* Center grip pill */}
          <div
            className={`relative rounded-full transition-all duration-200 ${
              dragging
                ? "h-14 w-[3px] bg-emerald-400"
                : "h-9 w-[2px] bg-[#c4bfb8] group-hover:h-12 group-hover:w-[3px] group-hover:bg-emerald-400/70"
            }`}
          />
        </div>

        {/* RIGHT: warm beige insights engine */}
        <div
          className="relative flex flex-1 flex-col min-h-0 overflow-hidden rounded-2xl border shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
          style={{
            background: "linear-gradient(160deg, #e8f2e8 0%, #f0f7f0 35%, #f4f9f4 70%, #fdfbf5 100%)",
            borderColor: "#d4cfc5",
          }}
        >
          {/* Subtle emerald atmosphere */}
          <div
            className="pointer-events-none absolute right-0 top-0 h-52 w-52 opacity-[0.20] blur-3xl"
            style={{ background: "radial-gradient(circle at 100% 0%, rgba(16,185,129,0.30) 0%, transparent 65%)" }}
          />

          {/* Tab bar */}
          <div
            className="relative z-10 flex flex-shrink-0 items-center gap-px overflow-x-auto border-b px-2 py-2"
            style={{ backgroundColor: "#dce8dc", borderColor: "#c4d4c4" }}
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isLocked = tab.proOnly && !isPro;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all ${
                    isActive
                      ? "border font-semibold shadow-sm"
                      : "text-[#687070] hover:bg-[#f0ece0] hover:text-[#1c2018]"
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: "#f0faf4", borderColor: "rgba(16,185,129,0.40)", color: "#1a4030" }
                      : undefined
                  }
                >
                  <Icon className={`h-3 w-3 shrink-0 ${isActive ? "text-emerald-600" : ""}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {isLocked && <Lock className="h-2.5 w-2.5 text-amber-500/80" />}
                </button>
              );
            })}
          </div>

          {/* Scrollable insight content */}
          <div className="relative z-10 flex-1 min-h-0 overflow-y-auto">

            {/* ── SUMMARY ── */}
            <div className={activeTab !== "summary" ? "hidden" : "p-4 space-y-3"}>

              {/* Insight Snapshot — 4 at-a-glance metrics */}
              <div className="flex items-stretch gap-2">
                {/* Risk */}
                <div className={`flex flex-1 flex-col items-center justify-center rounded-xl border p-3 text-center ${riskColor.bg} ${riskColor.border}`}>
                  <p className={`text-[13px] font-black leading-tight ${riskColor.text}`}>
                    {report.biasRiskScores.overall}
                  </p>
                  <p className="mt-1 font-mono text-[7.5px] font-bold uppercase tracking-[0.15em] text-[#7a8e7c]">
                    Framing Risk
                  </p>
                </div>
                {/* Loaded phrases */}
                <div
                  className="flex flex-1 flex-col items-center justify-center rounded-xl border p-3 text-center"
                  style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4" }}
                >
                  <div className="flex items-center gap-1">
                    <AlignLeft className="h-2.5 w-2.5 text-rose-400" />
                    <p className="text-[18px] font-black leading-none text-[#1c2018]">
                      {report.loadedPhrases.length}
                    </p>
                  </div>
                  <p className="mt-1 font-mono text-[7.5px] font-bold uppercase tracking-[0.15em] text-[#7a8e7c]">
                    Phrases
                  </p>
                </div>
                {/* Claims */}
                <div
                  className="flex flex-1 flex-col items-center justify-center rounded-xl border p-3 text-center"
                  style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4" }}
                >
                  <div className="flex items-center gap-1">
                    <AlertTriangle className="h-2.5 w-2.5 text-amber-400" />
                    <p className="text-[18px] font-black leading-none text-[#1c2018]">
                      {report.claims.length}
                    </p>
                  </div>
                  <p className="mt-1 font-mono text-[7.5px] font-bold uppercase tracking-[0.15em] text-[#7a8e7c]">
                    Claims
                  </p>
                </div>
                {/* Missing perspectives */}
                <div
                  className="flex flex-1 flex-col items-center justify-center rounded-xl border p-3 text-center"
                  style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4" }}
                >
                  <div className="flex items-center gap-1">
                    <Eye className="h-2.5 w-2.5 text-[#7a8e7c]" />
                    <p className="text-[18px] font-black leading-none text-[#1c2018]">
                      {report.missingPerspectives?.length ?? "—"}
                    </p>
                  </div>
                  <p className="mt-1 font-mono text-[7.5px] font-bold uppercase tracking-[0.15em] text-[#7a8e7c]">
                    Gaps
                  </p>
                </div>
              </div>

              {/* Framing Lens — hero card */}
              <div
                className="overflow-hidden rounded-xl p-5"
                style={{
                  background: "linear-gradient(135deg, #142418 0%, #1e2c20 55%, #253c28 100%)",
                  boxShadow: "inset 0 0 50px rgba(16,185,129,0.08), 0 2px 12px rgba(14,32,18,0.25)",
                }}
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
                    <Shield className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[8.5px] font-black uppercase tracking-[0.2em] text-emerald-500">
                      Framing Lens
                    </p>
                    <p className="mt-1.5 text-[18px] font-black leading-snug" style={{ color: "#f4f0e6" }}>
                      {report.framingSummary.framingLens}
                    </p>
                    <p className="mt-1.5 text-[11.5px] leading-relaxed" style={{ color: "#a8bfaa" }}>
                      {report.framingSummary.mainArgument}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stance + Tone */}
              <div className="grid grid-cols-2 gap-2.5">
                <div
                  className="rounded-xl border p-3.5"
                  style={{ backgroundColor: "#edf5ed", borderColor: "#c4d4c4" }}
                >
                  <p className="font-mono text-[8.5px] font-black uppercase tracking-[0.2em] text-[#a8bfaa]">
                    Likely Stance
                  </p>
                  <p className="mt-1.5 text-[13px] font-semibold leading-snug text-[#1c2018]">
                    {report.framingSummary.likelyStance}
                  </p>
                </div>
                <div
                  className="rounded-xl border p-3.5"
                  style={{ backgroundColor: "#edf5ed", borderColor: "#c4d4c4" }}
                >
                  <p className="font-mono text-[8.5px] font-black uppercase tracking-[0.2em] text-[#a8bfaa]">
                    Tone
                  </p>
                  <p className="mt-1.5 text-[13px] font-semibold leading-snug text-[#1c2018]">
                    {report.framingSummary.tone}
                  </p>
                </div>
              </div>
            </div>

            {/* ── SCORES ── */}
            <div className={activeTab !== "scores" ? "hidden" : "p-4 space-y-3"}>
              <div className={`overflow-hidden rounded-xl border p-4 ${
                report.biasRiskScores.overall === "High"        ? "border-rose-200 bg-rose-50" :
                report.biasRiskScores.overall === "Medium-High" ? "border-amber-200 bg-amber-50" :
                report.biasRiskScores.overall === "Medium"      ? "border-amber-200/70 bg-amber-50/60" :
                "border-emerald-200 bg-emerald-50"
              }`}>
                <p className="font-mono text-[8.5px] font-black uppercase tracking-[0.2em] text-[#7a8e7c]">
                  Overall Framing Risk
                </p>
                <p className={`mt-1.5 text-[28px] font-black tracking-tight leading-none ${
                  report.biasRiskScores.overall === "High"        ? "text-rose-600" :
                  report.biasRiskScores.overall === "Medium-High" ? "text-amber-600" :
                  report.biasRiskScores.overall === "Medium"      ? "text-amber-500" :
                  "text-emerald-600"
                }`}>
                  {report.biasRiskScores.overall}
                </p>
              </div>

              <div className="space-y-4 rounded-xl border p-4" style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4" }}>
                <ScoreBar label="Loaded Language"          value={report.biasRiskScores.loadedLanguage} />
                <ScoreBar label="Evidence Quality"         value={report.biasRiskScores.evidenceQuality} />
                <ScoreBar label="Missing Counterarguments" value={report.biasRiskScores.missingCounterarguments} />
                <ScoreBar label="Emotional Framing"        value={report.biasRiskScores.emotionalFraming} />
              </div>

              <p className="px-1 text-[11px] leading-relaxed" style={{ color: "#7a8e7c" }}>
                Framing risk does not mean a source is false. It reflects how strongly the text guides interpretation through tone, evidence selection, and missing perspectives.
              </p>
            </div>

            {/* ── LANGUAGE ── */}
            <div className={activeTab !== "language" ? "hidden" : "p-4 space-y-2"}>
              <div className="mb-3 flex items-center gap-2">
                <p className="font-mono text-[8.5px] font-black uppercase tracking-[0.2em] text-[#7a8e7c]">
                  Loaded Phrases
                </p>
                <span className="rounded border px-1.5 py-px text-[9px] font-semibold text-[#4a7050]" style={{ backgroundColor: "#e0ece0", borderColor: "#b8ccb8" }}>
                  {report.loadedPhrases.length}
                </span>
                {sourceText && (
                  <span className="ml-auto text-[10.5px] text-[#a8bfaa]">
                    Click to locate in source ↑
                  </span>
                )}
              </div>
              {report.loadedPhrases.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToPhrase(idx)}
                  className="group w-full rounded-xl border p-3.5 text-left transition-all hover:border-emerald-300 hover:bg-[#edf5ed] hover:shadow-sm active:scale-[0.99]"
                  style={{ backgroundColor: "#f4f9f4", borderColor: "#c4d4c4" }}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[13px] font-semibold text-[#1c2018]">"{item.phrase}"</span>
                        <ImpactBadge impact={item.impact} />
                      </div>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-[#687070]">
                        {item.whyItMatters}
                      </p>
                    </div>
                    {sourceText && (
                      <span className="shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 opacity-0 transition-opacity group-hover:opacity-100">
                        Locate ↑
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* ── CLAIMS ── */}
            <div className={activeTab !== "claims" ? "hidden" : "p-4 space-y-2"}>
              <div className="mb-3 flex items-center gap-2">
                <p className="font-mono text-[8.5px] font-black uppercase tracking-[0.2em] text-[#7a8e7c]">
                  Claims
                </p>
                <span className="rounded border px-1.5 py-px text-[9px] font-semibold text-[#4a7050]" style={{ backgroundColor: "#e0ece0", borderColor: "#b8ccb8" }}>
                  {report.claims.length}
                </span>
              </div>
              {report.claims.map((item, idx) => (
                <div
                  key={idx}
                  className="overflow-hidden rounded-xl border"
                  style={{ backgroundColor: "#f4f9f4", borderColor: "#c4d4c4" }}
                >
                  <button
                    onClick={() => setExpandedClaim(expandedClaim === idx ? null : idx)}
                    className="flex w-full items-start gap-3 p-3.5 text-left transition-colors hover:bg-[#edf5ed]"
                  >
                    <RiskBadge risk={item.risk} />
                    <span className="flex-1 text-[13px] font-medium leading-snug text-[#1c2018]">
                      {item.claim}
                    </span>
                    <ChevronDown className={`mt-0.5 h-3.5 w-3.5 shrink-0 transition-transform ${
                      expandedClaim === idx ? "rotate-180 text-emerald-600" : "text-[#c4bfb8]"
                    }`} />
                  </button>
                  {expandedClaim === idx && (
                    <div className="border-t px-4 py-3" style={{ backgroundColor: "#e8f2e8", borderColor: "#c4d4c4" }}>
                      <p className="mb-1 font-mono text-[8.5px] font-black uppercase tracking-[0.15em] text-[#7a8e7c]">
                        Evidence Provided
                      </p>
                      <p className="text-[12px] leading-relaxed text-[#687070]">
                        {item.evidenceProvided}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {report.fallacies && report.fallacies.length > 0 && (
                <>
                  <div className="mb-1 mt-4 flex items-center gap-2">
                    <p className="font-mono text-[8.5px] font-black uppercase tracking-[0.2em] text-[#7a8e7c]">
                      Logical Fallacies
                    </p>
                    <span className="rounded border border-purple-200 bg-purple-50 px-1.5 py-px text-[9px] font-semibold text-purple-700">
                      {report.fallacies.length}
                    </span>
                  </div>
                  {report.fallacies.map((f, idx) => (
                    <div key={idx} className="rounded-xl border border-purple-200 bg-purple-50 p-3.5">
                      <p className="text-[12.5px] font-bold text-purple-800">{f.name}</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-[#687070]">{f.explanation}</p>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* ── PERSPECTIVES — Pro locked ── */}
            <div className={activeTab !== "perspectives" ? "hidden" : "relative min-h-[300px]"}>
              {!isPro ? (
                <>
                  <div className="pointer-events-none select-none blur-[3px]" aria-hidden="true">
                    <div className="p-4 space-y-2">
                      {["Missing viewpoint from policy supporters", "No academic research perspective cited", "Opposition voices not represented"].map((t, i) => (
                        <div
                          key={i}
                          className="flex gap-3 rounded-xl border p-4"
                          style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4" }}
                        >
                          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dce8dc] text-[10px] font-bold text-[#7a9a7e]">
                            {i + 1}
                          </span>
                          <p className="text-[13px] text-[#687070]">{t}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ProLockOverlay />
                </>
              ) : (
                <div className="p-4 space-y-2">
                  <div className="mb-3 flex items-center gap-2">
                    <p className="font-mono text-[8.5px] font-black uppercase tracking-[0.2em] text-[#7a8e7c]">
                      Missing Perspectives
                    </p>
                    <span className="rounded border px-1.5 py-px text-[9px] font-semibold text-[#4a7050]" style={{ backgroundColor: "#e0ece0", borderColor: "#b8ccb8" }}>
                      {report.missingPerspectives.length}
                    </span>
                  </div>
                  {report.missingPerspectives.map((p, i) => (
                    <div
                      key={i}
                      className="flex gap-3 rounded-xl border p-4"
                      style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4" }}
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700">
                        {i + 1}
                      </span>
                      <p className="text-[13px] leading-relaxed text-[#1c2018]">{p}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── REWRITE — Pro locked ── */}
            <div className={activeTab !== "rewrite" ? "hidden" : "relative min-h-[300px]"}>
              {!isPro ? (
                <>
                  <div className="pointer-events-none select-none blur-[3px]" aria-hidden="true">
                    <div className="p-4 space-y-3">
                      <div className="rounded-xl border p-4" style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4" }}>
                        <p className="mb-2 font-mono text-[8.5px] font-black uppercase tracking-[0.15em] text-[#7a8e7c]">Original</p>
                        <p className="text-[13px] leading-relaxed text-[#687070]">This reckless policy will destroy student independence.</p>
                      </div>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                        <p className="mb-2 font-mono text-[8.5px] font-black uppercase tracking-[0.15em] text-emerald-700">Neutral Rewrite</p>
                        <p className="text-[13px] leading-relaxed text-[#687070]">Critics argue the policy may limit independence, though proponents contend it could reduce distractions.</p>
                      </div>
                    </div>
                  </div>
                  <ProLockOverlay />
                </>
              ) : (
                <div className="p-4 space-y-3">
                  <p className="font-mono text-[8.5px] font-black uppercase tracking-[0.2em] text-[#7a8e7c]">
                    Neutral Rewrite
                  </p>
                  <div className="rounded-xl border p-4" style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4" }}>
                    <div className="mb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-rose-400" />
                        <p className="font-mono text-[8.5px] font-black uppercase tracking-[0.15em] text-[#7a8e7c]">
                          Original (loaded)
                        </p>
                      </div>
                      <CopyButton text={report.neutralRewrite.original} />
                    </div>
                    <p className="text-[13px] leading-relaxed text-[#1c2018]">
                      {report.neutralRewrite.original}
                    </p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="mb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <p className="font-mono text-[8.5px] font-black uppercase tracking-[0.15em] text-emerald-700">
                          Neutral Rewrite
                        </p>
                      </div>
                      <CopyButton text={report.neutralRewrite.neutral} />
                    </div>
                    <p className="text-[13px] leading-relaxed text-[#1c2018]">
                      {report.neutralRewrite.neutral}
                    </p>
                  </div>
                  <p className="px-1 text-[11px] leading-relaxed text-[#a8bfaa]">
                    The neutral rewrite removes loaded language and presents both perspectives without implying a preferred outcome.
                  </p>
                </div>
              )}
            </div>

            {/* ── SOCRATIC — Pro locked ── */}
            <div className={activeTab !== "socratic" ? "hidden" : "relative min-h-[300px]"}>
              {!isPro ? (
                <>
                  <div className="pointer-events-none select-none blur-[3px]" aria-hidden="true">
                    <div className="p-4 space-y-2">
                      {[
                        "What emotion does this word create in you as a reader?",
                        "What specific evidence would you need to find this claim convincing?",
                        "Whose perspective is missing from this argument?",
                      ].map((q, i) => (
                        <div
                          key={i}
                          className="flex gap-3 rounded-xl border p-4"
                          style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4" }}
                        >
                          <span className="text-[13px] font-black text-[#c4d4c4]">{i + 1}.</span>
                          <p className="text-[13px] leading-relaxed text-[#687070]">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <ProLockOverlay />
                </>
              ) : (
                <div className="p-4 space-y-2">
                  <div className="mb-3">
                    <p className="font-mono text-[8.5px] font-black uppercase tracking-[0.2em] text-[#7a8e7c]">
                      Socratic Questions
                    </p>
                    <p className="mt-1 text-[11px] text-[#a8bfaa]">
                      Use these to deepen your critical engagement with the source.
                    </p>
                  </div>
                  {report.socraticQuestions.map((q, i) => (
                    <div
                      key={i}
                      className="group flex gap-3 rounded-xl border p-4 transition-all hover:border-emerald-200"
                      style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4" }}
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700">
                        {i + 1}
                      </span>
                      <p className="flex-1 text-[13px] leading-relaxed text-[#1c2018]">{q}</p>
                      <CopyButton text={q} className="shrink-0 self-start opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
