"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { MockReport } from "@/lib/mockData";
import ReportWorkspace from "@/components/report/ReportWorkspace";

interface PdfReportMeta {
  totalPages: number;
  extractedPages: number;
  analyzedChars: number;
  wasTruncatedByPage: boolean;
  wasTruncatedByChar: boolean;
}

interface StoredReport {
  report: MockReport;
  topic: string;
  isPro: boolean;
  sourceText?: string;
  sourceType?: string;
  _usedMockFallback?: boolean;
  fallbackReason?: string | null;
  pdfMeta?: PdfReportMeta;
}

export default function ReportPage() {
  const router = useRouter();
  const [data, setData] = useState<StoredReport | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("ff_report");
    if (!raw) {
      router.replace("/analyzer");
      return;
    }
    try {
      const parsed: StoredReport = JSON.parse(raw);
      setData(parsed);
      if (parsed._usedMockFallback) {
        if (parsed.fallbackReason === "gemini_quota") {
          console.warn("[FrameFinder] Mock fallback: Gemini quota/rate limit (report is mock data)");
        } else if (process.env.NODE_ENV === "development") {
          console.error("[FrameFinder] mock-fallback active — fallbackReason:", parsed.fallbackReason ?? "unknown");
        } else {
          console.warn("[FrameFinder] Mock fallback active — Gemini unavailable.");
        }
      }
    } catch {
      router.replace("/analyzer");
    }
  }, [router]);

  if (!data) return null;

  const date = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const wordCount =
    data.sourceText && data.sourceText.trim()
      ? data.sourceText.trim().split(/\s+/).length
      : undefined;

  const pdfMeta = data.pdfMeta;

  return (
    <ReportWorkspace
      report={data.report}
      defaultIsPro={data.isPro}
      sourceText={data.sourceText}
      topic={data.topic}
      date={date}
      wordCount={wordCount}
      sourceType={data.sourceType}
      usedMockFallback={data._usedMockFallback}
      fallbackReason={data.fallbackReason}
      pdfTruncated={
        pdfMeta
          ? pdfMeta.wasTruncatedByPage || pdfMeta.wasTruncatedByChar
          : undefined
      }
      pdfExtractedPages={pdfMeta?.extractedPages}
      pdfTotalPages={pdfMeta?.totalPages}
    />
  );
}
