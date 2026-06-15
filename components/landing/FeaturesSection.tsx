"use client";

import { motion, useMotionValue, useTransform, useSpring } from "motion/react";
import type { FC } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// Demo: Loaded Language
// ═══════════════════════════════════════════════════════════════════════════════

type LLPart = { t: string; hi: false } | { t: string; hi: true; lv: "h" | "m" };

const LL_PARTS: LLPart[] = [
  { t: "This ",                              hi: false },
  { t: "reckless policy",                    hi: true, lv: "h" },
  { t: " will ",                             hi: false },
  { t: "destroy",                            hi: true, lv: "h" },
  { t: " student independence and cause ",   hi: false },
  { t: "disastrous consequences",            hi: true, lv: "h" },
  { t: ". These ",                           hi: false },
  { t: "draconian measures",                 hi: true, lv: "h" },
  { t: " ignore what ",                      hi: false },
  { t: "any reasonable person",              hi: true, lv: "m" },
  { t: " can plainly see.",                  hi: false },
];

const LL_CHIPS: { t: string; lv: "h" | "m" }[] = [
  { t: "reckless policy",    lv: "h" },
  { t: "destroy",            lv: "h" },
  { t: "draconian",          lv: "h" },
  { t: "disastrous",         lv: "h" },
  { t: "any reasonable...",  lv: "m" },
];

function LoadedDemo() {
  return (
    <div className="space-y-3">
      {/* Annotated text with scan beam */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/30 p-4">
        <motion.div
          className="pointer-events-none absolute inset-x-0"
          style={{ top: 0 }}
          animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 3.4,
            times: [0, 0.08, 0.88, 1],
            ease: "linear",
            repeat: Infinity,
            repeatDelay: 1.6,
          }}
        >
          <div className="h-px w-full bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />
          <div className="h-14 w-full bg-gradient-to-b from-red-400/[0.07] to-transparent" />
        </motion.div>

        <p className="relative text-[11px] leading-[1.95]">
          {LL_PARTS.map((p, i) =>
            p.hi ? (
              <span
                key={i}
                className={`rounded px-[3px] py-px font-semibold ${
                  p.lv === "h"
                    ? "bg-red-400/[0.13] text-red-300"
                    : "bg-amber-400/[0.13] text-amber-300"
                }`}
              >
                {p.t}
              </span>
            ) : (
              <span key={i} className="text-slate-400">
                {p.t}
              </span>
            )
          )}
        </p>
      </div>

      {/* Chip rail */}
      <div className="flex flex-wrap items-center gap-1.5">
        {LL_CHIPS.map(({ t, lv }, i) => (
          <motion.span
            key={t}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18 + i * 0.07, duration: 0.26, type: "spring", stiffness: 300, damping: 22 }}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-semibold ${
              lv === "h"
                ? "border-red-900/40 bg-red-950/30 text-red-400"
                : "border-amber-900/40 bg-amber-950/30 text-amber-400"
            }`}
          >
            <span className={`h-1 w-1 rounded-full ${lv === "h" ? "bg-red-500" : "bg-amber-500"}`} />
            {t}
          </motion.span>
        ))}
        <span className="text-[9px] text-slate-700">+2 more</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Demo: Claims Audit
// ═══════════════════════════════════════════════════════════════════════════════

const CLAIMS_ROWS = [
  { claim: '"Students need phones for safety."', verdict: "UNSUPPORTED", vc: "text-red-400 bg-red-950/30 border-red-900/35" },
  { claim: '"The research is absolutely clear."', verdict: "VAGUE", vc: "text-amber-400 bg-amber-950/30 border-amber-900/35" },
  { claim: '"This ban will lead to a crisis."', verdict: "SPECULATION", vc: "text-orange-400 bg-orange-950/30 border-orange-900/35" },
];

function ClaimsDemo() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-black/30">
      <div className="flex items-center justify-between border-b border-white/[0.05] bg-white/[0.025] px-3.5 py-2">
        <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-slate-600">Claim</span>
        <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-slate-600">Verdict</span>
      </div>
      {CLAIMS_ROWS.map(({ claim, verdict, vc }, i) => (
        <motion.div
          key={claim}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.11, duration: 0.3, type: "tween" }}
          className={`flex items-center justify-between gap-3 px-3.5 py-2.5 ${
            i < CLAIMS_ROWS.length - 1 ? "border-b border-white/[0.04]" : ""
          }`}
        >
          <span className="text-[10px] leading-snug text-slate-400">{claim}</span>
          <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-bold ${vc}`}>
            {verdict}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Demo: Fallacy Detection
// ═══════════════════════════════════════════════════════════════════════════════

const FALLACIES = [
  {
    type: "Ad Hominem",
    quote: '"out-of-touch administrators"',
    sev: "HIGH",
    cls: "border-red-900/30 bg-red-950/20",
    tc: "text-red-400",
    sc: "text-red-600",
  },
  {
    type: "Appeal to Fear",
    quote: '"disastrous consequences"',
    sev: "HIGH",
    cls: "border-red-900/30 bg-red-950/20",
    tc: "text-red-400",
    sc: "text-red-600",
  },
  {
    type: "False Consensus",
    quote: '"any reasonable person"',
    sev: "MED",
    cls: "border-amber-900/30 bg-amber-950/20",
    tc: "text-amber-400",
    sc: "text-amber-600",
  },
];

function FallaciesDemo() {
  return (
    <div className="space-y-2">
      {FALLACIES.map(({ type, quote, sev, cls, tc, sc }, i) => (
        <motion.div
          key={type}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 + i * 0.12, duration: 0.32, type: "tween" }}
          className={`rounded-xl border p-3 ${cls}`}
        >
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className={`text-[10px] font-bold ${tc}`}>{type}</span>
            <span className={`text-[7px] font-bold uppercase tracking-wider ${sc}`}>{sev}</span>
          </div>
          <p className="font-mono text-[9px] text-slate-500">{quote}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Demo: Missing Perspectives
// ═══════════════════════════════════════════════════════════════════════════════

const PERSPECTIVES = [
  { name: "Teachers supporting the ban",     present: false },
  { name: "Phone-free student voices",       present: false },
  { name: "Academic performance research",   present: false },
  { name: "School safety coordinators",      present: true  },
];

function MissingDemo() {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[9px] text-slate-600">Stakeholder voices in text</span>
        <span className="rounded-full border border-blue-900/30 bg-blue-950/20 px-2 py-0.5 text-[8px] font-bold text-blue-400">
          3 of 4 absent
        </span>
      </div>
      <div className="space-y-1.5">
        {PERSPECTIVES.map(({ name, present }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.09, duration: 0.28, type: "tween" }}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
              present
                ? "border-emerald-900/25 bg-emerald-950/15"
                : "border-white/[0.05] bg-white/[0.02]"
            }`}
          >
            {/* Presence indicator */}
            <div
              className={`relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                present
                  ? "border-emerald-700/50 bg-emerald-900/30"
                  : "border-white/[0.08] bg-black/20"
              }`}
            >
              {present ? (
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              ) : (
                <motion.span
                  className="h-2 w-2 rounded-full border border-white/[0.18]"
                  animate={{ opacity: [0.2, 0.55, 0.2] }}
                  transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.55, ease: "linear" }}
                />
              )}
            </div>

            <span className={`text-[10px] ${present ? "text-emerald-400" : "text-slate-600"}`}>
              {name}
            </span>
            {!present && (
              <span className="ml-auto text-[8px] font-bold uppercase tracking-wider text-slate-700">
                ABSENT
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Demo: PDF Analysis
// ═══════════════════════════════════════════════════════════════════════════════

function PDFDemo() {
  return (
    <div className="space-y-3">
      {/* File row */}
      <div className="flex items-center gap-3 rounded-xl border border-violet-900/25 bg-violet-950/15 px-3.5 py-2.5">
        <div className="flex h-9 w-7 shrink-0 flex-col items-center justify-center rounded border border-violet-800/30 bg-violet-900/20">
          <span className="font-mono text-[7px] font-black leading-none text-violet-400">PDF</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold text-slate-300">school_phone_policy.pdf</p>
          <p className="text-[8px] text-slate-600">247 KB · 4 pages</p>
        </div>
        <div className="ml-auto shrink-0 rounded-full border border-violet-900/30 bg-violet-950/20 px-2 py-0.5 text-[8px] font-bold text-violet-400">
          Scanning
        </div>
      </div>

      {/* Progress */}
      <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-slate-600">
            Extracting text
          </span>
          <span className="font-mono text-[8px] text-slate-500">82%</span>
        </div>
        <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-violet-400"
            initial={{ width: "0%" }}
            whileInView={{ width: "82%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.25, type: "tween" }}
          />
        </div>
      </div>

      {/* Extracted preview */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/30 p-3">
        <p className="mb-2 font-mono text-[8px] font-bold uppercase tracking-wider text-slate-600">
          Text preview
        </p>
        <p className="text-[9px] leading-relaxed text-slate-500">
          &ldquo;The proposed ban on student mobile devices represents a{" "}
          <span className="text-red-400">significant overreach</span> of administrative
          authority, with{" "}
          <span className="text-red-400">devastating effects</span> on student
          communication...&rdquo;
        </p>
        <div className="mt-2.5 flex items-center gap-1.5 border-t border-white/[0.04] pt-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          <span className="text-[8px] text-slate-600">3 flagged phrases in first paragraph</span>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-[#0c1510]/90 to-transparent" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Demo: Source Comparison
// ═══════════════════════════════════════════════════════════════════════════════

const SOURCES = [
  {
    side: "SOURCE A",
    outlet: "The Student Chronicle",
    headline: "Freedom at Risk as Phone Ban Looms Over Classrooms",
    stance: "Against",
    phrases: ["reckless", "destroy", "draconian", "disastrous"],
    borderCls: "border-red-900/30 bg-red-950/[0.12]",
    stanceCls: "text-red-400",
    chipCls: "border-red-900/30 bg-red-950/25 text-red-400",
    dot: "bg-red-500",
  },
  {
    side: "SOURCE B",
    outlet: "Education Research Weekly",
    headline: "Phone-Free Classrooms Improve Focus, New Data Shows",
    stance: "For",
    phrases: ["evidence-based", "measured", "research-backed", "structured"],
    borderCls: "border-emerald-900/30 bg-emerald-950/[0.12]",
    stanceCls: "text-emerald-400",
    chipCls: "border-emerald-900/30 bg-emerald-950/25 text-emerald-400",
    dot: "bg-emerald-500",
  },
];

function ComparisonDemo() {
  return (
    <div className="space-y-4">
      {/* Two source panels */}
      <div className="grid grid-cols-2 gap-4">
        {SOURCES.map((s, i) => (
          <motion.div
            key={s.side}
            initial={{ opacity: 0, x: i === 0 ? -14 : 14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.1, duration: 0.36, type: "tween" }}
            className={`rounded-xl border p-3.5 ${s.borderCls}`}
          >
            <p className="mb-1 font-mono text-[7px] font-bold uppercase tracking-widest text-slate-600">
              {s.side}
            </p>
            <p className="mb-1.5 text-[8px] text-slate-600">{s.outlet}</p>
            <p className="mb-3 text-[10px] font-semibold leading-snug text-slate-200">{s.headline}</p>
            <div className="mb-3 flex flex-wrap gap-1">
              {s.phrases.map((p) => (
                <span key={p} className={`rounded border px-1.5 py-0.5 text-[8px] font-medium ${s.chipCls}`}>
                  {p}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
              <span className="text-[9px] text-slate-500">
                Stance:{" "}
                <span className={`font-bold ${s.stanceCls}`}>{s.stance}</span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Synthesis row — the analytical output spanning both sources */}
      <div className="grid grid-cols-3 divide-x divide-white/[0.05] overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.02]">
        <div className="px-4 py-3">
          <p className="font-mono text-[7px] font-bold uppercase tracking-widest text-slate-600">
            Stance divergence
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="shrink-0 text-[9px] font-bold text-red-400">Against</span>
            <div className="h-px flex-1 bg-gradient-to-r from-red-500/30 via-white/[0.08] to-emerald-500/30" />
            <span className="shrink-0 text-[9px] font-bold text-emerald-400">For</span>
          </div>
        </div>
        <div className="px-4 py-3">
          <p className="font-mono text-[7px] font-bold uppercase tracking-widest text-slate-600">
            Loaded language
          </p>
          <p className="mt-2 text-[9px] text-slate-500">
            A: <span className="font-bold text-red-400">8 terms</span>
            {" · "}
            B: <span className="font-bold text-emerald-400">1 term</span>
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="font-mono text-[7px] font-bold uppercase tracking-widest text-slate-600">
            Framing lens
          </p>
          <p className="mt-2 text-[9px] text-slate-500">
            <span className="text-red-300">&ldquo;freedom&rdquo;</span>{" "}vs{" "}
            <span className="text-emerald-300">&ldquo;evidence&rdquo;</span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Module card — app-window chrome + 3D tilt
// ═══════════════════════════════════════════════════════════════════════════════

interface Module {
  label: string;
  status: string;
  accentHex: string;
  Demo: FC;
}

function ModuleCard({ mod, className = "" }: { mod: Module; className?: string }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 250, damping: 24 });
  const sy = useSpring(my, { stiffness: 250, damping: 24 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-5, 5]);

  const Demo = mod.Demo;

  return (
    <div style={{ perspective: "1000px" }} className={className}>
      <motion.div
        className="group relative h-full cursor-default overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c1510] shadow-[0_4px_24px_rgba(0,0,0,0.22)] transition-shadow duration-300 hover:shadow-[0_14px_48px_rgba(0,0,0,0.32)]"
        style={{ rotateX, rotateY }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width - 0.5);
          my.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onMouseLeave={() => {
          mx.set(0);
          my.set(0);
        }}
        whileHover={{ scale: 1.013 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
      >
        {/* Colored top accent line */}
        <div
          className="absolute inset-x-0 top-0 z-10 h-px"
          style={{
            background: `linear-gradient(to right, transparent, ${mod.accentHex}95, transparent)`,
          }}
        />

        {/* Chrome header */}
        <div className="flex items-center gap-2.5 border-b border-white/[0.05] bg-black/40 px-4 py-2.5">
          <div className="flex shrink-0 gap-1.5">
            <span className="h-[7px] w-[7px] rounded-full bg-white/[0.09]" />
            <span className="h-[7px] w-[7px] rounded-full bg-white/[0.09]" />
            <span className="h-[7px] w-[7px] rounded-full bg-white/[0.09]" />
          </div>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-slate-600">
            {mod.label}
          </span>
          <span className="ml-auto shrink-0 rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-px font-mono text-[8px] text-slate-600">
            {mod.status}
          </span>
        </div>

        {/* Demo body */}
        <div className="p-4">
          <Demo />
        </div>
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Module registry
// ═══════════════════════════════════════════════════════════════════════════════

const MODULES: Module[] = [
  { label: "Loaded Language",      status: "7 flagged",     accentHex: "#ef4444", Demo: LoadedDemo },
  { label: "Claims Audit",         status: "3 reviewed",    accentHex: "#f59e0b", Demo: ClaimsDemo },
  { label: "Fallacy Detection",    status: "3 detected",    accentHex: "#fb7185", Demo: FallaciesDemo },
  { label: "Missing Perspectives", status: "3 of 4 absent", accentHex: "#60a5fa", Demo: MissingDemo },
  { label: "PDF Analysis",         status: "4 pages",       accentHex: "#a78bfa", Demo: PDFDemo },
  { label: "Source Comparison",    status: "2 sources",     accentHex: "#34d399", Demo: ComparisonDemo },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Section
// ═══════════════════════════════════════════════════════════════════════════════

export default function FeaturesSection() {
  return (
    <>
      <div className="pointer-events-none h-6 bg-gradient-to-b from-[#f4f0e6] to-[#243c26]" />
      <section className="section-forest pb-20 sm:pb-28">
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.42, type: "tween" }}
          className="mx-auto mb-14 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-[#eae6de] sm:text-4xl">
            Deeper than{" "}
            <span className="text-slate-500">&ldquo;biased&rdquo;</span>
            {" "}or{" "}
            <span className="text-slate-500">&ldquo;unbiased&rdquo;</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Six analytical modules — each one showing you the{" "}
            <span className="font-semibold text-emerald-400">how</span>{" "}
            of persuasion, not just a verdict.
          </p>
        </motion.div>

        {/*
          12-column grid:
          Row 1  Loaded Language [6]  ·  Fallacy Detection [3]  ·  PDF Analysis [3]
          Row 2  Claims Audit [6]  ·  Missing Perspectives [6]  (equal height)
          Row 3  Source Comparison [12]
        */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
          {/* Row 1 */}
          <ModuleCard mod={MODULES[0]} className="sm:col-span-2 lg:col-span-6" />
          <ModuleCard mod={MODULES[2]} className="lg:col-span-3" />
          <ModuleCard mod={MODULES[4]} className="lg:col-span-3" />
          {/* Row 2 */}
          <ModuleCard mod={MODULES[1]} className="sm:col-span-2 lg:col-span-6" />
          <ModuleCard mod={MODULES[3]} className="sm:col-span-2 lg:col-span-6" />
          {/* Row 3 */}
          <ModuleCard mod={MODULES[5]} className="sm:col-span-2 lg:col-span-12" />
        </div>
      </div>
    </section>
    <div className="pointer-events-none h-6 bg-gradient-to-b from-[#243c26] to-[#f4f0e6]" />
    </>
  );
}
