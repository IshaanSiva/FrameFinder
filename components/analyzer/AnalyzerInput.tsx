"use client";

import { FileText, FileUp, PlayCircle, GitCompare } from "lucide-react";

export type InputMode = "text" | "pdf" | "youtube" | "compare";

interface Tab {
  mode: InputMode;
  icon: React.ElementType;
  label: string;
  badge?: string;
  locked: boolean;
}

const TABS: Tab[] = [
  { mode: "text",    icon: FileText,   label: "Paste Text",       locked: false },
  { mode: "pdf",     icon: FileUp,     label: "Upload PDF",       badge: "Pro", locked: false },
  { mode: "youtube", icon: PlayCircle, label: "YouTube / Link",   locked: true },
  { mode: "compare", icon: GitCompare, label: "Compare Sources",  locked: true },
];

interface Props {
  active: InputMode;
  onSelect: (mode: InputMode) => void;
  isPro: boolean;
}

export default function AnalyzerInput({ active, onSelect, isPro }: Props) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-[#ddd8d0] bg-[#f0ece4] p-1">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.mode;
        return (
          <button
            key={tab.mode}
            onClick={() => onSelect(tab.mode)}
            title={tab.locked ? `${tab.label} — Coming Soon` : tab.label}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all sm:flex-none sm:justify-start sm:px-4 ${
              isActive
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/[0.06]"
                : tab.locked
                ? "cursor-pointer text-slate-400 hover:text-slate-500"
                : "cursor-pointer text-slate-500 hover:bg-white/60 hover:text-slate-800"
            }`}
          >
            <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-slate-700" : ""}`} />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.badge && !isPro && (
              <span className="hidden rounded border border-amber-200 bg-amber-50 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-amber-700 sm:inline">
                Pro
              </span>
            )}
            {tab.locked && (
              <span className="hidden rounded-md bg-slate-200/70 px-1.5 py-0.5 text-[9px] font-semibold text-slate-400 sm:inline">
                Soon
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
