import { SiteNav } from "@/components/redesign/site-nav";
import { Hero } from "@/components/redesign/hero";
import { SpecStrip } from "@/components/redesign/spec-strip";
import { Impact } from "@/components/redesign/impact";
import { CredentialFeature } from "@/components/redesign/credential-feature";
import { EmergencyStory } from "@/components/redesign/emergency-story";
import { ScanFeature } from "@/components/redesign/scan-feature";
import { FeaturesBento } from "@/components/redesign/features-bento";
import { MedVerifyFeature } from "@/components/redesign/medverify-feature";
import { DonationFeature } from "@/components/redesign/donation-feature";
import { SecurityFeature } from "@/components/redesign/security-feature";
import { InsightsFeature } from "@/components/redesign/insights-feature";
import { BandChoice } from "@/components/redesign/band-choice";
import { Pricing } from "@/components/redesign/pricing";
import { Roadmap } from "@/components/redesign/roadmap";
import { Team } from "@/components/redesign/team";
import { Faq } from "@/components/redesign/faq";
import { Waitlist } from "@/components/redesign/waitlist";
import { Updates } from "@/components/redesign/updates";
import { SiteFooter } from "@/components/redesign/footer";

// The story, in order: hook → why → the band → an emergency → the app →
// new features → trust → product choices → what's next → people → act.
export default function Home() {
  return (
    <>
      <SiteNav />
      <main id="main" className="w-full max-w-full overflow-x-clip bg-void text-white">
        <Hero />
        <SpecStrip />
        <Impact />
        <CredentialFeature />
        <EmergencyStory />
        <ScanFeature />
        <FeaturesBento />
        <MedVerifyFeature />
        <DonationFeature />
        <SecurityFeature />
        <InsightsFeature />
        <BandChoice />
        <Pricing />
        <Roadmap />
        <Team />
        <Faq />
        <Waitlist />
        <Updates />
      </main>
      <SiteFooter />
    </>
  );
}
