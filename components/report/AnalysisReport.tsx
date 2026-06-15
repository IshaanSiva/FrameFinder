"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { MockReport } from "@/lib/mockData";
import FramingSummary from "./FramingSummary";
import BiasRiskScore from "./BiasRiskScore";
import LoadedLanguageTable from "./LoadedLanguageTable";
import ClaimsChecker from "./ClaimsChecker";
import LogicalFallacies from "./LogicalFallacies";
import MissingPerspectives from "./MissingPerspectives";
import NeutralRewrite from "./NeutralRewrite";
import SocraticModeToggle from "./SocraticModeToggle";
import FadeInSection from "./FadeInSection";
import ReportNav from "./ReportNav";

interface AnalysisReportProps {
  report: MockReport;
  isPro?: boolean;
  isSample?: boolean;
}

export default function AnalysisReport({ report, isPro = false, isSample = false }: AnalysisReportProps) {
  const [socraticMode, setSocraticMode] = useState(false);

  return (
    <div>
      <ReportNav isSample={isSample} />

      <p className="mb-4 text-center text-[11px]" style={{ color: "#a8bfaa" }}>
        Scroll down or click a tab above to navigate the full report
      </p>

      <div className="space-y-5">
        <div id="report-socratic">
          <FadeInSection delay={0}>
            <SocraticModeToggle
              enabled={socraticMode}
              onToggle={setSocraticMode}
              questions={report.socraticQuestions}
            />
          </FadeInSection>
        </div>

        {!socraticMode && (
          <>
            <div id="report-summary">
              <FadeInSection delay={60}>
                <FramingSummary data={report.framingSummary} />
              </FadeInSection>
            </div>

            {/* Clickable hint — scrolls to Bias Score section */}
            <div className="flex justify-center py-1">
              <button
                onClick={() =>
                  document.getElementById("report-bias")?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="group flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-800 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-100"
              >
                More report sections below
                <ChevronDown className="h-3.5 w-3.5 animate-bounce text-emerald-600 group-hover:text-emerald-800" />
              </button>
            </div>

            <div id="report-bias">
              <FadeInSection delay={120}>
                <BiasRiskScore data={report.biasRiskScores} />
              </FadeInSection>
            </div>

            <div id="report-language">
              <FadeInSection delay={0}>
                <LoadedLanguageTable phrases={report.loadedPhrases} isPro={isPro} isSample={isSample} />
              </FadeInSection>
            </div>

            <div id="report-claims">
              <FadeInSection delay={0}>
                <ClaimsChecker claims={report.claims} isPro={isPro} isSample={isSample} />
              </FadeInSection>
            </div>

            <div id="report-fallacies">
              <FadeInSection delay={0}>
                <LogicalFallacies fallacies={report.fallacies} isPro={isPro} isSample={isSample} />
              </FadeInSection>
            </div>

            <div id="report-perspectives">
              <FadeInSection delay={0}>
                <MissingPerspectives perspectives={report.missingPerspectives} isPro={isPro} isSample={isSample} />
              </FadeInSection>
            </div>

            <div id="report-rewrite">
              <FadeInSection delay={0}>
                <NeutralRewrite rewrite={report.neutralRewrite} isPro={isPro} isSample={isSample} />
              </FadeInSection>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
