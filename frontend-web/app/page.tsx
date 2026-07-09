import { RedesignNav } from "@/components/redesign/site-nav";
import { Hero } from "@/components/redesign/hero";
import { CredentialFeature } from "@/components/redesign/credential-feature";
import { ScanFeature } from "@/components/redesign/scan-feature";
import { Pricing } from "@/components/redesign/pricing";
import { InsightsFeature } from "@/components/redesign/insights-feature";
import { BandChoice } from "@/components/redesign/band-choice";
import { Updates } from "@/components/redesign/updates";
import { RedesignFooter } from "@/components/redesign/footer";

// Holographic redesign. Old light-theme sections live in components/landing/*.
export default function Home() {
  return (
    <>
      <RedesignNav />
      <main className="w-full max-w-full overflow-x-hidden bg-void text-white">
        <Hero />
        <CredentialFeature />
        <ScanFeature />
        <Pricing />
        <InsightsFeature />
        <BandChoice />
        <Updates />
      </main>
      <RedesignFooter />
    </>
  );
}
