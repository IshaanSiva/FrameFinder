"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";

interface Analysis {
  id: string;
  topic: string;
  source_type: string;
  word_count: number;
  created_at: string;
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days  = Math.floor(diffMs / 86_400_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)  return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AnalyzerSidebar() {
  const pathname = usePathname();
  const [history, setHistory]               = useState<Analysis[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const activeId =
    pathname.startsWith("/analyzer/report/")
      ? pathname.slice("/analyzer/report/".length).split(/[?#]/)[0]
      : null;

  useEffect(() => {
    setHistoryLoading(true);
    fetch("/api/analyses")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setHistory(d.analyses ?? []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [pathname]);

  return (
    <aside
      className="hidden flex-shrink-0 flex-col min-h-0 overflow-hidden border-r md:flex"
      style={{
        width: "min(30%, 400px)",
        minWidth: "260px",
        backgroundColor: "#d0dcce",
        borderColor: "#b0c8b0",
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex-shrink-0 border-b px-5 py-4"
        style={{ backgroundColor: "#1e2c20", borderColor: "rgba(16,185,129,0.15)" }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-500/25">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
              </span>
            </span>
            <div>
              <h2 className="text-[14px] font-bold leading-tight" style={{ color: "#f4f0e6" }}>
                Report Library
              </h2>
              <p className="mt-px text-[11px]" style={{ color: "#6a8a6a" }}>
                Your saved framing reports
              </p>
            </div>
          </div>
          {!historyLoading && history.length > 0 && (
            <span className="mt-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full border border-emerald-700/40 bg-emerald-500/15 px-1.5 text-[10px] font-bold tabular-nums text-emerald-300">
              {history.length}
            </span>
          )}
        </div>
      </div>

      {/* ── Scrollable report list ── */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3.5 pb-4 pt-3.5">

        {!historyLoading && history.length > 0 && (
          <div className="mb-3.5 flex items-center gap-2 px-0.5">
            <span className="font-mono text-[8px] font-black uppercase tracking-[0.22em] text-emerald-800/60">
              Recent
            </span>
            <div className="h-px flex-1" style={{ backgroundColor: "#a8c0a8" }} />
          </div>
        )}

        {historyLoading ? (
          <div className="space-y-2.5">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-[84px] animate-pulse rounded-xl"
                style={{ backgroundColor: "#b8ccb8" }}
              />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl border"
              style={{ backgroundColor: "#c0d0c0", borderColor: "#a8c0a8" }}
            >
              <BookOpen className="h-5 w-5" style={{ color: "#4a7050" }} />
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: "#1e2c20" }}>No reports yet</p>
              <p className="mt-1.5 max-w-[200px] text-[11.5px] leading-relaxed" style={{ color: "#4a6a4c" }}>
                Run your first analysis to start building your library.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => {
              const isActive = item.id === activeId;
              const isPdf    = item.source_type === "pdf";
              return (
                <Link
                  key={item.id}
                  href={`/analyzer/report/${item.id}`}
                  className={`group flex items-stretch overflow-hidden rounded-xl border transition-all duration-200 active:scale-[0.99] ${
                    isActive
                      ? "border-transparent"
                      : "hover:-translate-y-[1px] hover:border-[#98b898] hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)]"
                  }`}
                  style={{
                    borderColor: isActive ? "transparent" : "#b8ccb8",
                    background: isActive
                      ? "linear-gradient(175deg, #243a26 0%, #1e2c20 45%)"
                      : "#edf3ed",
                    boxShadow: isActive
                      ? "0 6px_24px_rgba(16,185,129,0.18), 0 2px 8px rgba(0,0,0,0.14)"
                      : undefined,
                  }}
                >
                  {/* Left accent bar */}
                  <div
                    className={`w-1 flex-shrink-0 rounded-l-xl transition-colors duration-200 ${
                      isPdf
                        ? "bg-amber-400/80"
                        : isActive
                        ? "bg-emerald-400"
                        : "bg-[#b8ccb8] group-hover:bg-emerald-400/70"
                    }`}
                  />
                  {/* Card body */}
                  <div className="flex min-w-0 flex-1 flex-col gap-2 py-3.5 pl-4 pr-3.5">
                    <p
                      className="line-clamp-2 text-[13.5px] font-semibold leading-snug"
                      style={{ color: isActive ? "#f4f0e6" : "#1c2018" }}
                    >
                      {item.topic}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`shrink-0 rounded-md px-1.5 py-[2px] text-[9.5px] font-bold uppercase tracking-wide ring-1 ${
                          isPdf
                            ? isActive
                              ? "bg-amber-500/20 text-amber-300 ring-amber-600/40"
                              : "bg-amber-50 text-amber-700 ring-amber-200/80"
                            : isActive
                              ? "bg-emerald-500/20 text-emerald-300 ring-emerald-600/40"
                              : "bg-emerald-50 text-emerald-700 ring-emerald-200/80"
                        }`}
                      >
                        {isPdf ? "PDF" : "Text"}
                      </span>
                      <span
                        className="text-[11px]"
                        style={{ color: isActive ? "#8aaa8a" : "#6a8a6e" }}
                      >
                        {item.word_count.toLocaleString()} words
                      </span>
                      <span
                        className="ml-auto tabular-nums text-[10.5px]"
                        style={{ color: isActive ? "#5a7860" : "#7a9a7e" }}
                      >
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
