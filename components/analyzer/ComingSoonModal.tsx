"use client";

import { useEffect } from "react";
import { PlayCircle, GitCompare, Clock, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  mode: "youtube" | "compare";
}

const COPY = {
  youtube: {
    title: "YouTube / Link",
    description:
      "Analyzing YouTube transcripts and web articles is coming in a future release. Use text input to paste extracted content for now.",
  },
  compare: {
    title: "Compare Sources",
    description:
      "Side-by-side framing comparison of two texts is coming in a future release. Analyze each source separately for now.",
  },
};

export default function ComingSoonModal({ open, onClose, mode }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const { title, description } = COPY[mode];
  const Icon = mode === "compare" ? GitCompare : PlayCircle;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/10">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-900">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Clock className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Coming Soon</p>
            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500">{description}</p>
          </div>
          <button
            onClick={onClose}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );
}
