import { BarChart3 } from "lucide-react";
import ScoreCard from "./ScoreCard";
import { MockReport } from "@/lib/mockData";

interface BiasRiskScoreProps {
  data: MockReport["biasRiskScores"];
}

const overallConfig: Record<string, { badge: string; bannerBg: string; bannerBorder: string; bar: string; desc: string }> = {
  Low:           { badge: "border-emerald-200 bg-emerald-50 text-emerald-700", bannerBg: "#f0fdf4", bannerBorder: "#bbf7d0", bar: "bg-emerald-500", desc: "Few framing concerns detected." },
  Medium:        { badge: "border-amber-200 bg-amber-50 text-amber-700",       bannerBg: "#fffbeb", bannerBorder: "#fde68a", bar: "bg-amber-500",   desc: "Some framing patterns worth examining." },
  "Medium-High": { badge: "border-orange-200 bg-orange-50 text-orange-700",    bannerBg: "#fff7ed", bannerBorder: "#fed7aa", bar: "bg-orange-500",  desc: "Notable framing patterns detected." },
  High:          { badge: "border-rose-200 bg-rose-50 text-rose-700",          bannerBg: "#fff1f2", bannerBorder: "#fecdd3", bar: "bg-rose-500",    desc: "Significant framing concerns present." },
};

export default function BiasRiskScore({ data }: BiasRiskScoreProps) {
  const cfg = overallConfig[data.overall] ?? overallConfig["Medium-High"];

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
      style={{ backgroundColor: "#fdfbf5", borderColor: "#d8d3c8" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ backgroundColor: "#f0ece0", borderColor: "#d8d3c8" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: "#dce8dc", color: "#2c5c34" }}
          >
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: "#1c2018" }}>Bias Risk Score</h3>
            <p className="text-xs" style={{ color: "#7a8e7c" }}>Possible indicators — not a definitive verdict</p>
          </div>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${cfg.badge}`}>
          {data.overall} Risk
        </span>
      </div>

      {/* Overall banner */}
      <div
        className="mx-5 mt-5 mb-1 flex items-center gap-3 rounded-xl border px-4 py-3"
        style={{ backgroundColor: cfg.bannerBg, borderColor: cfg.bannerBorder }}
      >
        <div className={`h-2 w-2 shrink-0 rounded-full ${cfg.bar}`} />
        <p className="text-sm" style={{ color: "#1c2018" }}>{cfg.desc}</p>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2">
        <ScoreCard label="Loaded Language"          score={data.loadedLanguage} />
        <ScoreCard label="Evidence Quality"         score={data.evidenceQuality} inverse note="Lower score = weaker evidence" />
        <ScoreCard label="Missing Counterarguments" score={data.missingCounterarguments} />
        <ScoreCard label="Emotional Framing"        score={data.emotionalFraming} />
      </div>
    </div>
  );
}
