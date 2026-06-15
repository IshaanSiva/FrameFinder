"use client";

import { motion } from "motion/react";
import type { FC } from "react";

// ── Mini UI mockups ──────────────────────────────────────────────────────────
// None of these have outer top margin — the card shell handles spacing uniformly.

const FramingMini: FC = () => (
  <div className="space-y-3">
    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/25">
      <div className="border-b border-white/[0.05] px-3 py-1.5">
        <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-slate-600">
          Framing Output
        </span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {([
          ["LENS",    "Student freedom vs. control", "text-emerald-400"],
          ["TONE",    "Advocacy · Persuasive",        "text-slate-400"],
          ["STANCE",  "Strongly Against",             "text-red-400"],
          ["SUBJECT", "Educational policy",           "text-slate-500"],
        ] as const).map(([label, val, cls]) => (
          <div key={label} className="flex items-center gap-3 px-3 py-2">
            <span className="w-12 shrink-0 font-mono text-[8px] font-bold uppercase tracking-wider text-slate-700">
              {label}
            </span>
            <span className={`text-[10px] font-medium ${cls}`}>{val}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center justify-between text-[9px]">
      <span className="text-slate-700">Full framing profile extracted</span>
      <span className="font-semibold text-emerald-500/70">Complete</span>
    </div>
  </div>
);

const LoadedMini: FC = () => (
  <div className="space-y-3">
    {/* Annotated sentence preview */}
    <div className="rounded-lg border border-white/[0.06] bg-black/25 px-3 py-2.5 text-[10px] leading-[2]">
      <span className="text-slate-500">This </span>
      <span className="rounded bg-red-400/[0.16] px-[3px] py-px font-semibold text-red-300">reckless policy</span>
      <span className="text-slate-500"> will </span>
      <span className="rounded bg-red-400/[0.16] px-[3px] py-px font-semibold text-red-300">destroy</span>
      <span className="text-slate-500"> independence — what </span>
      <span className="rounded bg-amber-400/[0.14] px-[3px] py-px font-semibold text-amber-300">any reasonable person</span>
      <span className="text-slate-500"> can see.</span>
    </div>
    {/* Flagged term list */}
    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/20">
      {([
        ["reckless policy", "HIGH", true],
        ["destroy",         "HIGH", true],
        ["draconian",       "HIGH", true],
        ["any reasonable",  "MED",  false],
      ] as const).map(([phrase, sev, isHigh], i, arr) => (
        <div
          key={phrase}
          className={`flex items-center justify-between gap-2 px-3 py-1.5 text-[9px] ${i < arr.length - 1 ? "border-b border-white/[0.04]" : ""}`}
        >
          <span className="text-slate-500">&ldquo;{phrase}&rdquo;</span>
          <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[8px] font-black ${isHigh ? "bg-red-950/50 text-red-400" : "bg-amber-950/40 text-amber-400"}`}>
            {sev}
          </span>
        </div>
      ))}
    </div>
    {/* Footer stat */}
    <div className="flex items-center justify-between text-[9px]">
      <span className="text-slate-700">7 terms flagged · 5 high impact</span>
      <span className="font-semibold text-red-400/80">Charged</span>
    </div>
  </div>
);

const ClaimsMini: FC = () => (
  <div className="space-y-3">
    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/25">
      <div className="border-b border-white/[0.05] px-3 py-1.5">
        <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-slate-600">
          Claims Audit
        </span>
      </div>
      {([
        ['"Students need phones"',   "Unsupported", "text-red-400"],
        ['"Research is clear"',      "Vague",        "text-amber-400"],
        ['"Safety requires access"', "No source",    "text-red-400"],
      ] as const).map(([claim, v, c], i) => (
        <div
          key={claim}
          className={`flex items-center justify-between gap-2 px-3 py-2 text-[9px] ${i < 2 ? "border-b border-white/[0.04]" : ""}`}
        >
          <span className="truncate text-slate-500">{claim}</span>
          <span className={`shrink-0 font-bold ${c}`}>{v}</span>
        </div>
      ))}
    </div>
    <div className="flex items-center justify-between text-[9px]">
      <span className="text-slate-700">3 claims reviewed</span>
      <span className="font-semibold text-amber-400/80">2 unsupported</span>
    </div>
  </div>
);

const FallacyMini: FC = () => (
  <div className="space-y-3">
    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/25">
      <div className="border-b border-white/[0.05] px-3 py-1.5">
        <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-slate-600">
          Detected Fallacies
        </span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {([
          ["Ad Hominem",      '"out-of-touch admins"'],
          ["Appeal to Fear",  '"disastrous consequences"'],
          ["False Consensus", '"any reasonable person"'],
        ] as const).map(([label, note]) => (
          <div key={label} className="flex items-start gap-2.5 px-3 py-2">
            <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500/60" />
            <div className="text-[9px]">
              <span className="font-bold text-rose-400">{label}</span>
              <span className="ml-1.5 text-slate-600">{note}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center justify-between text-[9px]">
      <span className="text-slate-700">3 fallacies identified</span>
      <span className="font-semibold text-rose-400/80">Review logic</span>
    </div>
  </div>
);

const MissingMini: FC = () => (
  <div className="space-y-3">
    <div className="overflow-hidden rounded-lg border border-white/[0.06] bg-black/25">
      <div className="border-b border-white/[0.05] px-3 py-1.5">
        <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-slate-600">
          Absent Voices
        </span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {([
          ["Teachers supporting ban",   false],
          ["Phone-free student voices", false],
          ["Academic performance data", false],
          ["+ 1 more absent voice",     true],
        ] as const).map(([t, dim]) => (
          <div key={t} className="flex items-center gap-2.5 px-3 py-2">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dim ? "bg-slate-700" : "bg-blue-500/60"}`} />
            <span className={`text-[9px] ${dim ? "text-slate-700 italic" : "text-slate-400"}`}>{t}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center justify-between text-[9px]">
      <span className="text-slate-700">4 perspectives missing</span>
      <span className="font-semibold text-blue-400/80">One-sided</span>
    </div>
  </div>
);

const NeutralMini: FC = () => (
  <div className="space-y-2.5">
    <div className="overflow-hidden rounded-lg border border-red-900/30 bg-red-950/[0.15]">
      <div className="flex items-center justify-between border-b border-red-900/20 px-3 py-1.5">
        <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-red-700">Loaded</span>
        <span className="font-mono text-[8px] text-red-900/60">original</span>
      </div>
      <p className="px-3 py-2 text-[10px] leading-relaxed text-red-300">
        &ldquo;reckless policy will <em>destroy</em> student independence...&rdquo;
      </p>
    </div>
    <div className="overflow-hidden rounded-lg border border-emerald-900/30 bg-emerald-950/[0.15]">
      <div className="flex items-center justify-between border-b border-emerald-900/20 px-3 py-1.5">
        <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-emerald-700">Neutral</span>
        <span className="font-mono text-[8px] text-emerald-900/60">rewritten</span>
      </div>
      <p className="px-3 py-2 text-[10px] leading-relaxed text-emerald-300">
        &ldquo;policy may <em>reduce</em> student autonomy in some contexts...&rdquo;
      </p>
    </div>
    <div className="flex items-center justify-between text-[9px]">
      <span className="text-slate-700">4 phrases neutralised</span>
      <span className="font-semibold text-emerald-500/70">Balanced</span>
    </div>
  </div>
);

// ── Layer definitions ────────────────────────────────────────────────────────

interface Layer {
  num: string;
  name: string;
  desc: string;
  accentText: string;
  numColor: string;
  accentHex: string;
  initRotate: number;
  Mock: FC;
}

const LAYERS: Layer[] = [
  {
    num: "01",
    name: "Framing Lens",
    desc: "Topic, angle, tone, and stance — the full picture before any phrase is flagged.",
    accentText: "text-emerald-400",
    numColor:   "text-emerald-900/25",
    accentHex:  "#34d399",
    initRotate: -2,
    Mock: FramingMini,
  },
  {
    num: "02",
    name: "Loaded Language",
    desc: "Every emotionally charged phrase flagged, impact-rated, and explained.",
    accentText: "text-red-400",
    numColor:   "text-red-900/25",
    accentHex:  "#f87171",
    initRotate: 2,
    Mock: LoadedMini,
  },
  {
    num: "03",
    name: "Claims vs Evidence",
    desc: "Asserted facts mapped against actual support — or the absence of it.",
    accentText: "text-amber-400",
    numColor:   "text-amber-900/25",
    accentHex:  "#fbbf24",
    initRotate: -1.5,
    Mock: ClaimsMini,
  },
  {
    num: "04",
    name: "Fallacy Detection",
    desc: "Named and placed: ad hominem, false authority, appeal to fear, and more.",
    accentText: "text-rose-400",
    numColor:   "text-rose-900/25",
    accentHex:  "#fb7185",
    initRotate: 1.5,
    Mock: FallacyMini,
  },
  {
    num: "05",
    name: "Missing Perspectives",
    desc: "Whose voices are absent — the dimension that simple bias labels always miss.",
    accentText: "text-blue-400",
    numColor:   "text-blue-900/25",
    accentHex:  "#60a5fa",
    initRotate: -2,
    Mock: MissingMini,
  },
  {
    num: "06",
    name: "Neutral Rewrite",
    desc: "The same sentence without the freight — proof of what the language was doing.",
    accentText: "text-emerald-400",
    numColor:   "text-emerald-900/25",
    accentHex:  "#34d399",
    initRotate: 2,
    Mock: NeutralMini,
  },
];

// ── Section ──────────────────────────────────────────────────────────────────

export default function AnalysisLayers() {
  return (
    <>
      <div className="pointer-events-none h-6 bg-gradient-to-b from-[#f4f0e6] to-[#243c26]" />
      <section className="section-forest py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.42 }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-[#eae6de] sm:text-4xl">
            Six layers.{" "}
            <span className="text-emerald-400">One clean report.</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Each dimension stacks into a single readable output —
            not a score, a structured explanation.
          </p>
        </motion.div>

        {/* Card grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.075 } } }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {LAYERS.map((layer) => {
            const Mock = layer.Mock;
            return (
              <motion.div
                key={layer.num}
                variants={{
                  hidden:  { opacity: 0, y: 32, rotate: layer.initRotate },
                  visible: {
                    opacity: 1, y: 0, rotate: 0,
                    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
                className="group relative cursor-default rounded-2xl border border-white/[0.08] bg-[#131c14] shadow-[0_4px_20px_rgba(0,0,0,0.22)] transition-shadow duration-200 hover:shadow-[0_12px_36px_rgba(0,0,0,0.32)]"
              >
                {/* Hover accent line */}
                <div
                  className="absolute inset-x-0 top-0 h-px rounded-t-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(to right, transparent, ${layer.accentHex}90, transparent)`,
                  }}
                />

                {/* Watermark number — clipped inside card, bottom-right */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                  <span
                    className={`absolute -bottom-4 -right-1 select-none font-mono text-[80px] font-black leading-none ${layer.numColor}`}
                  >
                    {layer.num}
                  </span>
                </div>

                {/* Card content */}
                <div className="relative flex flex-col p-6">
                  {/* Label + title + description */}
                  <p className={`mb-2 font-mono text-[9px] font-black uppercase tracking-[0.2em] ${layer.accentText}`}>
                    {layer.num}
                  </p>
                  <h3 className="text-[15px] font-bold leading-snug text-[#eae6de]">{layer.name}</h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{layer.desc}</p>

                  {/* Separator */}
                  <div className="my-4 border-t border-white/[0.05]" />

                  {/* Module demo */}
                  <Mock />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
    <div className="pointer-events-none h-6 bg-gradient-to-b from-[#243c26] to-[#f4f0e6]" />
    </>
  );
}
