"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Nfc, ShieldPlus, Pill, Users } from "lucide-react";
import { Iridescence } from "@/components/holo/iridescence";
import { PhoneMock } from "@/components/holo/phone-mock";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function InsightsFeature() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".s5-phone", {
        opacity: 0,
        y: 56,
        scale: 0.94,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 68%", once: true },
      });
      gsap.from(".s5-reveal", {
        opacity: 0,
        y: 30,
        duration: 0.85,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 55%", once: true },
      });
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.to(".s5-phone", {
          y: -14,
          duration: 4.2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }
    },
    { scope: root },
  );

  return (
    <section id="insights" className="relative overflow-hidden bg-void py-28 md:py-40" ref={root}>
      <Iridescence
        blobs={[
          { color: "#37e0f0", size: 480, top: "6%", left: "34%", blur: 115, opacity: 0.5 },
          { color: "#9b5cff", size: 540, top: "0%", left: "50%", blur: 120, opacity: 0.55 },
          { color: "#3b6dff", size: 460, top: "10%", left: "60%", blur: 115, opacity: 0.5 },
        ]}
      />

      <div className="shell relative z-10 flex flex-col items-center text-center">
        <div className="s5-phone">
          <PhoneMock>
            <PatientScreen />
          </PhoneMock>
        </div>

        <h2 className="s5-reveal mt-14 max-w-2xl font-sans text-[clamp(2rem,4.6vw,3.6rem)] font-bold leading-[1.05] tracking-tight">
          Get <span className="font-serif font-normal italic text-white/80">insights</span> into your
          record&apos;s <span className="font-serif font-normal italic text-white/80">health.</span>
        </h2>
        <p className="s5-reveal mx-auto mt-5 max-w-md text-base leading-relaxed text-white/55">
          See exactly how much of the tag is used, what a responder will read
          first, and when it was last written — all in one glance.
        </p>
        <div className="s5-reveal mt-8">
          <Button href="/app?role=patient" variant="ghostInverse" arrow cursorLabel="open">
            Open patient mode
          </Button>
        </div>
      </div>
    </section>
  );
}

/** Dark patient dashboard for the marketing mockup. */
function PatientScreen() {
  const pct = 0.78;
  const used = 391;
  const total = 504;
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);

  return (
    <div className="flex h-full flex-col gap-4 px-5 pb-6 pt-14 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(80%_100%_at_50%_0%,rgba(59,109,255,0.2),transparent_70%)]" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="font-display text-lg font-semibold tracking-tight">Alex Harmozi</p>
          <p className="font-mono text-[10px] text-white/40">PT-1042 · A+ · updated 1d ago</p>
        </div>
        <span className="rounded-full bg-signal/15 px-2.5 py-1 text-[10px] font-medium text-signal-soft">
          Pro
        </span>
      </div>

      {/* gauge */}
      <div className="relative mt-1 grid place-items-center">
        <svg viewBox="0 0 130 130" className="h-32 w-32 -rotate-90">
          <circle cx="65" cy="65" r={r} fill="none" strokeWidth="12" stroke="rgba(255,255,255,0.08)" />
          <circle
            cx="65"
            cy="65"
            r={r}
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            stroke="#6b8cff"
            strokeDasharray={circ}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="font-display text-2xl font-semibold tnum">{Math.round(pct * 100)}%</span>
          <span className="font-mono text-[9px] text-white/45 tnum">
            {used} / {total} B
          </span>
        </div>
      </div>

      {/* stat tiles */}
      <div className="relative grid grid-cols-3 gap-2">
        {[
          { icon: ShieldPlus, label: "Allergies", value: "2" },
          { icon: Pill, label: "Meds", value: "2" },
          { icon: Users, label: "Contacts", value: "1" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-white/8 bg-white/[0.04] px-2 py-2.5">
            <s.icon className="h-3.5 w-3.5 text-royal-300" strokeWidth={1.8} />
            <p className="mt-1.5 font-display text-lg font-semibold leading-none">{s.value}</p>
            <p className="mt-1 text-[9px] text-white/40">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-auto flex items-center justify-center gap-2 rounded-2xl bg-royal-500 py-3 text-sm font-semibold">
        <Nfc className="h-4 w-4" /> Write to tag
      </div>
    </div>
  );
}
