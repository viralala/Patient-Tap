"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ShieldCheck, HeartPulse, Droplet, Pill, PhoneCall } from "lucide-react";
import { Iridescence } from "@/components/holo/iridescence";
import { PhoneMock } from "@/components/holo/phone-mock";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function ScanFeature() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".s3-reveal", {
        opacity: 0,
        y: 34,
        duration: 0.9,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });
      gsap.from(".s3-phone", {
        opacity: 0,
        y: 56,
        scale: 0.94,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 64%", once: true },
      });
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.to(".s3-phone", {
          y: -14,
          duration: 4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }
    },
    { scope: root },
  );

  return (
    <section id="responders" ref={root} className="relative overflow-hidden bg-void py-28 md:py-40">
      <Iridescence
        blobs={[
          { color: "#9b5cff", size: 520, top: "12%", left: "8%", blur: 105 },
          { color: "#3b6dff", size: 480, top: "0%", left: "22%", blur: 100 },
          { color: "#37e0f0", size: 420, top: "34%", left: "4%", blur: 100 },
          { color: "#ff5cc4", size: 460, top: "40%", left: "24%", blur: 105, opacity: 0.55 },
        ]}
      />

      <div className="shell relative z-10 grid items-center gap-16 lg:grid-cols-2">
        {/* phone — left */}
        <div className="s3-phone order-2 flex justify-center lg:order-1 lg:justify-start">
          <PhoneMock>
            <ResponderScreen />
          </PhoneMock>
        </div>

        {/* text — right */}
        <div className="order-1 lg:order-2 lg:pl-6">
          <p className="s3-reveal flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-critical" />
            For first responders
          </p>
          <h2 className="s3-reveal mt-5 max-w-md font-sans text-[clamp(2rem,4.4vw,3.6rem)] font-bold leading-[1.03] tracking-tight">
            <span className="font-serif font-normal italic text-white/80">
              Scan, decrypt &amp; log
            </span>{" "}
            a whole record at the touch of a{" "}
            <span className="font-serif font-normal italic text-white/80">tap.</span>
          </h2>
          <p className="s3-reveal mt-6 max-w-md text-base leading-relaxed text-white/55 md:text-lg">
            The scan opens straight into a life-safety layout — DNR and allergies
            loudest and reddest — with no login, no signal, and no lag between the
            tap and the truth.
          </p>
          <div className="s3-reveal mt-8">
            <Button href="/app?role=responder" variant="ghostInverse" arrow cursorLabel="scan">
              Open responder mode
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Dark-themed decrypted responder screen for the marketing mockup. */
function ResponderScreen() {
  return (
    <div className="flex h-full flex-col gap-3 px-4 pb-6 pt-14 text-white">
      {/* subtle holo tint at the top of the screen */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(155,92,255,0.18),transparent_70%)]" />

      <div className="relative flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/15 px-2.5 py-1 text-[10px] font-medium text-signal-soft">
          <ShieldCheck className="h-3 w-3" /> Verified
        </span>
        <span className="font-mono text-[10px] text-white/40">PT-0007</span>
      </div>

      <div className="relative">
        <p className="font-display text-lg font-semibold tracking-tight">Arjun Mehta</p>
        <p className="font-mono text-[10px] text-white/40">O− · updated 6h ago</p>
      </div>

      {/* DNR banner — loudest */}
      <div className="relative flex items-center gap-2 rounded-2xl bg-critical px-3.5 py-3 text-white">
        <HeartPulse className="h-5 w-5 shrink-0" strokeWidth={2.2} />
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold">DNR — Do Not Resuscitate</p>
        </div>
      </div>

      <div className="relative">
        <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-white/40">
          Allergies
        </p>
        <div className="flex flex-wrap gap-1.5">
          {["Penicillin", "Peanuts", "Latex"].map((a) => (
            <span
              key={a}
              className="rounded-full bg-critical/15 px-2.5 py-1 text-[11px] font-medium text-critical-soft"
            >
              {a}
            </span>
          ))}
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
          <div className="flex items-center gap-1 text-white/40">
            <Droplet className="h-3 w-3" />
            <span className="font-mono text-[9px] uppercase tracking-widest">Blood</span>
          </div>
          <p className="mt-0.5 font-display text-xl font-semibold">O−</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.04] px-3 py-2.5">
          <div className="flex items-center gap-1 text-white/40">
            <Pill className="h-3 w-3" />
            <span className="font-mono text-[9px] uppercase tracking-widest">Meds</span>
          </div>
          <p className="mt-0.5 font-display text-xl font-semibold">3</p>
        </div>
      </div>

      <div className="relative mt-auto flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-3.5 py-3">
        <div>
          <p className="text-xs font-medium">Priya Mehta</p>
          <p className="text-[10px] text-white/40">Spouse · +91 98765 43210</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-royal-500 px-3 py-1.5 text-[11px] font-medium text-white">
          <PhoneCall className="h-3 w-3" /> Alert
        </span>
      </div>
    </div>
  );
}
