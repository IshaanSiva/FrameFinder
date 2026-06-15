"use client";

import { useEffect } from "react";
import AnalyzerSidebar from "@/components/analyzer/AnalyzerSidebar";

// Shared shell for all /analyzer routes:
// - Suppresses body scroll (footer hidden; panels have own scroll)
// - Renders the persistent Report Library sidebar
// - Wraps children in the outer flex container
export default function AnalyzerLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="flex min-h-0 overflow-hidden" style={{ height: "calc(100dvh - 64px)" }}>
      <AnalyzerSidebar />
      {children}
    </div>
  );
}
