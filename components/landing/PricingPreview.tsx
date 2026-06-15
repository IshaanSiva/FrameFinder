"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "/ month",
    tagline: "Start developing your rhetorical eye.",
    features: [
      "3 Quick Scans / month",
      "800-word text limit",
      "Framing summary",
      "Bias risk score",
      "3 loaded language highlights",
    ],
    cta: "Get Started Free",
    ctaNote: "No credit card required",
    href: "/analyzer",
    featured: false,
  },
  {
    name: "Student Pro",
    price: "$9.99",
    period: "/ month",
    tagline: "Everything you need for AP, debate, and MUN.",
    features: [
      "100 Deep Scan credits / month",
      "Unlimited word length",
      "Full loaded language heatmap",
      "Claims vs. evidence checker",
      "PDF & YouTube analysis",
    ],
    cta: "Start Student Pro",
    ctaNote: "Cancel anytime · Instant access",
    href: "/pricing",
    featured: true,
  },
  {
    name: "Educator",
    price: "$39.99",
    period: "/ month",
    tagline: "Classroom tools for critical thinking at scale.",
    features: [
      "Everything in Student Pro",
      "Socratic Teacher Mode default",
      "Assignment link sharing",
      "Printable worksheets",
      "Student progress dashboard",
    ],
    cta: "Get Educator Pack",
    ctaNote: "School billing · W-9 available",
    href: "/pricing",
    featured: false,
  },
];

export default function PricingPreview() {
  return (
    <section className="border-t border-[#e2ddd4] bg-[#f4f0e6] pb-20 pt-16 sm:pb-24 sm:pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.42 }}
            className="mx-auto mb-14 max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-[#1c2018] sm:text-4xl">
              Simple, student-friendly pricing
            </h2>
            <p className="mt-3 text-lg text-[#687070]">
              Start free. Upgrade when you need more depth.
            </p>
          </motion.div>

          {/* Cards — featured is slightly elevated */}
          <div className="grid gap-5 sm:grid-cols-3 sm:items-start">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className={plan.featured ? "sm:-mt-5 sm:-mb-5" : ""}
              >
                <div
                  className={`relative flex h-full flex-col rounded-2xl ${
                    plan.featured
                      ? "bg-[#fdfbf5] ring-2 ring-emerald-500/35 ring-offset-4 ring-offset-[#f4f0e6] shadow-[0_8px_40px_rgba(16,185,129,0.10),0_20px_48px_rgba(0,0,0,0.07)]"
                      : "border border-[#d8d3c8] bg-[#fdfbf5] shadow-sm"
                  }`}
                >
                  {/* Featured badge */}
                  {plan.featured && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center rounded-full bg-emerald-600 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-sm shadow-emerald-600/40">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="flex flex-1 flex-col gap-0 p-7">

                    {/* Plan header */}
                    <div className="pb-5 border-b border-[#e8e4da]">
                      <p className={`mb-3 text-[10px] font-bold uppercase tracking-[0.16em] ${
                        plan.featured ? "text-emerald-700" : "text-[#9aac9e]"
                      }`}>
                        {plan.name}
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[42px] font-black leading-none tracking-tight text-[#1c2018]">
                          {plan.price}
                        </span>
                        <span className="text-sm text-[#a8a098]">{plan.period}</span>
                      </div>
                      <p className="mt-2 text-[13px] leading-snug text-[#687070]">
                        {plan.tagline}
                      </p>
                    </div>

                    {/* Features list */}
                    <ul className="flex flex-1 flex-col gap-3 py-5">
                      {plan.features.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <Check
                            className={`mt-0.5 h-4 w-4 shrink-0 ${
                              plan.featured ? "text-emerald-600" : "text-[#9aac9e]"
                            }`}
                          />
                          <span className={`text-[13px] leading-snug ${
                            plan.featured ? "text-[#1c2018] font-medium" : "text-[#3c4438]"
                          }`}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="pt-5 border-t border-[#e8e4da] space-y-2.5">
                      <Link
                        href={plan.href}
                        className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                          plan.featured
                            ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500"
                            : "border border-[#cec9be] bg-[#ede9df] text-[#3c4438] hover:bg-[#e5e0d4]"
                        }`}
                      >
                        {plan.cta}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <p className="text-center text-[11px] text-[#a8a098]">
                        {plan.ctaNote}
                      </p>
                    </div>

                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer note */}
          <p className="mt-10 text-center text-sm text-[#9aac9e]">
            All plans include core rhetorical analysis.{" "}
            <Link href="/pricing" className="font-medium text-emerald-700 hover:underline underline-offset-2 transition-colors">
              Full feature comparison →
            </Link>
          </p>

      </div>
    </section>
  );
}
