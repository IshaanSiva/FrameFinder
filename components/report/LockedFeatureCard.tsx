import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";

interface LockedFeatureCardProps {
  title: string;
  message: string;
  previewContent?: React.ReactNode;
}

export default function LockedFeatureCard({
  title,
  message,
  previewContent,
}: LockedFeatureCardProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-lg shadow-slate-900/30">

      {/* Subtle grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Blurred preview — inverted so white shapes show on dark */}
      {previewContent && (
        <div className="select-none pointer-events-none blur-sm opacity-[0.12] saturate-0 invert px-5 pt-5 pb-20">
          {previewContent}
        </div>
      )}

      {/* Lock overlay */}
      <div
        className={`relative ${
          previewContent
            ? "absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent pt-14 pb-6 px-5"
            : "px-6 py-7"
        } flex flex-col items-center text-center gap-3`}
      >
        {/* Lock icon */}
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm shadow-inner">
          <Lock className="h-5 w-5 text-white/90" />
        </div>

        {/* Copy */}
        <div className="space-y-1">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mx-auto max-w-xs text-xs leading-relaxed text-slate-400">{message}</p>
        </div>

        {/* CTA — amber gold that pops against the dark */}
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-md shadow-amber-900/30 hover:from-amber-300 hover:to-orange-300 transition-all duration-200 hover:shadow-amber-500/30 hover:shadow-lg"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Unlock Pro
        </Link>
      </div>
    </div>
  );
}
