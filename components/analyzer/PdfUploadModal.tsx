"use client";

import { useState, useRef, useEffect } from "react";
import {
  FileUp, Lock, Zap, X, Loader2, CheckCircle, AlertTriangle, XCircle,
  Sparkles, FileSearch,
} from "lucide-react";
import Link from "next/link";
import { extractTextFromPdf } from "@/lib/extractPdfText";

type PdfStatus = "idle" | "extracting" | "ready" | "scanned" | "error";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string) => Promise<void>;
  isPro: boolean;
}

export default function PdfUploadModal({ open, onClose, onSubmit, isPro }: Props) {
  const [status, setStatus] = useState<PdfStatus>("idle");
  const [fileName, setFileName] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showTextPreview, setShowTextPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { reset(); onClose(); }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setErrorMsg("Please upload a PDF file.");
      setStatus("error");
      return;
    }
    setFileName(file.name);
    setStatus("extracting");

    const result = await extractTextFromPdf(file);

    console.log("[PDF] File:", file.name);
    if (result.ok) {
      console.log("[PDF] Chars:", result.text.length, "| Preview:", result.text.slice(0, 200));
    } else {
      console.log("[PDF] Failed:", result.reason, result.message);
    }

    if (!result.ok) {
      result.reason === "scanned" ? setStatus("scanned") : setErrorMsg(result.message);
      if (result.reason !== "scanned") setStatus("error");
      return;
    }

    const words = result.text.trim().split(/\s+/).length;
    setWordCount(words);
    setPageCount(result.extractedPageCount);
    setExtractedText(result.text);
    setStatus("ready");
  }

  function reset() {
    setStatus("idle");
    setFileName("");
    setExtractedText("");
    setErrorMsg("");
    setIsDragging(false);
    setIsGenerating(false);
    isSubmittingRef.current = false;
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleClose() {
    reset();
    setShowTextPreview(false);
    onClose();
  }

  async function handleGenerate() {
    if (isSubmittingRef.current || !extractedText || isGenerating) return;
    isSubmittingRef.current = true;
    setIsGenerating(true);
    setErrorMsg("");
    try {
      await onSubmit(extractedText);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[FrameFinder] PDF analysis error:", msg);
      setErrorMsg(msg);
      setStatus("error");
      setIsGenerating(false);
      isSubmittingRef.current = false;
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
        onClick={handleClose}
      />

      {/* Modal panel */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-black/10">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileUp className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-900">Upload PDF</span>
          </div>
          <button
            onClick={handleClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* ── Free-tier lock ── */}
        {!isPro ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-200 bg-amber-50">
              <Lock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">PDF Upload is a Pro feature</p>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">
                Upgrade to FrameFinder Pro to analyze PDF documents up to 50 pages.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-sm transition-all hover:from-amber-300 hover:to-orange-300"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Unlock Pro
            </Link>
            <button
              onClick={handleClose}
              className="text-xs text-slate-400 transition-colors hover:text-slate-600"
            >
              Use text input instead
            </button>
          </div>

        ) : status === "idle" ? (
          /* ── Drop zone ── */
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
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-12 transition-all ${
              isDragging
                ? "border-emerald-400 bg-emerald-50"
                : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100/50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white">
              <FileUp className="h-5 w-5 text-slate-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">Drag and drop a PDF</p>
              <p className="mt-0.5 text-xs text-slate-400">or click to browse</p>
            </div>
            <p className="text-[11px] text-slate-400">Text-based PDFs only · Max ~50 pages</p>
          </div>

        ) : status === "extracting" ? (
          /* ── Extracting ── */
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Reading PDF…</p>
              <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-400">{fileName}</p>
            </div>
          </div>

        ) : status === "ready" ? (
          /* ── Ready ── */
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-emerald-800">{fileName}</p>
                <p className="mt-0.5 text-xs text-emerald-700">
                  {wordCount.toLocaleString()} words · {pageCount} {pageCount === 1 ? "page" : "pages"}
                </p>
              </div>
              <button
                onClick={reset}
                className="shrink-0 text-xs text-slate-400 transition-colors hover:text-slate-600"
              >
                Change
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Extracted Text</span>
                <button
                  onClick={() => setShowTextPreview(true)}
                  className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
                >
                  <FileSearch className="h-2.5 w-2.5" />
                  Preview
                </button>
              </div>
              <div className="px-3 py-2.5">
                <p className="line-clamp-3 text-xs leading-relaxed text-slate-500">
                  {extractedText.slice(0, 350)}…
                </p>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                isGenerating
                  ? "cursor-not-allowed bg-slate-100 text-slate-400"
                  : "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 active:scale-[0.99]"
              }`}
            >
              <Zap className="h-4 w-4" />
              {isGenerating ? "Generating…" : "Generate Analysis"}
            </button>
          </div>

        ) : status === "scanned" ? (
          /* ── Scanned PDF ── */
          <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Scanned PDF not supported</p>
              <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-slate-400">
                This PDF contains scanned images with no embedded text. Try a text-based PDF instead.
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
          /* ── Error ── */
          <div className="flex flex-col items-center justify-center gap-4 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Extraction failed</p>
              <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-slate-400">{errorMsg}</p>
            </div>
            <button
              onClick={reset}
              className="text-xs font-medium text-emerald-700 transition-colors hover:text-emerald-900"
            >
              Upload a different file →
            </button>
          </div>
        )}
      </div>

      {/* Full text preview — separate overlay above the modal */}
      {showTextPreview && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16"
          onClick={() => setShowTextPreview(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">Full Extracted Text</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {extractedText.length.toLocaleString()} chars · {wordCount.toLocaleString()} words · {pageCount}{" "}
                  {pageCount === 1 ? "page" : "pages"}
                </p>
              </div>
              <button
                onClick={() => setShowTextPreview(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
              <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-600">
                {extractedText}
              </p>
            </div>
            <div className="border-t border-slate-100 px-5 py-3 text-right">
              <button
                onClick={() => setShowTextPreview(false)}
                className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
