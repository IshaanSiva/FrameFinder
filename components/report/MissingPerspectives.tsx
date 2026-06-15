import { Eye, Sparkles } from "lucide-react";
import LockedFeatureCard from "./LockedFeatureCard";
import { MockReport } from "@/lib/mockData";

interface MissingPerspectivesProps {
  perspectives: MockReport["missingPerspectives"];
  isPro?: boolean;
  isSample?: boolean;
}

export default function MissingPerspectives({ perspectives, isPro = false, isSample = false }: MissingPerspectivesProps) {
  const effectivePro = isPro || isSample;
  const [first, ...rest] = perspectives;
  const visiblePerspectives = effectivePro ? perspectives : [first];

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
          <Eye className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "#1c2018" }}>Missing Perspectives</h3>
          <p className="text-xs" style={{ color: "#7a8e7c" }}>Voices and viewpoints absent from this text</p>
        </div>
        {isSample ? (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs" style={{ color: "#7a8e7c" }}>{perspectives.length} identified</span>
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
            {perspectives.length} identified
          </span>
        ) : null}
      </div>

      <div className="px-5 pt-4 pb-2 space-y-2">
        {visiblePerspectives.map((p, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-xl border p-4"
            style={{ backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" }}
          >
            <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-black text-emerald-700 ring-1 ring-emerald-200">
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed" style={{ color: "#1c2018" }}>{p}</p>
          </div>
        ))}
      </div>

      {!effectivePro && (
        <div className="px-5 pb-5">
          <LockedFeatureCard
            title="Full Missing Perspectives Breakdown"
            message={`FrameFinder identified ${rest.length} more absent perspectives. Unlock Pro to view the complete breakdown.`}
            previewContent={
              <div className="space-y-2 px-1 pb-2">
                {rest.map((_, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border p-3" style={{ backgroundColor: "#f4f9f4", borderColor: "#c4d4c4" }}>
                    <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: "#c4d4c4" }} />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-full rounded" style={{ backgroundColor: "#dce8dc" }} />
                      <div className="h-3 w-3/4 rounded" style={{ backgroundColor: "#dce8dc" }} />
                    </div>
                  </div>
                ))}
              </div>
            }
          />
        </div>
      )}

      {effectivePro && <div className="pb-2" />}
    </div>
  );
}
