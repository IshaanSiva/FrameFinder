interface ScoreCardProps {
  label: string;
  score: number;
  maxScore?: number;
  inverse?: boolean;
  note?: string;
}

function normalColor(score: number) {
  if (score <= 3) return { bar: "bg-emerald-500", dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (score <= 6) return { bar: "bg-amber-500",   dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200"   };
  return               { bar: "bg-rose-500",     dot: "bg-rose-400",     text: "text-rose-700",     bg: "bg-rose-50",     border: "border-rose-200"     };
}

function inverseColor(score: number) {
  if (score <= 4) return { bar: "bg-rose-500",     dot: "bg-rose-400",     text: "text-rose-700",     bg: "bg-rose-50",     border: "border-rose-200"     };
  if (score <= 7) return { bar: "bg-amber-500",   dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200"   };
  return               { bar: "bg-emerald-500", dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
}

function normalLabel(score: number) {
  if (score <= 3) return "Low Risk";
  if (score <= 6) return "Medium Risk";
  if (score <= 8) return "High Risk";
  return "Very High Risk";
}

function inverseLabel(score: number) {
  if (score <= 4) return "Weak Evidence";
  if (score <= 7) return "Mixed Evidence";
  return "Strong Evidence";
}

export default function ScoreCard({ label, score, maxScore = 10, inverse = false, note }: ScoreCardProps) {
  const colors = inverse ? inverseColor(score) : normalColor(score);
  const riskLabel = inverse ? inverseLabel(score) : normalLabel(score);
  const pct = (score / maxScore) * 100;

  return (
    <div
      className="rounded-xl border p-4 transition-shadow duration-200 hover:shadow-md"
      style={{ backgroundColor: "#f4f9f4", borderColor: "#c4d4c4", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <span className="text-sm font-medium leading-tight" style={{ color: "#1c2018" }}>{label}</span>
          {note && <p className="mt-0.5 text-[10px]" style={{ color: "#7a8e7c" }}>{note}</p>}
        </div>
        <div className="shrink-0 text-right">
          <span className="text-2xl font-black tabular-nums" style={{ color: "#1c2018" }}>{score}</span>
          <span className="text-xs font-medium" style={{ color: "#7a8e7c" }}>/{maxScore}</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full" style={{ backgroundColor: "#ccdccc" }}>
        <div
          className={`h-2 rounded-full transition-all duration-700 ease-out ${colors.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex justify-end">
        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
          {riskLabel}
        </span>
      </div>
    </div>
  );
}
