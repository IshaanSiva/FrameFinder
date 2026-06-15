"use client";

import { HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { MockReport } from "@/lib/mockData";

interface SocraticModeToggleProps {
  enabled: boolean;
  onToggle: (val: boolean) => void;
  questions: MockReport["socraticQuestions"];
}

export default function SocraticModeToggle({ enabled, onToggle, questions }: SocraticModeToggleProps) {
  return (
    <div
      className="overflow-hidden rounded-2xl border shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
      style={{ backgroundColor: "#fdfbf5", borderColor: "#d8d3c8" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ backgroundColor: "#f0ece0", borderColor: "#d8d3c8" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={
              enabled
                ? { backgroundColor: "#dce8dc", color: "#2c5c34" }
                : { backgroundColor: "#e8e4da", color: "#687070" }
            }
          >
            <HelpCircle className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: "#1c2018" }}>Socratic Teacher Mode</h3>
            <p className="text-xs" style={{ color: "#7a8e7c" }}>
              {enabled
                ? "Showing guiding questions instead of direct answers"
                : "Toggle on for guided questions only"}
            </p>
          </div>
        </div>
        <Switch checked={enabled} onCheckedChange={onToggle} />
      </div>

      {enabled ? (
        <div className="p-5">
          <p className="mb-4 text-sm" style={{ color: "#687070" }}>
            Rather than giving you the answers, consider these questions:
          </p>
          <ol className="space-y-2.5">
            {questions.map((q, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border px-4 py-3"
                style={{ backgroundColor: "#f4f9f4", borderColor: "#c4d4c4" }}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-black text-white mt-0.5"
                  style={{ backgroundColor: "#1e2c20" }}
                >
                  {i + 1}
                </span>
                <p className="text-sm leading-relaxed" style={{ color: "#1c2018" }}>{q}</p>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed" style={{ color: "#687070" }}>
            Socratic Mode replaces direct analysis with guiding questions — ideal for students developing independent judgment, or for teachers who want to facilitate discussion without handing over the answers.
          </p>
        </div>
      )}
    </div>
  );
}
