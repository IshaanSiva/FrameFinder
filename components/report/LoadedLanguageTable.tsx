import { Highlighter, Sparkles } from "lucide-react";
import LockedFeatureCard from "./LockedFeatureCard";
import { MockReport } from "@/lib/mockData";

interface LoadedLanguageTableProps {
  phrases: MockReport["loadedPhrases"];
  isPro?: boolean;
  isSample?: boolean;
}

const impactConfig = {
  High:   { pill: "bg-rose-50 text-rose-700 border-rose-200",           dot: "bg-rose-400"    },
  Medium: { pill: "bg-amber-50 text-amber-700 border-amber-200",        dot: "bg-amber-400"   },
  Low:    { pill: "bg-emerald-50 text-emerald-700 border-emerald-200",  dot: "bg-emerald-400" },
};

function PhraseCard({ phrase }: { phrase: MockReport["loadedPhrases"][0] }) {
  const cfg = impactConfig[phrase.impact] ?? impactConfig.Medium;
  return (
    <div
      className="rounded-xl border p-3.5 transition-shadow hover:shadow-sm"
      style={{ backgroundColor: "#f4f9f4", borderColor: "#c4d4c4" }}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <code
          className="inline-block rounded-lg px-2.5 py-1 text-[12px] font-bold leading-snug"
          style={{
            backgroundColor: "#e8f0e8",
            border: "1px solid #c4d4c4",
            color: "#1e3a22",
            fontFamily: "inherit",
          }}
        >
          &ldquo;{phrase.phrase}&rdquo;
        </code>
        <span
          className={`shrink-0 mt-0.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${cfg.pill}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
          {phrase.impact}
        </span>
      </div>
      <p className="text-[12.5px] leading-relaxed" style={{ color: "#687070" }}>
        {phrase.whyItMatters}
      </p>
    </div>
  );
}

const lockedPreview = (
  <div className="space-y-2.5">
    {[0.7, 0.9, 0.75, 0.6].map((w, i) => (
      <div key={i} className="rounded-xl border p-3.5" style={{ backgroundColor: "#f4f9f4", borderColor: "#c4d4c4" }}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="h-6 rounded-lg" style={{ width: `${w * 160}px`, backgroundColor: "#dce8dc" }} />
          <div className="h-5 w-14 rounded-full" style={{ backgroundColor: "#dce8dc" }} />
        </div>
        <div className="h-3 w-full rounded" style={{ backgroundColor: "#e8ede8" }} />
        <div className="mt-1.5 h-3 w-3/4 rounded" style={{ backgroundColor: "#e8ede8" }} />
      </div>
    ))}
  </div>
);

export default function LoadedLanguageTable({ phrases, isPro = false, isSample = false }: LoadedLanguageTableProps) {
  const effectivePro = isPro || isSample;
  const visiblePhrases = effectivePro ? phrases : phrases.slice(0, 3);
  const lockedCount = phrases.length - 3;

  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
      style={{ backgroundColor: "#fdfbf5", borderColor: "#d8d3c8" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 border-b px-5 py-3.5"
        style={{ backgroundColor: "#f0ece0", borderColor: "#d8d3c8" }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ backgroundColor: "#dce8dc", color: "#2c5c34" }}
        >
          <Highlighter className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "#1c2018" }}>Loaded Language Detector</h3>
          <p className="text-xs" style={{ color: "#7a8e7c" }}>
            Emotionally charged phrases and their rhetorical effect
          </p>
        </div>
        {isSample ? (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs" style={{ color: "#7a8e7c" }}>{phrases.length} phrases</span>
            <span className="flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              <Sparkles className="h-2.5 w-2.5" />
              Included in Student Pro
            </span>
          </div>
        ) : (
          <span
            className="ml-auto rounded-full border px-2.5 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4", color: "#4a7050" }}
          >
            {effectivePro ? `${phrases.length} phrases` : `${visiblePhrases.length} shown`}
          </span>
        )}
      </div>

      {/* Card list */}
      <div className="space-y-2.5 p-4">
        {visiblePhrases.map((p) => (
          <PhraseCard key={p.phrase} phrase={p} />
        ))}
      </div>

      {!effectivePro && lockedCount > 0 && (
        <div className="px-4 pb-4">
          <LockedFeatureCard
            title="Full Loaded Language Heatmap"
            message={`FrameFinder found ${lockedCount} more loaded phrases. Unlock Pro to see the complete heatmap with severity rankings and rhetorical technique labels.`}
            previewContent={lockedPreview}
          />
        </div>
      )}
    </div>
  );
}
