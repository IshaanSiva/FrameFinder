import PricingCard from "@/components/pricing/PricingCard";
import Link from "next/link";
import {
  HelpCircle,
  BookOpen,
  MessageSquare,
  Users,
  Zap,
  ChevronDown,
} from "lucide-react";

// ── Plan data ────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Start developing your rhetorical eye. No credit card required.",
    features: [
      { text: "3 scans / week" },
      { text: "1,200-word text limit" },
      { text: "1 PDF upload / week · 10-page max" },
      { text: "Framing summary" },
      { text: "Framing risk scores (4 indicators)" },
      { text: "Loaded language heatmap" },
      { text: "Claims & evidence analysis" },
      { text: "Logical fallacy detection" },
      { text: "Saved reports" },
      { text: "Missing perspectives", locked: true },
      { text: "Neutral rewrite", locked: true },
      { text: "Socratic questions", locked: true },
    ],
    cta: "Get Started Free",
    href: "/analyzer",
    featured: false,
    variant: "default" as const,
  },
  {
    name: "Student Pro",
    price: "$7.99",
    period: "/month",
    description: "Everything you need for AP Lang, AP Gov, debate, and MUN research.",
    features: [
      { text: "100 scans / month" },
      { text: "10,000-word text limit" },
      { text: "PDF uploads up to 50 pages" },
      { text: "Loaded language heatmap" },
      { text: "Claims & evidence analysis" },
      { text: "Logical fallacy detection" },
      { text: "Full missing perspectives" },
      { text: "Full neutral rewrite" },
      { text: "Socratic questions" },
      { text: "Saved report history" },
      { text: "AP Lang / debate analysis modes" },
      { text: "PDF export of reports (coming soon)" },
    ],
    cta: "Start Student Pro",
    href: "/analyzer",
    featured: true,
    badge: "Most Popular",
    variant: "default" as const,
  },
  {
    name: "Educator Pack",
    price: "$39.99",
    period: "/month",
    description: "Classroom-ready tools for building critical thinking at scale.",
    features: [
      { text: "Everything in Student Pro" },
      { text: "Up to 30 student seats" },
      { text: "Socratic Teacher Mode default" },
      { text: "Shareable assignment links" },
      { text: "Printable analysis worksheets" },
      { text: "Student progress dashboard" },
      { text: "Discussion question generator" },
      { text: "Curriculum-aligned report templates" },
      { text: "Priority support" },
    ],
    cta: "Get Educator Pack",
    href: "/analyzer",
    featured: false,
    variant: "elevated" as const,
    comingSoon: true,
  },
];

const faqs = [
  {
    q: "Does FrameFinder tell me if an article is biased?",
    a: 'No — and that\'s intentional. FrameFinder surfaces possible bias indicators, framing patterns, and evidence weaknesses. It never renders a definitive verdict of "biased" or "unbiased" because those labels are often reductive. The analysis is a starting point for your own critical thinking.',
  },
  {
    q: "How accurate is the fallacy detection?",
    a: 'Fallacy detection is always interpretive. FrameFinder flags patterns that are consistent with known fallacies and labels them as "possible" — not definitive. You should apply your own judgment to determine whether a detected pattern actually constitutes a fallacy in context.',
  },
  {
    q: "Can teachers share reports with students?",
    a: "Yes — the Educator Pack includes shareable assignment links so students can view reports or run their own analyses through a shared interface.",
  },
  {
    q: "Is there a student discount?",
    a: "Student Pro is already priced with students in mind. If you need institutional pricing for a whole class or department, contact us about the Educator Pack.",
  },
];

const useCases = [
  { icon: BookOpen, label: "AP Language & Composition",  note: "Rhetorical analysis essays" },
  { icon: MessageSquare, label: "Debate & MUN Research",   note: "Evidence vetting & framing"  },
  { icon: Users, label: "Classrooms & Teachers",       note: "Socratic discussion starter"  },
  { icon: Zap, label: "Journalists & Researchers",   note: "Source credibility review"    },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <main
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse 80% 50% at 50% -15%, rgba(16,185,129,0.09) 0%, transparent 55%), " +
          "linear-gradient(175deg, #eaf4ea 0%, #f0ede3 15%, #f4f0e6 42%, #fdf9f0 100%)",
      }}
    >

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-16 text-center sm:px-6">
        <div className="mb-5 flex items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-widest text-emerald-700">
            Pricing
          </span>
          <span
            className="rounded-full border px-3 py-1 text-[10.5px] font-semibold"
            style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4", color: "#4a7050" }}
          >
            7-day free trial included
          </span>
        </div>

        <h1
          className="text-4xl font-black leading-tight tracking-tight sm:text-5xl"
          style={{ color: "#1c2018" }}
        >
          Simple, honest{" "}
          <span className="relative inline-block" style={{ color: "#166534" }}>
            pricing
            <span
              className="absolute -bottom-0.5 left-0 h-[2px] w-full rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(22,101,52,0.45), transparent)" }}
            />
          </span>
        </h1>

        <p
          className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed"
          style={{ color: "#687070" }}
        >
          Start free and upgrade when you need deeper analysis.
          No hidden fees. Cancel any time.
        </p>
      </section>

      {/* ── Plans ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-5 sm:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>

        <p
          className="mt-6 text-center text-[12.5px]"
          style={{ color: "#a8bfaa" }}
        >
          Try Student Pro free for 7 days. Cancel anytime. One trial per account.
        </p>
      </section>

      {/* ── Use cases ──────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div
          className="overflow-hidden rounded-2xl border px-8 py-7"
          style={{
            backgroundColor: "#fdfbf5",
            borderColor: "#d8d3c8",
            boxShadow: "0 2px 16px rgba(0,0,0,0.05), inset 0 0 40px rgba(16,185,129,0.025)",
          }}
        >
          <p
            className="mb-5 text-center font-mono text-[8.5px] font-black uppercase tracking-[0.2em]"
            style={{ color: "#7a8e7c" }}
          >
            Built for
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {useCases.map(({ icon: Icon, label, note }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: "#e8f2e8", color: "#2c5c34" }}
                >
                  <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                </div>
                <div>
                  <p className="text-[12.5px] font-semibold" style={{ color: "#1c2018" }}>
                    {label}
                  </p>
                  <p className="text-[11px]" style={{ color: "#7a8e7c" }}>
                    {note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs ───────────────────────────────────────────────────────────── */}
      <section
        className="border-t"
        style={{ backgroundColor: "rgba(248,252,248,0.85)", borderColor: "#d8d3c8" }}
      >
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
          <div className="mb-8 flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: "#dce8dc", color: "#2c5c34" }}
            >
              <HelpCircle className="h-4 w-4" />
            </div>
            <h2 className="text-2xl font-black" style={{ color: "#1c2018" }}>
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="overflow-hidden rounded-xl border"
                style={{ backgroundColor: "#fdfbf5", borderColor: "#d8d3c8" }}
              >
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <ChevronDown
                      className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600"
                    />
                    <div>
                      <h3
                        className="text-[14px] font-bold leading-snug"
                        style={{ color: "#1c2018" }}
                      >
                        {faq.q}
                      </h3>
                      <p
                        className="mt-2 text-[13px] leading-relaxed"
                        style={{ color: "#687070" }}
                      >
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA band ────────────────────────────────────────────────── */}
      <section
        className="border-t"
        style={{ backgroundColor: "#f0f7f0", borderColor: "#c4d4c4" }}
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p
              className="font-mono text-[8.5px] font-black uppercase tracking-[0.2em]"
              style={{ color: "#7a8e7c" }}
            >
              Free to start
            </p>
            <h3
              className="mt-1 text-[18px] font-black leading-snug"
              style={{ color: "#1c2018" }}
            >
              Upgrade when you need{" "}
              <span className="text-emerald-700">deeper analysis</span>
            </h3>
            <p className="mt-1 text-[13px]" style={{ color: "#687070" }}>
              No account required for the free tier. Start analyzing in seconds.
            </p>
          </div>
          <Link
            href="/analyzer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-[13.5px] font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-[1px] hover:bg-emerald-600 active:translate-y-0"
          >
            Try it Free
            <span className="text-emerald-200">→</span>
          </Link>
        </div>
      </section>

    </main>
  );
}
