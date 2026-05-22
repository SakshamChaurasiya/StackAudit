import {
  BenefitsSection,
  CtaSection,
  FaqSection,
  FeaturesSection,
  HeroSection,
  TrustSection,
  WorkflowSection,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <BenefitsSection />
      <WorkflowSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}
