import { PenLine, Sparkles } from "lucide-react";
import LockedFeatureCard from "./LockedFeatureCard";
import { MockReport } from "@/lib/mockData";

interface NeutralRewriteProps {
  rewrite: MockReport["neutralRewrite"];
  isPro?: boolean;
  isSample?: boolean;
}

export default function NeutralRewrite({ rewrite, isPro = false, isSample = false }: NeutralRewriteProps) {
  const effectivePro = isPro || isSample;

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
      style={{ backgroundColor: "#fdfbf5", borderColor: "#d8d3c8" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 border-b px-6 py-4"
        style={{ backgroundColor: "#f0ece0", borderColor: "#d8d3c8" }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: "#dce8dc", color: "#2c5c34" }}
        >
          <PenLine className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "#1c2018" }}>Neutral Rewrite</h3>
          <p className="text-xs" style={{ color: "#7a8e7c" }}>See what changes when framing language is removed</p>
        </div>
        {isSample && (
          <span className="ml-auto flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
            <Sparkles className="h-2.5 w-2.5" />
            Included in Student Pro
          </span>
        )}
      </div>

      <div className="p-5 space-y-3">
        <div
          className="rounded-xl border p-4"
          style={{ backgroundColor: "#fff1f2", borderColor: "#fecdd3" }}
        >
          <p
            className="mb-1.5 font-mono text-[8px] font-black uppercase tracking-[0.18em]"
            style={{ color: "#e07080" }}
          >Original</p>
          <p className="text-sm italic leading-relaxed" style={{ color: "#1c2018" }}>
            &ldquo;{rewrite.original}&rdquo;
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <div className="h-px flex-1" style={{ backgroundColor: "#e0dbd0" }} />
          <span className="text-xs font-medium" style={{ color: "#7a8e7c" }}>reframed neutrally</span>
          <div className="h-px flex-1" style={{ backgroundColor: "#e0dbd0" }} />
        </div>

        <div className="rounded-xl border border-emerald-200 p-4" style={{ backgroundColor: "#f0fdf4" }}>
          <p className="mb-1.5 font-mono text-[8px] font-black uppercase tracking-[0.18em] text-emerald-600">
            Neutral Version
          </p>
          <p className="text-sm italic leading-relaxed" style={{ color: "#1c2018" }}>
            &ldquo;{rewrite.neutral}&rdquo;
          </p>
        </div>

        {effectivePro ? (
          <div
            className="flex items-center gap-2 rounded-xl border px-4 py-3"
            style={{ backgroundColor: "#f4f9f4", borderColor: "#c4d4c4" }}
          >
            <PenLine className="h-4 w-4 shrink-0" style={{ color: "#7a8e7c" }} />
            <p className="text-xs" style={{ color: "#687070" }}>
              Full document rewrite available — sentence-by-sentence neutral version with change explanations.
            </p>
          </div>
        ) : (
          <LockedFeatureCard
            title="Full Document Neutral Rewrite"
            message="Unlock Pro to view a sentence-by-sentence neutral rewrite of the entire text, with explanations for every change made."
          />
        )}
      </div>
    </div>
  );
}
