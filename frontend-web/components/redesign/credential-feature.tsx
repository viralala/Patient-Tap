"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Iridescence } from "@/components/holo/iridescence";
import { HoloCard } from "@/components/holo/holo-card";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function CredentialFeature() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Text: staggered fade + slide-up on enter (once).
      gsap.from(".s2-reveal", {
        opacity: 0,
        y: 34,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });

      // Card: scale + fade-in reveal (once).
      gsap.from(".s2-card", {
        opacity: 0,
        y: 48,
        scale: 0.9,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 62%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section id="card" ref={root} className="relative overflow-hidden bg-void py-28 md:py-40">
      {/* oil-slick glow pooled behind the card (right) */}
      <Iridescence
        blobs={[
          { color: "#3b6dff", size: 520, top: "6%", left: "50%", blur: 100 },
          { color: "#9b5cff", size: 580, top: "24%", left: "60%", blur: 105 },
          { color: "#37e0f0", size: 460, top: "-2%", left: "70%", blur: 95 },
          { color: "#ff5cc4", size: 520, top: "34%", left: "66%", blur: 105 },
          { color: "#57ffb0", size: 360, top: "10%", left: "84%", blur: 100, opacity: 0.5 },
        ]}
      />

      <div className="shell relative z-10 grid items-center gap-16 lg:grid-cols-2">
        {/* text */}
        <div className="flex flex-col">
          <h2 className="s2-reveal max-w-md font-sans text-[clamp(2rem,4.4vw,3.6rem)] font-bold leading-[1.03] tracking-tight">
            The wristband —{" "}
            <span className="font-serif font-normal italic text-white/80">
              sealed, offline &amp; yours.
            </span>
          </h2>
          <p className="s2-reveal mt-6 max-w-md text-base leading-relaxed text-white/55 md:text-lg">
            Everything that speaks for you when you can&apos;t — carried on your
            wrist, decrypted in a single tap by any phone.
          </p>
          <div className="s2-reveal mt-8">
            <Button href="#how" variant="ghostInverse" arrow cursorLabel="how">
              Learn more
            </Button>
          </div>
          <p className="s2-reveal mt-14 max-w-xs font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-white/35">
            Readable by any NFC phone. No app, no pairing, no account — 504 bytes
            sealed with AES-256-GCM.
          </p>
        </div>

        {/* card showcase */}
        <div className="s2-card flex justify-center lg:justify-end">
          <div className="rotate-[-12deg]">
            <HoloCard className="scale-[1.08] md:scale-[1.14]" />
          </div>
        </div>
      </div>
    </section>
  );
}
