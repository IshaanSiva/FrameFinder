import { FileSearch, Shield } from "lucide-react";
import { MockReport } from "@/lib/mockData";

interface FramingSummaryProps {
  data: MockReport["framingSummary"];
}

export default function FramingSummary({ data }: FramingSummaryProps) {
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
          <FileSearch className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "#1c2018" }}>Framing Summary</h3>
          <p className="text-xs" style={{ color: "#7a8e7c" }}>What this text is doing rhetorically</p>
        </div>
      </div>

      {/* Framing Lens hero */}
      <div
        className="mx-5 mt-5 overflow-hidden rounded-xl p-5"
        style={{
          background: "linear-gradient(135deg, #142418 0%, #1e2c20 55%, #253c28 100%)",
          boxShadow: "inset 0 0 40px rgba(16,185,129,0.08), 0 2px 10px rgba(14,32,18,0.20)",
        }}
      >
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
            <Shield className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="font-mono text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1">
              Framing Lens
            </p>
            <p className="text-[17px] font-black leading-snug" style={{ color: "#f4f0e6" }}>
              {data.framingLens}
            </p>
          </div>
        </div>
      </div>

      {/* Topic */}
      <div
        className="border-b mx-5 mt-4 pb-4"
        style={{ borderColor: "#e8e4da" }}
      >
        <p className="font-mono text-[8px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: "#a8bfaa" }}>
          Topic
        </p>
        <p className="text-lg font-black" style={{ color: "#1c2018" }}>{data.topic}</p>
      </div>

      {/* Detail rows */}
      <div className="px-5 pb-2">
        {(
          [
            { key: "mainArgument", label: "Main Argument" },
            { key: "likelyStance", label: "Likely Stance" },
            { key: "tone",         label: "Tone"          },
          ] as const
        ).map(({ key, label }) => (
          <div
            key={key}
            className="flex flex-col gap-1 border-b py-3.5 sm:flex-row sm:gap-6"
            style={{ borderColor: "#ece8de" }}
          >
            <span
              className="w-36 shrink-0 pt-0.5 font-mono text-[8px] font-black uppercase tracking-[0.18em]"
              style={{ color: "#a8bfaa" }}
            >
              {label}
            </span>
            <span className="text-sm leading-relaxed" style={{ color: "#1c2018" }}>
              {data[key]}
            </span>
          </div>
        ))}
      </div>

      <div className="px-5 pb-4 pt-2">
        <p className="text-[11px] italic" style={{ color: "#a8bfaa" }}>
          &ldquo;Likely stance&rdquo; reflects framing patterns, not a definitive characterization of the author&rsquo;s intent.
        </p>
      </div>
    </div>
  );
}
