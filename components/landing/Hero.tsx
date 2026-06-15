"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useMotionTemplate,
} from "motion/react";

const DEMO_PHRASES: { text: string; hi?: true; level?: "h" | "m" }[] = [
  { text: "This " },
  { text: "reckless policy", hi: true, level: "h" },
  { text: " will " },
  { text: "destroy", hi: true, level: "h" },
  { text: " student independence and lead to " },
  { text: "disastrous consequences", hi: true, level: "h" },
  { text: ". These " },
  { text: "draconian measures", hi: true, level: "h" },
  { text: " strip teenagers of their autonomy. " },
  { text: "Any reasonable person", hi: true, level: "m" },
  { text: " can see this policy was created by " },
  { text: "out-of-touch administrators", hi: true, level: "h" },
  { text: "." },
];

const SCORE_BARS = [
  { label: "Loaded Language",   score: 8, delay: 0.70 },
  { label: "Evidence Quality",  score: 2, delay: 0.84 },
  { label: "Emotional Framing", score: 9, delay: 0.98 },
];

// ── Headline animation variants ──────────────────────────────────────────────

const hContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const hWord = {
  hidden: { opacity: 0, y: 16, filter: "blur(2px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.45, ease: "circOut" },
  },
};

// "really" gets emerald drop-shadow glow on top of the gradient text
const hGlowWord = {
  hidden: { opacity: 0, y: 16, filter: "blur(2px)" },
  visible: {
    opacity: 1, y: 0,
    filter: "blur(0px) drop-shadow(0 0 10px rgba(52,211,153,0.45))",
    transition: { duration: 0.45, ease: "circOut" },
  },
};

// Underline sweep starts after the last word settles (~index 7 in stagger)
const hUnderline = {
  hidden: { scaleX: 0, opacity: 0 },
  visible: {
    scaleX: 1, opacity: 1,
    transition: { delay: 0.5, duration: 0.52, ease: "circOut" },
  },
};

// ── Floating annotation chips ─────────────────────────────────────────────────

const CHIPS = [
  { label: "Framing lens",        dot: "bg-emerald-400", delay: 0.9,  fy: [-5,  4, -5] as const, top: "8%"  },
  { label: "Loaded language",     dot: "bg-red-400",     delay: 1.15, fy: [ 4, -6,  4] as const, top: "30%" },
  { label: "Weak evidence",       dot: "bg-amber-400",   delay: 1.4,  fy: [-4,  6, -4] as const, top: "55%" },
  { label: "Missing perspective", dot: "bg-blue-400",    delay: 1.65, fy: [ 5, -3,  5] as const, top: "76%" },
];

function AnnotationChip({
  label,
  dot,
  delay,
  fy,
}: {
  label: string;
  dot: string;
  delay: number;
  fy: readonly [number, number, number];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      <motion.div
        animate={{ y: [...fy] }}
        transition={{
          duration: 3.2 + delay * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay + 0.4,
        }}
        className="flex items-center gap-2 rounded-lg border border-white/[0.10] bg-[#1a2820]/90 px-3 py-1.5 shadow-lg shadow-black/25 backdrop-blur-md"
      >
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
        <span className="whitespace-nowrap text-[11px] font-semibold tracking-wide text-slate-300">
          {label}
        </span>
      </motion.div>
    </motion.div>
  );
}

// ── Demo card ─────────────────────────────────────────────────────────────────

function DemoCard() {
  const [hovered, setHovered] = useState(false);

  // 3D tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 20 });
  const sy = useSpring(y, { stiffness: 180, damping: 20 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-8, 8]);

  // Spotlight: radial glow that follows the cursor
  const spotX = useMotionValue(0);
  const spotY = useMotionValue(0);
  const spotBg = useMotionTemplate`radial-gradient(220px circle at ${spotX}px ${spotY}px, rgba(52,211,153,0.08) 0%, transparent 75%)`;

  return (
    <div className="relative" style={{ perspective: "1100px" }}>

      {/* Floating annotation chips — positioned left of card on lg screens */}
      {CHIPS.map((chip) => (
        <div
          key={chip.label}
          className="absolute left-0 z-20 hidden lg:block"
          style={{ top: chip.top, transform: "translateX(calc(-100% - 16px))" }}
        >
          <AnnotationChip label={chip.label} dot={chip.dot} delay={chip.delay} fy={chip.fy} />
        </div>
      ))}

      {/* Card */}
      <motion.div
        style={{ rotateX, rotateY }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          x.set((e.clientX - r.left) / r.width - 0.5);
          y.set((e.clientY - r.top) / r.height - 0.5);
          spotX.set(e.clientX - r.left);
          spotY.set(e.clientY - r.top);
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { x.set(0); y.set(0); setHovered(false); }}
        className="overflow-hidden rounded-2xl border border-emerald-900/40 bg-[#0c1510] shadow-[0_40px_80px_rgba(0,0,0,0.65),0_0_0_1px_rgba(16,185,129,0.07),0_0_60px_rgba(16,185,129,0.06)]"
      >
        {/* Top accent line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b border-white/[0.06] bg-[#0a120d] px-4 py-3">
          <div className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
          <span className="ml-2 text-[11px] font-semibold tracking-wider text-slate-500">
            FrameFinder Analysis
          </span>
          <div className="ml-auto flex items-center gap-1.5">
            <motion.div
              animate={{ opacity: [1, 0.25, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 w-1.5 rounded-full bg-emerald-500"
            />
            <span className="text-[9px] font-semibold tracking-widest text-emerald-600/70">LIVE</span>
          </div>
        </div>

        {/* Card body */}
        <div className="space-y-4 p-5">
          {/* Input text */}
          <div>
            <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.15em] text-slate-600">
              Input · 97 words
            </p>
            <div className="rounded-lg border border-white/[0.05] bg-[#080e0a] p-3 text-[12px] leading-relaxed text-slate-400">
              {DEMO_PHRASES.map((part, i) =>
                part.hi ? (
                  <span
                    key={i}
                    className={
                      part.level === "h"
                        ? "rounded px-0.5 bg-red-500/18 text-red-300 font-medium"
                        : "rounded px-0.5 bg-amber-500/18 text-amber-300 font-medium"
                    }
                  >
                    {part.text}
                  </span>
                ) : (
                  <span key={i}>{part.text}</span>
                )
              )}
            </div>
          </div>

          {/* Framing lens */}
          <div className="rounded-lg border border-emerald-700/25 bg-emerald-950/40 p-3">
            <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-500/80">
              Framing Lens
            </p>
            <p className="text-sm font-semibold text-slate-100">
              Student freedom vs. administrative control
            </p>
          </div>

          {/* Score bars */}
          <div className="space-y-2.5">
            {SCORE_BARS.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="w-[116px] shrink-0 text-[11px] font-medium text-slate-500">
                  {item.label}
                </span>
                <div className="h-1.5 flex-1 rounded-full bg-white/[0.05]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.score * 10}%` }}
                    transition={{ duration: 1.1, delay: item.delay, ease: "easeOut" }}
                    className={`h-1.5 rounded-full ${
                      item.score >= 7
                        ? "bg-gradient-to-r from-red-600 to-red-400"
                        : "bg-gradient-to-r from-emerald-600 to-emerald-400"
                    }`}
                  />
                </div>
                <span className="w-7 text-right text-[11px] tabular-nums font-bold text-slate-500">
                  {item.score}/10
                </span>
              </div>
            ))}
          </div>

          {/* Risk badge + loaded phrases */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-800/40 bg-amber-950/40 px-2.5 py-1.5">
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500">Risk:</span>
              <span className="text-[11px] font-bold text-amber-300">Medium-High</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {["reckless", "draconian", "destroy"].map((p) => (
                <span
                  key={p}
                  className="rounded-md border border-red-900/30 bg-red-950/40 px-1.5 py-0.5 text-[10px] font-medium text-red-400"
                >
                  &ldquo;{p}&rdquo;
                </span>
              ))}
            </div>
          </div>

          {/* Scan progress */}
          <div className="border-t border-white/[0.05] pt-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[9px] font-medium text-slate-700">Scan complete</span>
              <span className="text-[9px] font-bold text-emerald-500">100%</span>
            </div>
            <div className="h-px w-full rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, delay: 0.5, ease: "easeOut" }}
                className="h-px rounded-full bg-emerald-500/60"
              />
            </div>
          </div>
        </div>

        {/* ── Spotlight glow — follows cursor, renders above card content ── */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ background: spotBg }}
        />

        {/* ── Scanner beam — sweeps top→bottom on loop, renders topmost ── */}
        <motion.div
          className="pointer-events-none absolute inset-x-0"
          style={{ top: 0 }}
          animate={{
            top: ["0%", "100%"],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2.8,
            times: [0, 0.06, 0.90, 1],
            ease: "linear",
            repeat: Infinity,
            repeatDelay: 1.4,
          }}
        >
          <div
            className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/90 to-transparent"
            style={{ boxShadow: "0 0 10px 2px rgba(52,211,153,0.28)" }}
          />
          <div className="h-24 w-full bg-gradient-to-b from-emerald-400/[0.07] via-emerald-400/[0.025] to-transparent" />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ── Hero section ──────────────────────────────────────────────────────────────

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#1e2c20] pb-24 pt-16 sm:pb-28 sm:pt-20 lg:pb-32 lg:pt-24">
      {/* Deep emerald orbs */}
      <div className="hero-orb-1 pointer-events-none absolute -top-48 left-[-8%] h-[700px] w-[700px] rounded-full bg-emerald-500/[0.18] blur-[130px]" />
      <div className="hero-orb-2 pointer-events-none absolute -bottom-48 right-[-6%] h-[600px] w-[600px] rounded-full bg-emerald-600/[0.12] blur-[110px]" />
      <div className="hero-orb-3 pointer-events-none absolute top-[38%] left-[43%] h-[380px] w-[380px] rounded-full bg-teal-500/[0.07] blur-[90px]" />
      <div className="pointer-events-none absolute right-[6%] top-[18%] h-[220px] w-[220px] rounded-full bg-emerald-400/[0.09] blur-[55px]" />

      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Radial vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,#1e2c20_100%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-14 lg:grid lg:grid-cols-[1fr_460px] lg:items-center lg:gap-16">

          {/* ── Left: copy ─────────────────────────────────────────── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/20 bg-[#1a2820] px-4 py-1.5 text-sm font-medium text-emerald-400"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              AI-Powered Rhetorical Analysis
            </motion.div>

            <motion.h1
              variants={hContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.5 }}
              className="text-5xl font-black tracking-tighter text-[#f4f0e6] sm:text-6xl lg:text-[76px] leading-[0.90]"
            >
              {/* Line 1: staggered word reveal */}
              <motion.span variants={hWord} className="inline-block">See</motion.span>{" "}
              <motion.span variants={hWord} className="inline-block">what</motion.span>{" "}
              <motion.span variants={hWord} className="inline-block">any</motion.span>{" "}
              <motion.span variants={hWord} className="inline-block">text</motion.span>
              <br />
              {/* Line 2: "is" + emphasized group */}
              <motion.span variants={hWord} className="inline-block">is</motion.span>{" "}
              <span className="relative inline-block whitespace-nowrap">
                {/* "really" — emerald gradient + glow */}
                <motion.span
                  variants={hGlowWord}
                  className="inline-block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
                >
                  really
                </motion.span>{" "}
                {/* "saying." */}
                <motion.span variants={hWord} className="inline-block">
                  saying.
                </motion.span>
                {/* Underline sweep under "really saying." */}
                <motion.span
                  variants={hUnderline}
                  className="absolute -bottom-2 left-0 right-0 h-[2px] origin-left rounded-full bg-gradient-to-r from-emerald-400/60 via-emerald-400/30 to-transparent"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.48, delay: 0.15 }}
              className="mt-7 max-w-lg text-[17px] leading-relaxed text-slate-400"
            >
              FrameFinder surfaces framing patterns, loaded language, and missing
              perspectives in any article, speech, essay, or transcript.{" "}
              <span className="font-medium text-slate-200">
                Not just &ldquo;biased&rdquo; — how and why.
              </span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.24 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <Link
                href="/analyzer"
                className="group inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:bg-emerald-400"
              >
                Try a Free Scan
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/sample-report"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.05] px-6 py-3.5 text-base font-semibold text-slate-300 transition-colors duration-200 hover:bg-white/[0.09]"
              >
                View Sample Report
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.40 }}
              className="mt-7 text-[13px] font-medium tracking-wide text-[#a8bfaa]"
            >
              Built for AP Lang · AP Gov · History · Debate · Model UN
            </motion.p>
          </div>

          {/* ── Right: demo card ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18 }}
          >
            <DemoCard />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
