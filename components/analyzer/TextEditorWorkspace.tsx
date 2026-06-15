"use client";

import { useState, useRef, useEffect } from "react";
import { Zap, FileText } from "lucide-react";
import { SAMPLE_TEXT } from "@/lib/mockData";

const FREE_WORD_LIMIT = 1_200;
const PRO_WORD_LIMIT  = 10_000;

const SCAN_CHECKS = [
  { label: "Framing",       dot: "bg-emerald-500" },
  { label: "Language",      dot: "bg-rose-400"    },
  { label: "Claims",        dot: "bg-amber-400"   },
  { label: "Evidence",      dot: "bg-orange-400"  },
  { label: "Perspectives",  dot: "bg-blue-400"    },
];

interface Props {
  onSubmit: (text: string) => Promise<void>;
  isPro: boolean;
  onFocusChange?: (focused: boolean) => void;
  theme?: "light" | "dark";
}

export default function TextEditorWorkspace({
  onSubmit,
  isPro,
  onFocusChange,
  theme = "light",
}: Props) {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const isSubmittingRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    const t = setTimeout(() => textareaRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  function handleFocus() {
    setFocused(true);
    onFocusChange?.(true);
  }

  function handleBlur() {
    setFocused(false);
    onFocusChange?.(false);
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const WORD_LIMIT = isPro ? PRO_WORD_LIMIT : FREE_WORD_LIMIT;
  const overLimit = wordCount > WORD_LIMIT;
  const canSubmit = wordCount >= 30 && !overLimit && !isGenerating;
  const wordPct = Math.min((wordCount / WORD_LIMIT) * 100, 100);
  const isEmpty = text.length === 0;

  async function handleGenerate() {
    if (isSubmittingRef.current || !canSubmit) return;
    isSubmittingRef.current = true;
    setIsGenerating(true);
    setSubmitError(null);
    try {
      await onSubmit(text);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[FrameFinder] Analysis error:", msg);
      setSubmitError(msg);
      setIsGenerating(false);
      isSubmittingRef.current = false;
    }
  }

  return (
    <>
      {/* Editing surface — always warm paper regardless of theme */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: "#fdfbf5", boxShadow: "inset 0 2px 8px rgba(0,0,0,0.07)" }}
      >

        {/* Focus sweep line — thin emerald gradient at top of editor */}
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-20 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/65 to-transparent transition-opacity duration-300 ${
            focused ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Empty-state composition — fades when user types */}
        <div
          className={`pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 px-8 pb-8 pt-10 transition-opacity duration-300 ${
            isEmpty ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl border-2"
            style={{
              backgroundColor: "#eef6ee",
              borderColor: "rgba(16,185,129,0.28)",
              boxShadow: "0 0 0 5px rgba(16,185,129,0.06), 0 4px 16px rgba(16,185,129,0.08)",
            }}
          >
            <FileText className="h-6 w-6 text-emerald-600/55" />
          </div>

          <div className="text-center">
            <p className="text-[16px] font-black tracking-tight text-[#1c2018]">
              Paste or begin typing to start
            </p>
            <p className="mx-auto mt-2 max-w-[280px] text-[12px] leading-relaxed text-[#7a8e7c]">
              Drop in an article, speech, or argument — this guide fades the moment you begin.
            </p>
          </div>

          <div className="flex w-full max-w-xs items-center gap-3">
            <div className="h-px flex-1 bg-[#e4ddd4]" />
            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-[#c4bfb8]">detects</span>
            <div className="h-px flex-1 bg-[#e4ddd4]" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {SCAN_CHECKS.map(({ label, dot }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-[#d4cfc5] bg-[#f0ece0] px-2.5 py-[4px] text-[10.5px] font-semibold"
                style={{ color: "#3a5a3e" }}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder=""
          className="relative z-20 min-h-[380px] w-full resize-none bg-transparent px-7 pb-6 pt-7 text-[14.5px] leading-[1.9] text-[#1c2018] focus:outline-none disabled:opacity-40"
          disabled={isGenerating}
          spellCheck={false}
        />
      </div>

      {/* Error messages */}
      {(overLimit || submitError) && (
        <div className={`space-y-2 px-5 py-2.5 ${
          isDark
            ? "border-t border-white/[0.06] bg-[#0c1510]"
            : "border-t border-[#d8d3c8] bg-[#fdfbf5]"
        }`}>
          {overLimit && (
            <div className={`rounded-xl border px-4 py-2.5 text-sm ${
              isDark
                ? "border-red-900/30 bg-red-950/30 text-red-400"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}>
              {isPro ? "Pro" : "Free"} plan is limited to {WORD_LIMIT.toLocaleString()} words.{" "}
              <span className="font-semibold">Upgrade to Pro</span> for unlimited analysis.
            </div>
          )}
          {submitError && (
            <div className={`rounded-xl border px-4 py-2.5 text-sm ${
              isDark
                ? "border-red-900/30 bg-red-950/30 text-red-400"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}>
              {submitError}
            </div>
          )}
        </div>
      )}

      {/* Action bar */}
      <div
        className={`flex items-center justify-between gap-4 border-t px-5 py-3.5 ${
          isDark ? "border-white/[0.06]" : "border-[#d0cbbf]"
        }`}
        style={{ backgroundColor: isDark ? "#0a120d" : "#ebe7dd" }}
      >
        {/* Word count + progress + sample */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span
            className={`shrink-0 tabular-nums text-[12px] font-medium ${
              overLimit
                ? isDark ? "text-red-400" : "text-rose-600"
                : isDark ? "text-slate-500" : "text-[#687070]"
            }`}
          >
            {wordCount.toLocaleString()}
            <span className={isDark ? "font-normal text-slate-600" : "font-normal text-[#7a8e7c]"}>
              {" "}/ {WORD_LIMIT.toLocaleString()}
            </span>
            <span className={isDark ? "ml-0.5 font-normal text-slate-600" : "ml-0.5 font-normal text-[#7a8e7c]"}>
              {" "}words
            </span>
          </span>
          {(
            <div className={`relative h-[3px] w-[72px] shrink-0 overflow-hidden rounded-full ${isDark ? "bg-white/[0.08]" : "bg-[#d8d3c8]"}`}>
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                  overLimit ? "bg-rose-500" : wordPct > 75 ? "bg-amber-400" : "bg-emerald-500"
                }`}
                style={{ width: `${wordPct}%` }}
              />
            </div>
          )}
          <button
            onClick={() => setText(SAMPLE_TEXT)}
            disabled={isGenerating}
            className={`hidden shrink-0 text-[11px] font-medium transition-colors disabled:opacity-40 sm:inline ${
              isDark
                ? "text-emerald-500 hover:text-emerald-400"
                : "text-emerald-700 hover:text-emerald-900"
            }`}
          >
            Load sample →
          </button>
        </div>

        {/* Status + CTA */}
        <div className="flex shrink-0 items-center gap-3">
          {wordCount > 0 && wordCount < 30 && (
            <span className={`hidden text-[11px] sm:inline ${isDark ? "text-slate-600" : "text-[#7a8e7c]"}`}>
              {30 - wordCount} more {30 - wordCount === 1 ? "word" : "words"} needed
            </span>
          )}
          {canSubmit && !isGenerating && (
            <span className={`hidden items-center gap-1.5 text-[11px] font-semibold sm:flex ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Ready
            </span>
          )}
          <button
            onClick={handleGenerate}
            disabled={!canSubmit}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13.5px] font-semibold transition-all duration-200 ${
              canSubmit
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:-translate-y-[1px] hover:bg-emerald-600 hover:shadow-emerald-500/30 active:translate-y-0 active:scale-[0.98]"
                : isDark
                ? "cursor-not-allowed bg-white/[0.05] text-slate-600"
                : "cursor-not-allowed bg-[#e8e4da] text-[#7a8e7c]"
            }`}
          >
            <Zap className="h-4 w-4" />
            {isGenerating ? "Running analysis…" : "Run Analysis"}
          </button>
        </div>
      </div>
    </>
  );
}
