import { Scale, Sparkles } from "lucide-react";
import LockedFeatureCard from "./LockedFeatureCard";
import { MockReport } from "@/lib/mockData";

interface ClaimsCheckerProps {
  claims: MockReport["claims"];
  isPro?: boolean;
  isSample?: boolean;
}

const riskStyles: Record<string, string> = {
  Unsupported: "bg-rose-50 text-rose-700 border border-rose-200",
  Weak:        "bg-amber-50 text-amber-700 border border-amber-200",
  Fallacy:     "bg-purple-50 text-purple-700 border border-purple-200",
  Supported:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
};

const lockedPreview = (
  <div className="space-y-3 px-1 pb-2">
    {[["w-2/3", "w-full"], ["w-4/5", "w-3/4"], ["w-1/2", "w-5/6"]].map(([a, b], i) => (
      <div key={i} className="rounded-lg border p-3 space-y-2" style={{ backgroundColor: "#f4f9f4", borderColor: "#c4d4c4" }}>
        <div className={`h-3 rounded ${a}`} style={{ backgroundColor: "#dce8dc" }} />
        <div className={`h-3 rounded ${b}`} style={{ backgroundColor: "#dce8dc" }} />
        <div className="h-5 w-20 rounded-full" style={{ backgroundColor: "#dce8dc" }} />
      </div>
    ))}
  </div>
);

export default function ClaimsChecker({ claims, isPro = false, isSample = false }: ClaimsCheckerProps) {
  const effectivePro = isPro || isSample;
  const visibleClaims = effectivePro ? claims : claims.slice(0, 1);

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
          <Scale className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: "#1c2018" }}>Claims vs. Evidence Checker</h3>
          <p className="text-xs" style={{ color: "#7a8e7c" }}>What is claimed vs. what is actually proven</p>
        </div>
        {isSample ? (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs" style={{ color: "#7a8e7c" }}>{claims.length} claims</span>
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
            {claims.length} claims
          </span>
        ) : null}
      </div>

      <div className="px-5 pt-4 space-y-3">
        {visibleClaims.map((claim, i) => (
          <div
            key={i}
            className="rounded-xl border p-4 space-y-2.5"
            style={{ backgroundColor: "#f4f9f4", borderColor: "#c4d4c4" }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className="font-mono text-[8px] font-black uppercase tracking-[0.18em] mb-1"
                  style={{ color: "#a8bfaa" }}
                >Claim</p>
                <p className="text-sm font-medium" style={{ color: "#1c2018" }}>&ldquo;{claim.claim}&rdquo;</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskStyles[claim.risk] ?? riskStyles.Weak}`}>
                {claim.risk}
              </span>
            </div>
            <div>
              <p
                className="font-mono text-[8px] font-black uppercase tracking-[0.18em] mb-0.5"
                style={{ color: "#a8bfaa" }}
              >Evidence Provided</p>
              <p className="text-sm" style={{ color: "#687070" }}>{claim.evidenceProvided}</p>
            </div>
          </div>
        ))}
      </div>

      {!effectivePro && (
        <div className="px-5 py-4">
          <LockedFeatureCard
            title="Full Claims vs. Evidence Audit"
            message={`FrameFinder detected ${claims.length - 1} more unsupported or weakly evidenced claims. Upgrade to Student Pro to view the complete audit.`}
            previewContent={lockedPreview}
          />
        </div>
      )}

      {effectivePro && <div className="pb-2" />}
    </div>
  );
}
