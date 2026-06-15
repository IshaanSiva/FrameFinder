"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Annotation {
  level: "h" | "m";
  technique: string;
  explanation: string;
}

type Part =
  | { kind: "text"; text: string }
  | { kind: "phrase"; text: string; note: Annotation };

const PARTS: Part[] = [
  { kind: "text",   text: "This " },
  { kind: "phrase", text: "reckless policy", note: {
    level: "h", technique: "Emotional Framing",
    explanation: "Implies careless decision-making before any evidence is presented, priming the reader to reject it on feeling rather than fact.",
  }},
  { kind: "text",   text: " will " },
  { kind: "phrase", text: "destroy", note: {
    level: "h", technique: "Unsupported Certainty",
    explanation: "Forecloses any middle-ground outcome — partial impact, reversibility, and mitigation disappear behind an absolute prediction.",
  }},
  { kind: "text",   text: " student independence and lead to " },
  { kind: "phrase", text: "disastrous consequences", note: {
    level: "h", technique: "Catastrophizing",
    explanation: "Amplifies fear well beyond what any cited evidence supports, suspending the reader's evaluative judgment.",
  }},
  { kind: "text",   text: ". These " },
  { kind: "phrase", text: "draconian measures", note: {
    level: "h", technique: "Borrowed Authority",
    explanation: "Imports the moral weight of ancient Athenian harshness. The comparison requires the reader to accept it as apt without any evidence.",
  }},
  { kind: "text",   text: " strip teenagers of their autonomy at a critical developmental stage. " },
  { kind: "phrase", text: "Any reasonable person", note: {
    level: "m", technique: "False Consensus",
    explanation: "Implies that disagreement is a sign of unreasonableness, pressuring acceptance without engaging counterarguments.",
  }},
  { kind: "text",   text: " can see that this policy was created by " },
  { kind: "phrase", text: "out-of-touch administrators", note: {
    level: "h", technique: "Ad Hominem",
    explanation: "Attacks the character and competence of decision-makers rather than engaging with their stated reasoning.",
  }},
  { kind: "text",   text: " who have forgotten what it means to be young. " },
  { kind: "phrase", text: "The research is clear", note: {
    level: "m", technique: "Vague Authority",
    explanation: "Appeals to unnamed research to silence debate — no study, author, or data is cited to support the claim.",
  }},
  { kind: "text",   text: ": students need their phones for safety, learning, and communication." },
];

const LOADED_PHRASES = [
  { phrase: "reckless policy",             impact: "High"   },
  { phrase: "disastrous consequences",     impact: "High"   },
  { phrase: "draconian measures",          impact: "High"   },
  { phrase: "out-of-touch administrators", impact: "High"   },
  { phrase: "Any reasonable person",       impact: "Medium" },
  { phrase: "The research is clear",       impact: "Medium" },
];

const CLAIMS = [
  { claim: "Students need their phones.", evidence: "No study cited — asserted as fact.", risk: "Unsupported" as const },
  { claim: "The research is clear.",      evidence: "Vague appeal to unnamed research.",  risk: "Weak"        as const },
];

const MISSING = [
  "Teachers who support restrictions",
  "Students who favour phone-free focus",
  "Academic performance data",
  "Safety protocol alternatives",
];

const reportVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const sectionVariants = {
  hidden:  { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease: "easeOut" } },
};

function AnnotatedPhrase({ text, note }: { text: string; note: Annotation }) {
  const [open, setOpen] = useState(false);
  const high = note.level === "h";

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        className={`cursor-default rounded px-[3px] py-px font-semibold transition-colors duration-150 ${
          high
            ? "bg-red-100 text-red-800 hover:bg-red-200"
            : "bg-amber-100 text-amber-800 hover:bg-amber-200"
        }`}
      >
        {text}
      </span>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-3 w-64 -translate-x-1/2 rounded-xl border border-white/[0.10] bg-[#141e17] px-3.5 py-3 shadow-2xl shadow-black/50"
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                high ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"
              }`}>
                {high ? "High Impact" : "Medium Impact"}
              </span>
              <span className="text-[10px] font-semibold text-slate-300">{note.technique}</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">{note.explanation}</p>
            <div className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-[#141e17]" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

export default function RhetoricBreakdown() {
  return (
    <section>
      {/* Thin fade in from graphite hero */}
      <div className="h-10 bg-gradient-to-b from-[#1e2c20] to-[#f4f0e6] pointer-events-none" />

      <div className="bg-[#f4f0e6] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.45 }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl font-black tracking-tighter text-[#1c2018] sm:text-4xl lg:text-[46px] leading-tight">
              From messy rhetoric to{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                clear analysis.
              </span>
            </h2>
            <p className="mt-3 text-[15px] text-[#687070]">
              Hover any highlighted phrase to see the technique being used.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">

            {/* ── Left: biased source text (no overflow-hidden so tooltips escape) */}
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.48 }}
            >
              <div className="rounded-2xl border border-[#d8d3c8] bg-[#fdfbf5] shadow-sm">

                {/* Chrome bar */}
                <div className="flex items-center justify-between rounded-t-2xl border-b border-[#e5dfd4] bg-[#f5f1e8] px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-[#9aac9e]">
                      Source Text
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    <span className="text-[10px] font-medium text-[#b8b0a4]">7 issues detected</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="text-[15px] leading-[1.9] text-[#3c4438]">
                    {PARTS.map((part, i) =>
                      part.kind === "phrase" ? (
                        <AnnotatedPhrase key={i} text={part.text} note={part.note} />
                      ) : (
                        <span key={i}>{part.text}</span>
                      )
                    )}
                  </div>

                  {/* Legend */}
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#e5dfd4] pt-4">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-red-200" />
                      <span className="text-[10px] text-[#9aac9e]">High impact</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-amber-200" />
                      <span className="text-[10px] text-[#9aac9e]">Medium impact</span>
                    </div>
                    <span className="text-[10px] text-[#b8b0a4]">Hover to inspect</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ── Right: FrameFinder report (dark premium card) ──── */}
            <motion.div
              variants={reportVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false, amount: 0.35 }}
            >
              <div className="overflow-hidden rounded-2xl border border-emerald-800/40 bg-[#0c1510] shadow-[0_0_60px_rgba(16,185,129,0.14),0_20px_40px_rgba(0,0,0,0.3)]">

                <div className="h-px w-full bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent" />

                <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#0a120d] px-5 py-3.5">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                    FrameFinder Report
                  </span>
                  <span className="rounded-full border border-amber-800/40 bg-amber-950/40 px-2 py-0.5 text-[9px] font-bold text-amber-400">
                    Medium-High Risk
                  </span>
                </div>

                <div className="space-y-2.5 p-5">

                  <motion.div variants={sectionVariants} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                    <p className="mb-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Topic</p>
                    <p className="text-sm font-semibold text-slate-100">School Phone Ban Policy</p>
                  </motion.div>

                  <motion.div variants={sectionVariants} className="rounded-xl border border-emerald-700/30 bg-emerald-950/50 px-4 py-3">
                    <p className="mb-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-500">Framing Lens</p>
                    <p className="text-sm font-semibold text-slate-100">Student freedom vs. administrative control</p>
                  </motion.div>

                  <motion.div variants={sectionVariants} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                    <p className="mb-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">
                      Loaded Language · {LOADED_PHRASES.length} detected
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {LOADED_PHRASES.map(({ phrase, impact }) => (
                        <span
                          key={phrase}
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium ${
                            impact === "High"
                              ? "border-red-900/30 bg-red-950/30 text-red-400"
                              : "border-amber-900/30 bg-amber-950/30 text-amber-400"
                          }`}
                        >
                          {phrase}
                          <span className="text-[8px] font-bold opacity-60">
                            {impact === "High" ? "·H" : "·M"}
                          </span>
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div variants={sectionVariants} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                    <p className="mb-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Weak Evidence</p>
                    <div className="space-y-2.5">
                      {CLAIMS.map(({ claim, evidence, risk }) => (
                        <div key={claim} className="flex items-start justify-between gap-3">
                          <span className="flex-1 text-[12px] leading-snug text-slate-300">&ldquo;{claim}&rdquo;</span>
                          <div className="flex shrink-0 flex-col items-end gap-0.5">
                            <span className={`text-[8px] font-bold uppercase tracking-wider ${
                              risk === "Unsupported" ? "text-red-400" : "text-amber-400"
                            }`}>{risk}</span>
                            <span className="text-right text-[9px] leading-tight text-slate-500">{evidence}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div variants={sectionVariants} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3">
                    <p className="mb-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500">Missing Perspectives</p>
                    <ul className="space-y-1.5">
                      {MISSING.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-[12px] text-slate-300">
                          <span className="h-1 w-1 shrink-0 rounded-full bg-emerald-500/70" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
