"use client";

import { useState, useRef } from "react";
import {
  FileUp, Zap, X, Loader2, CheckCircle, AlertTriangle, XCircle,
  FileSearch, Info,
} from "lucide-react";
import { extractTextFromPdf, getPdfPageCount } from "@/lib/extractPdfText";

type PdfStatus = "idle" | "extracting" | "ready" | "scanned" | "error";

type LargePdfModal =
  | { visible: false }
  | { visible: true; file: File; totalPages: number; pageLimit: number };

export interface PdfSubmitMeta {
  totalPages: number;
  extractedPages: number;
  wasTruncatedByPage: boolean;
}

interface Props {
  onSubmit: (text: string, meta: PdfSubmitMeta) => Promise<void>;
  isPro: boolean;
}

export default function PdfUploadPanel({ onSubmit, isPro }: Props) {
  const [status, setStatus] = useState<PdfStatus>("idle");
  const [fileName, setFileName] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [totalPageCount, setTotalPageCount] = useState(0);
  const [extractedPageCount, setExtractedPageCount] = useState(0);
  const [wasTruncatedByPage, setWasTruncatedByPage] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showTextPreview, setShowTextPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [largePdfModal, setLargePdfModal] = useState<LargePdfModal>({ visible: false });
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);

  const pageLimit = isPro ? 50 : 10;

  // Runs extraction and moves component to "ready" state.
  async function extractAndShow(file: File, maxPages: number) {
    const result = await extractTextFromPdf(file, maxPages);

    if (!result.ok) {
      console.log("[PDF] Failed:", result.reason, result.message);
      if (result.reason === "scanned") {
        setStatus("scanned");
      } else {
        setErrorMsg(result.message);
        setStatus("error");
      }
      return;
    }

    const words = result.text.trim().split(/\s+/).length;
    setWordCount(words);
    setTotalPageCount(result.totalPageCount);
    setExtractedPageCount(result.extractedPageCount);
    setWasTruncatedByPage(result.wasTruncatedByPage);
    setExtractedText(result.text);
    setStatus("ready");
  }

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setErrorMsg("Please upload a PDF file.");
      setStatus("error");
      return;
    }

    setFileName(file.name);
    setStatus("extracting");

    // Quick page count check — reads PDF structure only, no text extraction.
    // Shows a choice modal instead of silently truncating or hard-blocking.
    let totalPages = 0;
    try {
      totalPages = await getPdfPageCount(file);
    } catch {
      // Can't read page count — fall through to extraction, which handles errors.
    }

    if (totalPages > pageLimit) {
      setStatus("idle");
      setLargePdfModal({ visible: true, file, totalPages, pageLimit });
      return;
    }

    await extractAndShow(file, pageLimit);
  }

  function reset() {
    setStatus("idle");
    setFileName("");
    setExtractedText("");
    setErrorMsg("");
    setIsDragging(false);
    setIsGenerating(false);
    setLargePdfModal({ visible: false });
    isSubmittingRef.current = false;
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleGenerate() {
    if (isSubmittingRef.current || !extractedText || isGenerating) return;
    isSubmittingRef.current = true;
    setIsGenerating(true);
    setErrorMsg("");
    try {
      await onSubmit(extractedText, {
        totalPages: totalPageCount,
        extractedPages: extractedPageCount,
        wasTruncatedByPage,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[FrameFinder] PDF analysis error:", msg);
      setErrorMsg(msg);
      setStatus("error");
      setIsGenerating(false);
      isSubmittingRef.current = false;
    }
  }

  return (
    <div>
      {status === "idle" ? (
        <div className="p-5">
          {!isPro && (
            <div className="mb-3 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700">
                Free plan: 1 PDF/week · 10 pages max
              </span>
            </div>
          )}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-16 transition-all ${
              isDragging
                ? "border-emerald-400 bg-emerald-50"
                : "border-[#d4cfc5] bg-[#f4f0e6] hover:border-emerald-300 hover:bg-[#f0ece0]"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#d8d3c8] bg-[#fdfbf5] shadow-sm">
              <FileUp className="h-5 w-5 text-[#7a8e7c]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[#1c2018]">Drag and drop a PDF</p>
              <p className="mt-0.5 text-xs text-[#7a8e7c]">or click to browse</p>
            </div>
            <p className="text-[11px] text-[#a8bfaa]">Text-based PDFs only · First {isPro ? 50 : 10} pages analyzed</p>
          </div>
        </div>

      ) : status === "extracting" ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-[#1c2018]">Reading PDF…</p>
            <p className="mt-0.5 max-w-[220px] truncate text-xs text-[#7a8e7c]">{fileName}</p>
          </div>
        </div>

      ) : status === "ready" ? (
        <div className="flex flex-col gap-3 p-5">
          {/* File info */}
          <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-emerald-800">{fileName}</p>
              <p className="mt-0.5 text-xs text-emerald-700">
                {wordCount.toLocaleString()} words · {extractedPageCount} {extractedPageCount === 1 ? "page" : "pages"} extracted
                {wasTruncatedByPage && ` of ${totalPageCount}`}
              </p>
            </div>
            <button
              onClick={reset}
              className="shrink-0 text-xs font-medium text-[#7a8e7c] transition-colors hover:text-[#1c2018]"
            >
              Change
            </button>
          </div>

          {/* Truncation notice */}
          {wasTruncatedByPage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
              <p className="text-[11.5px] leading-snug text-amber-800">
                <span className="font-semibold">Partial analysis</span> — showing first{" "}
                {extractedPageCount} of {totalPageCount} pages. The report reflects only this excerpt.
              </p>
            </div>
          )}

          {/* Text preview card */}
          <div className="overflow-hidden rounded-xl border border-[#d4cfc5] bg-[#f4f0e6]">
            <div className="flex items-center justify-between border-b border-[#d8d3c8] px-3 py-2">
              <span className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-[#7a8e7c]">
                {wasTruncatedByPage
                  ? `Extracted text · pages 1–${extractedPageCount}`
                  : "Extracted text · full document"}
              </span>
              <button
                onClick={() => setShowTextPreview(true)}
                className="flex items-center gap-1 rounded-md border border-[#d8d3c8] bg-[#fdfbf5] px-2 py-0.5 text-[10px] font-medium text-[#687070] transition-colors hover:border-[#c4bfb8] hover:text-[#1c2018]"
              >
                <FileSearch className="h-2.5 w-2.5" />
                Preview
              </button>
            </div>
            <div className="px-3 py-2.5">
              <p className="line-clamp-3 text-xs leading-relaxed text-[#687070]">
                {extractedText.slice(0, 350)}…
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
              {errorMsg}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
              isGenerating
                ? "cursor-not-allowed bg-[#e8e4da] text-[#7a8e7c]"
                : "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 active:scale-[0.99]"
            }`}
          >
            <Zap className="h-4 w-4" />
            {isGenerating ? "Running analysis…" : "Run Framing Analysis"}
          </button>
        </div>

      ) : status === "scanned" ? (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1c2018]">Scanned PDF not supported</p>
            <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-[#7a8e7c]">
              This PDF contains scanned images with no embedded text. Try a text-based PDF.
            </p>
          </div>
          <button
            onClick={reset}
            className="text-xs font-medium text-emerald-700 transition-colors hover:text-emerald-900"
          >
            Upload a different file →
          </button>
        </div>

      ) : (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50">
            <XCircle className="h-5 w-5 text-rose-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1c2018]">Extraction failed</p>
            <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-[#7a8e7c]">{errorMsg}</p>
          </div>
          <button
            onClick={reset}
            className="text-xs font-medium text-emerald-700 transition-colors hover:text-emerald-900"
          >
            Upload a different file →
          </button>
        </div>
      )}

      {/* ── Large PDF modal ── */}
      {largePdfModal.visible && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1c2018]/60 p-4 backdrop-blur-[2px]"
          onClick={reset}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-2xl border border-[#d4cfc5] bg-[#fdfbf5] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-[#d8d3c8] px-5 py-4" style={{ backgroundColor: "#f0ece0" }}>
              <p className="text-sm font-bold text-[#1c2018]">Large PDF detected</p>
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              <p className="text-[13.5px] leading-relaxed text-[#2c3a2d]">
                This PDF has <strong>{largePdfModal.totalPages} pages</strong>.{" "}
                {isPro
                  ? "Student Pro supports PDFs up to 50 pages. You can analyze the first 50 pages."
                  : "Free users can analyze the first 10 pages, or upgrade to Student Pro for PDFs up to 50 pages."}
              </p>
            </div>

            {/* Actions */}
            <div
              className="flex flex-col gap-2 border-t border-[#d8d3c8] px-5 py-4"
              style={{ backgroundColor: "#f4f0e6" }}
            >
              <button
                onClick={async () => {
                  if (!largePdfModal.visible) return;
                  const { file, pageLimit: limit } = largePdfModal;
                  setLargePdfModal({ visible: false });
                  setFileName(file.name);
                  setStatus("extracting");
                  await extractAndShow(file, limit);
                }}
                className="w-full rounded-xl bg-emerald-500 py-2.5 text-[13px] font-bold text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-[0.99]"
              >
                Analyze first {largePdfModal.pageLimit} pages
              </button>

              {!isPro && (
                <button
                  onClick={() => { window.location.href = "/pricing"; }}
                  className="w-full rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-[13px] font-semibold text-amber-700 transition-all hover:bg-amber-100"
                >
                  View Pricing
                </button>
              )}

              <button
                onClick={reset}
                className="w-full py-2 text-[12px] font-medium text-[#7a8e7c] transition-colors hover:text-[#1c2018]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Full text preview modal ── */}
      {showTextPreview && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-[#1c2018]/60 p-4 pt-16 backdrop-blur-[2px]"
          onClick={() => setShowTextPreview(false)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#d4cfc5] bg-[#fdfbf5] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between border-b border-[#d8d3c8] px-5 py-4"
              style={{ backgroundColor: "#f0ece0" }}
            >
              <div>
                <p className="text-sm font-semibold text-[#1c2018]">
                  {wasTruncatedByPage
                    ? `Extracted Text — Pages 1–${extractedPageCount} of ${totalPageCount}`
                    : "Full Extracted Text"}
                </p>
                <p className="mt-0.5 text-xs text-[#7a8e7c]">
                  {extractedText.length.toLocaleString()} chars · {wordCount.toLocaleString()} words ·{" "}
                  {extractedPageCount} {extractedPageCount === 1 ? "page" : "pages"} extracted
                </p>
              </div>
              <button
                onClick={() => setShowTextPreview(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d8d3c8] text-[#7a8e7c] transition-colors hover:border-[#c4bfb8] hover:text-[#1c2018]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
              <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-[#687070]">
                {extractedText}
              </p>
            </div>
            <div className="border-t border-[#d8d3c8] px-5 py-3 text-right" style={{ backgroundColor: "#f4f0e6" }}>
              <button
                onClick={() => setShowTextPreview(false)}
                className="text-xs font-medium text-[#687070] transition-colors hover:text-[#1c2018]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
