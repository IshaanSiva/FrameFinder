import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface LegalPageShellProps {
  badge: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalPageShell({
  badge,
  title,
  subtitle,
  lastUpdated,
  children,
}: LegalPageShellProps) {
  return (
    <main
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -15%, rgba(16,185,129,0.07) 0%, transparent 55%), " +
          "linear-gradient(175deg, #eaf4ea 0%, #f0ede3 15%, #f4f0e6 42%, #fdf9f0 100%)",
      }}
    >
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-10 sm:px-6">
        {/* Back link */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-[12.5px] text-[#7a8e7c] transition-colors hover:text-[#1c2018]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to FrameFinder
        </Link>

        {/* Page header */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-widest text-emerald-700">
            {badge}
          </div>
          <h1
            className="text-[30px] font-black leading-tight tracking-tight sm:text-[34px]"
            style={{ color: "#1c2018" }}
          >
            {title}
          </h1>
          <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "#687070" }}>
            {subtitle}
          </p>
          <p className="mt-2 text-[11.5px]" style={{ color: "#a8bfaa" }}>
            Last updated: {lastUpdated}
          </p>
        </div>

        {/* Document card */}
        <div
          className="rounded-2xl border px-7 py-8 sm:px-10 sm:py-10"
          style={{
            backgroundColor: "#fdfbf5",
            borderColor: "#d8d3c8",
            boxShadow:
              "0 2px 20px rgba(0,0,0,0.06), inset 0 0 60px rgba(16,185,129,0.015)",
          }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}

// ── Shared section primitives ─────────────────────────────────────────────────

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 last:mb-0">
      <h2
        className="mb-3.5 flex items-center gap-2.5 text-[15.5px] font-bold"
        style={{ color: "#1c2018" }}
      >
        <span
          className="h-4 w-[3px] flex-shrink-0 rounded-full"
          style={{ backgroundColor: "#10b981" }}
        />
        {title}
      </h2>
      <div
        className="space-y-2.5 pl-[13px] text-[13.5px] leading-relaxed"
        style={{ color: "#687070" }}
      >
        {children}
      </div>
    </section>
  );
}

export function LegalDivider() {
  return (
    <hr className="my-7" style={{ borderColor: "#e8e4da" }} />
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2">
          <span
            className="mt-[5px] h-1.5 w-1.5 flex-shrink-0 rounded-full"
            style={{ backgroundColor: "#10b981" }}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function LegalCallout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border px-5 py-4 text-[13px] leading-relaxed"
      style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4", color: "#3a6040" }}
    >
      {children}
    </div>
  );
}
