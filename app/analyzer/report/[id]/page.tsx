"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import type { MockReport } from "@/lib/mockData";
import ReportWorkspace from "@/components/report/ReportWorkspace";

interface SavedAnalysis {
  id: string;
  topic: string;
  source_type: string;
  word_count: number;
  created_at: string;
  used_mock_fallback: boolean;
  report: MockReport;
  input_text: string | null;
}

export default function SavedReportPage() {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/analyses/${id}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => { if (d) setAnalysis(d.analysis); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div
        className="flex flex-1 items-center justify-center"
        style={{
          backgroundColor: "#f4f0e6",
          backgroundImage: "radial-gradient(circle, rgba(44,90,44,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#d4cfc5] border-t-emerald-500" />
          <p className="text-sm font-medium text-[#687070]">Loading report…</p>
        </div>
      </div>
    );
  }

  if (notFound || !analysis) {
    return (
      <div
        className="flex flex-1 items-center justify-center p-6"
        style={{
          backgroundColor: "#f4f0e6",
          backgroundImage: "radial-gradient(circle, rgba(44,90,44,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      >
        <div
          className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border px-8 py-16 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
          style={{ backgroundColor: "#fdfbf5", borderColor: "#d4cfc5" }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-[#ede8db]" style={{ borderColor: "#d4cfc5" }}>
            <FileText className="h-5 w-5 text-[#b8b0a0]" />
          </div>
          <div>
            <p className="text-base font-semibold text-[#1c2018]">Report not found</p>
            <p className="mt-1 text-sm text-[#687070]">
              This report may have been deleted or does not belong to your account.
            </p>
          </div>
          <Link
            href="/analyzer"
            className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-colors hover:bg-emerald-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Analyzer
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(analysis.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <ReportWorkspace
      report={analysis.report}
      topic={analysis.topic}
      date={date}
      wordCount={analysis.word_count}
      sourceType={analysis.source_type}
      usedMockFallback={analysis.used_mock_fallback}
      sourceText={analysis.input_text ?? undefined}
    />
  );
}
