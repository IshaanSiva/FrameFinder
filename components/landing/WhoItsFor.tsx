"use client";

import { BookOpen, Globe, Mic2, GraduationCap } from "lucide-react";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";

interface Audience {
  icon: LucideIcon;
  title: string;
  description: string;
  tags: string[];
  iconClass: string;
  tagClass: string;
  hoverBorder: string;
  accentBar: string;
}

const AUDIENCES: Audience[] = [
  {
    icon: BookOpen,
    title: "AP Lang Students",
    description:
      "Identify rhetorical appeals, loaded diction, and framing strategies in non-fiction texts. Build the analytical vocabulary your exam demands.",
    tags: ["Rhetorical Analysis", "Loaded Diction", "AP Exam Prep"],
    iconClass: "text-emerald-700 bg-emerald-50 border border-emerald-100",
    tagClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    hoverBorder: "hover:border-emerald-300",
    accentBar: "bg-emerald-500",
  },
  {
    icon: Globe,
    title: "AP Gov & History",
    description:
      "Analyze political speeches, news articles, and primary sources for agenda framing, selective evidence, and propaganda techniques.",
    tags: ["Political Framing", "Primary Sources", "Media Literacy"],
    iconClass: "text-teal-700 bg-teal-50 border border-teal-100",
    tagClass: "bg-teal-50 text-teal-700 border-teal-200",
    hoverBorder: "hover:border-teal-300",
    accentBar: "bg-teal-500",
  },
  {
    icon: Mic2,
    title: "Debate & Model UN",
    description:
      "Spot logical fallacies and weak evidence in opposing arguments. Build rebuttals grounded in what the text actually claims — and fails to prove.",
    tags: ["Fallacy Detection", "Argument Analysis", "Rebuttal Prep"],
    iconClass: "text-amber-700 bg-amber-50 border border-amber-100",
    tagClass: "bg-amber-50 text-amber-700 border-amber-200",
    hoverBorder: "hover:border-amber-300",
    accentBar: "bg-amber-500",
  },
  {
    icon: GraduationCap,
    title: "Teachers & Educators",
    description:
      "Use Socratic Mode to generate discussion questions from any text. Create assignments that develop media literacy without handing students the answers.",
    tags: ["Socratic Mode", "Discussion Prompts", "Media Literacy"],
    iconClass: "text-slate-600 bg-slate-100 border border-slate-200",
    tagClass: "bg-slate-100 text-slate-600 border-slate-200",
    hoverBorder: "hover:border-slate-400",
    accentBar: "bg-slate-400",
  },
];

export default function WhoItsFor() {
  return (
    <section className="bg-[#f4f0e6] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.42 }}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-[#1c2018] sm:text-4xl">
            Built for critical thinkers
          </h2>
          <p className="mt-3 text-lg text-[#687070]">
            Designed around the analytical skills your courses actually assess.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.38, delay: i * 0.06 }}
            >
              <div
                className={`group relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-[#e2ddd4] bg-[#fdfbf5] p-6 shadow-sm transition-all duration-200 hover:shadow-md ${a.hoverBorder}`}
              >
                {/* Accent top bar */}
                <div className={`absolute inset-x-0 top-0 h-0.5 ${a.accentBar} opacity-0 transition-opacity duration-200 group-hover:opacity-100`} />

                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${a.iconClass}`}>
                  <a.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#1c2018]">{a.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#687070]">
                    {a.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {a.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${a.tagClass}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
