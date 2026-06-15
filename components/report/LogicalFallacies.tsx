import { AlertTriangle, Sparkles } from "lucide-react";
import LockedFeatureCard from "./LockedFeatureCard";
import { MockReport } from "@/lib/mockData";

interface LogicalFallaciesProps {
  fallacies: MockReport["fallacies"];
  isPro?: boolean;
  isSample?: boolean;
}

const lockedPreview = (
  <div className="px-1 pb-2 space-y-3">
    {[["w-1/3", "w-full", "w-4/5"], ["w-2/5", "w-full", "w-3/4"], ["w-1/4", "w-5/6", "w-full"]].map(([a, b, c], i) => (
      <div key={i} className="rounded-xl border p-4 space-y-2" style={{ backgroundColor: "#f4f9f4", borderColor: "#c4d4c4" }}>
        <div className={`h-4 rounded ${a}`} style={{ backgroundColor: "#dce8dc" }} />
        <div className={`h-3 rounded ${b}`} style={{ backgroundColor: "#dce8dc" }} />
        <div className={`h-3 rounded ${c}`} style={{ backgroundColor: "#dce8dc" }} />
      </div>
    ))}
  </div>
);

export default function LogicalFallacies({ fallacies, isPro = false, isSample = false }: LogicalFallaciesProps) {
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
          style={{ backgroundColor: "#fef3c7", color: "#92400e" }}
        >
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "#1c2018" }}>Possible Logical Fallacies</h3>
          <p className="text-xs" style={{ color: "#7a8e7c" }}>
            Patterns that <em>may</em> indicate faulty reasoning — not definitive rulings
          </p>
        </div>
        {isSample ? (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs" style={{ color: "#7a8e7c" }}>{fallacies.length} detected</span>
            <span className="flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
              <Sparkles className="h-2.5 w-2.5" />
              Included in Student Pro
            </span>
          </div>
        ) : effectivePro ? (
          <span
            className="ml-auto rounded-full border px-2.5 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4", color: "#4a7050" }}
          >
            {fallacies.length} detected
          </span>
        ) : null}
      </div>

      <div className="px-5 pt-4">
        {/* Free: compact summary */}
        {!effectivePro && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">
              Possible fallacy patterns detected:{" "}
              {fallacies.map((f, i) => (
                <span key={f.name}>
                  <strong>{f.name}</strong>
                  {i < fallacies.length - 1 ? ", " : "."}
                </span>
              ))}
            </p>
            <p className="mt-1.5 text-xs text-amber-700">
              Fallacy identification is always interpretive. FrameFinder surfaces patterns — your critical judgment determines whether they apply.
            </p>
          </div>
        )}

        {/* Pro / Sample: detailed cards */}
        {effectivePro && (
          <div className="space-y-3">
            {fallacies.map((f) => (
              <div
                key={f.name}
                className="rounded-xl border p-4"
                style={{ backgroundColor: "#fffbeb", borderColor: "#fde68a" }}
              >
                <div className="mb-2">
                  <span className="rounded-full bg-amber-200 px-2.5 py-0.5 text-xs font-black text-amber-900">
                    {f.name}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#1c2018" }}>{f.explanation}</p>
              </div>
            ))}
            <p className="pb-1 text-[11px]" style={{ color: "#a8bfaa" }}>
              Fallacy identification is always interpretive. FrameFinder surfaces patterns — your critical judgment determines whether they apply.
            </p>
          </div>
        )}
      </div>

      {!effectivePro && (
        <div className="px-5 py-4">
          <LockedFeatureCard
            title="Fallacy Blueprint"
            message="Unlock the full Fallacy Blueprint to see a detailed explanation of each detected pattern, why it matters, and how to address it in your analysis."
            previewContent={lockedPreview}
          />
        </div>
      )}

      {effectivePro && <div className="pb-3" />}
    </div>
  );
}
