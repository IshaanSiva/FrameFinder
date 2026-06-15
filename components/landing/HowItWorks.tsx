"use client";

import { ClipboardPaste, Cpu, FileText } from "lucide-react";
import Marquee from "react-fast-marquee";
import CountUp from "react-countup";
import { motion } from "motion/react";

const FEED_ITEMS = [
  "detecting loaded language",
  "mapping framing lens",
  "checking evidence gaps",
  "surfacing missing perspectives",
  "rewriting neutral language",
  "scanning source structure",
  "auditing claim support",
  "flagging emotional appeals",
  "tracing rhetorical patterns",
  "rating argument strength",
  "identifying false consensus",
  "measuring stance polarity",
];

const STATS = [
  { end: 6,  suffix: "",  label: "Analytical dimensions" },
  { end: 60, suffix: "+", label: "Loaded language patterns" },
  { end: 7,  suffix: "",  label: "Topic categories" },
];

const STEPS = [
  {
    icon: ClipboardPaste,
    number: "01",
    title: "Paste Your Text",
    description:
      "Drop in any article, speech, essay, or transcript. Free users get up to 800 words — Pro gets full-length documents, PDFs, and YouTube transcripts.",
    border: "border-[#d8d3c8]",
    numColor: "text-[#e8e4dc]",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  {
    icon: Cpu,
    number: "02",
    title: "FrameFinder Analyzes",
    description:
      "AI scans for framing patterns, loaded language, evidence quality, missing perspectives, and logical fallacies — going deeper than any simple bias label.",
    border: "border-emerald-200",
    numColor: "text-emerald-100",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  {
    icon: FileText,
    number: "03",
    title: "Read Your Report",
    description:
      "A structured report with framing summary, scored bias indicators, and phrase-level analysis. Enable Socratic Mode to receive guiding questions instead of answers.",
    border: "border-amber-200",
    numColor: "text-amber-100",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

export default function HowItWorks() {
  return (
    <section>
      {/* ── Live intelligence feed strip ─────────────────────────── */}
      <div className="bg-[#e8e4da] border-y border-[#d4cfc5]">

        {/* LIVE header row */}
        <div className="flex items-center gap-4 px-5 py-2.5 sm:px-8">
          <div className="flex shrink-0 items-center gap-2">
            <motion.span
              className="block h-2 w-2 rounded-full bg-emerald-600"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <span className="font-mono text-[9px] font-black uppercase tracking-[0.28em] text-emerald-700">
              Live
            </span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-emerald-600/35 to-transparent" />
          <span className="shrink-0 font-mono text-[8px] tracking-wider text-[#7a8e7c]">
            FrameFinder Analysis Engine
          </span>
        </div>

        {/* Scrolling feed */}
        <div className="pb-3.5">
          <Marquee speed={32} gradient gradientColor="#e8e4da" gradientWidth={120}>
            {FEED_ITEMS.map((item, i) => (
              <span key={i} className="inline-flex items-center">
                <span className="inline-flex items-center gap-2.5 px-9">
                  <span className="h-[5px] w-[5px] shrink-0 rounded-full bg-emerald-600/70" />
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.17em] text-[#2c3a2d]">
                    {item}
                  </span>
                </span>
                <span className="font-mono text-[11px] text-[#7d9080]">·</span>
              </span>
            ))}
          </Marquee>
        </div>
      </div>

      {/* ── Stats + Steps ───────────────────────────────────────── */}
      <div className="bg-[#f4f0e6] py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45 }}
            className="mb-16 grid grid-cols-3 divide-x divide-[#d8d3c8] rounded-2xl border border-[#d8d3c8] bg-[#f0ece0]/60 px-4 py-8 shadow-sm sm:px-8"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="px-4 text-center sm:px-6">
                <div className="text-3xl font-black tracking-tight text-[#1c2018] sm:text-4xl">
                  <CountUp
                    end={stat.end}
                    suffix={stat.suffix}
                    duration={2.2}
                    enableScrollSpy
                    scrollSpyOnce
                  />
                </div>
                <div className="mt-1 text-xs font-medium text-[#687070] sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.42 }}
            className="mx-auto mb-12 max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-[#1c2018] sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-lg text-[#687070]">
              Three steps from raw text to rhetorical insight.
            </p>
          </motion.div>

          {/* Step cards */}
          <div className="grid gap-5 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
              >
                <div
                  className={`relative h-full rounded-2xl border ${step.border} bg-[#fdfbf5] p-7 shadow-sm transition-shadow duration-200 hover:shadow-md`}
                >
                  <div className={`absolute right-5 top-5 select-none font-mono text-5xl font-black ${step.numColor}`}>
                    {step.number}
                  </div>
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl shadow-sm ${step.iconBg} ${step.iconColor}`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#1c2018]">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#687070]">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
