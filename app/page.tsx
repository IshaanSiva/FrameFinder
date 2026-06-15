import Hero from "@/components/landing/Hero";
import RhetoricBreakdown from "@/components/landing/RhetoricBreakdown";
import HowItWorks from "@/components/landing/HowItWorks";
import AnalysisLayers from "@/components/landing/AnalysisLayers";
import WhoItsFor from "@/components/landing/WhoItsFor";
import FeaturesSection from "@/components/landing/FeaturesSection";
import PricingPreview from "@/components/landing/PricingPreview";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <RhetoricBreakdown />
      <HowItWorks />
      <AnalysisLayers />
      <WhoItsFor />
      <FeaturesSection />
      <PricingPreview />
    </main>
  );
}
