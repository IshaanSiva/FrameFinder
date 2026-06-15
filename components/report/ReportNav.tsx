"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

const NAV_ITEMS = [
  { id: "report-summary",      label: "Summary",         locked: false },
  { id: "report-bias",         label: "Bias Score",      locked: false },
  { id: "report-language",     label: "Loaded Language", locked: false },
  { id: "report-claims",       label: "Claims",          locked: true  },
  { id: "report-fallacies",    label: "Fallacies",       locked: true  },
  { id: "report-perspectives", label: "Perspectives",    locked: true  },
  { id: "report-rewrite",      label: "Neutral Rewrite", locked: true  },
  { id: "report-socratic",     label: "Pro Tools",       locked: true  },
] as const;

type NavId = (typeof NAV_ITEMS)[number]["id"];

export default function ReportNav({ isSample = false }: { isSample?: boolean }) {
  const [activeId, setActiveId] = useState<NavId>("report-summary");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: "-126px 0px -55% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 126;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  return (
    <div className="sticky top-16 z-20 mb-5">
      <div
        className="relative overflow-hidden rounded-xl border shadow-sm backdrop-blur-sm"
        style={{ backgroundColor: "rgba(240,236,224,0.97)", borderColor: "#d8d3c8" }}
      >
        <div className="flex gap-1 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map(({ id, label, locked }) => {
            const isActive = activeId === id;
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all"
                style={
                  isActive
                    ? {
                        backgroundColor: "#f0faf4",
                        border: "1px solid rgba(16,185,129,0.40)",
                        color: "#1a4030",
                        fontWeight: 600,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.07)",
                      }
                    : {
                        color: "#687070",
                        border: "1px solid transparent",
                      }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f0ece0";
                    (e.currentTarget as HTMLButtonElement).style.color = "#1c2018";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "";
                    (e.currentTarget as HTMLButtonElement).style.color = "#687070";
                  }
                }}
              >
                {label}
                {locked && !isSample && (
                  <Lock className="h-2.5 w-2.5 shrink-0" style={{ color: "#a8bfaa", opacity: 0.7 }} />
                )}
              </button>
            );
          })}
        </div>
        {/* Right-edge fade */}
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-10"
          style={{ background: "linear-gradient(to left, rgba(240,236,224,0.97), transparent)" }}
        />
      </div>
    </div>
  );
}
