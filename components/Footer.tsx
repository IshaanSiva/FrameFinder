"use client";

import Link from "next/link";
import { Scan } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isAnalyzer = pathname.startsWith("/analyzer");

  if (isAnalyzer) {
    return null;
  }

  return (
    <footer className="border-t border-[#d8d3c8]" style={{ backgroundColor: "#f4f0e6" }}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        {/* Top row: logo / nav / copyright */}
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600/10 ring-1 ring-emerald-200 text-emerald-700">
              <Scan className="h-3 w-3" />
            </div>
            <span className="text-sm font-bold text-[#1c2018]">
              Frame<span className="text-emerald-700">Finder</span>
            </span>
          </div>

          {/* Product nav links */}
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-[13px] text-[#7a8e7c]">
            <Link href="/"              className="transition-colors hover:text-[#1c2018]">Home</Link>
            <Link href="/analyzer"      className="transition-colors hover:text-[#1c2018]">Analyzer</Link>
            <Link href="/sample-report" className="transition-colors hover:text-[#1c2018]">Sample Report</Link>
            <Link href="/pricing"       className="transition-colors hover:text-[#1c2018]">Pricing</Link>
          </nav>

          {/* Copyright */}
          <p className="text-[12px] text-[#a8bfaa]">
            © {new Date().getFullYear()} FrameFinder
          </p>
        </div>

        {/* Disclaimer blurb */}
        <p className="mx-auto mt-5 max-w-xl text-center text-[11.5px] leading-relaxed text-[#a8bfaa]">
          FrameFinder identifies <em>possible</em> bias indicators and framing patterns.
          Results are not definitive judgments — always apply your own critical thinking.
        </p>

        {/* Legal links row */}
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
          <Link href="/privacy"        className="text-[11.5px] text-[#a8bfaa] transition-colors hover:text-[#687070]">Privacy Policy</Link>
          <Link href="/terms"          className="text-[11.5px] text-[#a8bfaa] transition-colors hover:text-[#687070]">Terms of Service</Link>
          <Link href="/refunds"        className="text-[11.5px] text-[#a8bfaa] transition-colors hover:text-[#687070]">Refunds</Link>
          <Link href="/ai-disclaimer"  className="text-[11.5px] text-[#a8bfaa] transition-colors hover:text-[#687070]">AI Disclaimer</Link>
          <Link href="/contact"        className="text-[11.5px] text-[#a8bfaa] transition-colors hover:text-[#687070]">Contact</Link>
        </div>

      </div>
    </footer>
  );
}
