"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Nfc, ArrowRight } from "lucide-react";
import { Iridescence } from "@/components/holo/iridescence";
import {
  PricingCard,
  BGComponent1,
  BGComponent2,
  BGComponent3,
} from "@/components/ui/squishy-pricing";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function Pricing() {
  const root = useRef<HTMLElement>(null);
  const [yearly, setYearly] = useState(false);

  useGSAP(
    () => {
      gsap.from(".s4-reveal", {
        opacity: 0,
        y: 30,
        duration: 0.85,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
      });
      gsap.from(".s4-card", {
        opacity: 0,
        y: 46,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: ".s4-cards", start: "top 82%", once: true },
      });
    },
    { scope: root },
  );

  // Yearly is the anchor price; monthly billing costs ~15% more over a year.
  const billed = yearly ? "billed yearly — save 15%" : "billed monthly, cancel any time";

  return (
    <section id="pricing" ref={root} className="relative overflow-hidden bg-void py-28 md:py-40">
      <Iridescence
        parallax={16}
        blobs={[
          { color: "#3b6dff", size: 520, top: "-6%", left: "20%", blur: 120, opacity: 0.5 },
          { color: "#9b5cff", size: 560, top: "-10%", left: "44%", blur: 120, opacity: 0.55 },
          { color: "#ff5cc4", size: 500, top: "-4%", left: "66%", blur: 120, opacity: 0.5 },
        ]}
      />

      <div className="shell relative z-10">
        {/* header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="s4-reveal flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-royal-400" />
            Plans
          </p>
          <h2 className="s4-reveal mt-5 font-sans text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.04] tracking-tight">
            Care that scales — from{" "}
            <span className="font-serif font-normal italic text-white/80">one wrist</span> to a{" "}
            <span className="font-serif font-normal italic text-white/80">whole fleet.</span>
          </h2>
          <p className="s4-reveal mx-auto mt-5 max-w-md text-base leading-relaxed text-white/55">
            Start free on a single tag. Upgrade when your family — or your fleet —
            grows.
          </p>
        </div>

        {/* billing toggle */}
        <div className="s4-reveal mt-9 flex items-center justify-center gap-3">
          <div className="relative flex rounded-full border border-white/12 bg-white/[0.04] p-1">
            {(["Monthly", "Yearly"] as const).map((opt) => {
              const active = (opt === "Yearly") === yearly;
              return (
                <button
                  key={opt}
                  onClick={() => setYearly(opt === "Yearly")}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300",
                    active ? "bg-white text-neutral-900" : "text-white/60 hover:text-white",
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <span className="rounded-full bg-signal/15 px-2.5 py-1 text-xs font-medium text-signal-soft">
            Save 15%
          </span>
        </div>

        {/* cards */}
        <div className="s4-cards mt-12 flex flex-wrap justify-center gap-5">
          <div className="s4-card">
            <PricingCard
              label="Freemium"
              price="₹0"
              caption="free forever"
              tagline="For one patient getting started."
              features={["1 tag, read & written offline", "Responder mode + last 3 log entries", "MedVerify medicine checks"]}
              cta="Try it free"
              href="/app"
              background="bg-gradient-to-br from-[#3f74ff] to-[#243f9e]"
              BGComponent={BGComponent1}
            />
          </div>
          <div className="s4-card">
            <PricingCard
              label="Premium"
              price={yearly ? "₹499" : "₹49"}
              period={yearly ? "/yr" : "/mo"}
              caption={billed}
              tagline="For individuals who want the full picture."
              features={[
                "Multiple tags per patient",
                "Encrypted cloud backup + full log",
                "Emergency SMS / email alerts with location",
              ]}
              cta="Join the waitlist"
              href="/#waitlist"
              featured
              background="bg-gradient-to-br from-[#9b5cff] to-[#5a2ea0]"
              BGComponent={BGComponent2}
            />
          </div>
          <div className="s4-card">
            <PricingCard
              label="Family"
              price={yearly ? "₹1,799" : "₹179"}
              period={yearly ? "/yr" : "/mo"}
              caption={billed}
              tagline="Up to 4 people, managed from one account."
              features={[
                "Everything in Premium, for 4 members",
                "Guardian mode for kids & elders",
                "Shared access log + alerts",
              ]}
              cta="Join the waitlist"
              href="/#waitlist"
              background="bg-gradient-to-br from-[#ff5cc4] to-[#a52572]"
              BGComponent={BGComponent3}
            />
          </div>
        </div>

        {/* one-time hardware purchase */}
        <div className="s4-reveal mx-auto mt-12 flex max-w-4xl flex-col items-center justify-between gap-5 rounded-[22px] border border-white/10 bg-white/[0.03] p-6 md:flex-row">
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
              <Nfc className="h-6 w-6 text-royal-300" strokeWidth={1.7} />
            </span>
            <div>
              <p className="font-medium text-white">Just need the wristbands?</p>
              <p className="mt-0.5 text-sm text-white/55">
                Wristbands, cards and keychains ship blank — you write your own
                encrypted record. Pre-orders open soon; no payment is taken yet.
              </p>
            </div>
          </div>
          <a
            href="/contact?topic=order"
            data-cursor="buy"
            className="group inline-flex shrink-0 items-center gap-2 rounded-full bg-white py-3 pl-6 pr-3 text-sm font-medium text-neutral-900 transition-transform duration-300 hover:scale-[1.03]"
          >
            Pre-order wristbands
            <span className="grid h-7 w-7 place-items-center rounded-full bg-neutral-900 text-white transition-transform duration-300 group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" />
            </span>
          </a>
        </div>

        <p className="s4-reveal mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-white/40">
          Schools, events, EMS fleets and hospitals: bulk tags and a team dashboard on custom terms —{" "}
          <a href="/contact?topic=partnership" className="underline underline-offset-2 hover:text-white">
            talk to us
          </a>
          . Prototype pricing in INR; payments are not live yet, and nothing here charges you. See
          our{" "}
          <a href="/refunds" className="underline underline-offset-2 hover:text-white">
            refund policy
          </a>
          .
        </p>
      </div>
    </section>
  );
}
