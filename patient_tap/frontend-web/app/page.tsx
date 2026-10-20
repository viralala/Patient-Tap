import { SiteNav } from "@/components/redesign/site-nav";
import { SiteFooter } from "@/components/redesign/footer";
import { Hero } from "@/components/home/hero";
import { WhatItDoes } from "@/components/home/what-it-does";
import { HowItWorks } from "@/components/home/how-it-works";
import { Compare } from "@/components/home/compare";
import { Plans } from "@/components/home/plans";
import { Faq } from "@/components/home/faq";
import { Waitlist } from "@/components/home/waitlist";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main id="main" className="w-full max-w-full overflow-x-clip bg-canvas text-bone">
        <Hero />
        <WhatItDoes />
        <HowItWorks />
        <Compare />
        <Plans />
        <Faq />
        <Waitlist />
      </main>
      <SiteFooter />
    </>
  );
}
