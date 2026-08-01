"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/button";
import { CredentialCard } from "@/components/brand/credential-card";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".hero-eyebrow", { opacity: 0, y: 16, duration: 0.6 })
        .from(
          ".hero-line",
          { yPercent: 120, duration: 1, stagger: 0.12 },
          "-=0.2",
        )
        .from(".hero-sub", { opacity: 0, y: 20, duration: 0.7 }, "-=0.6")
        .from(".hero-cta", { opacity: 0, y: 18, duration: 0.6, stagger: 0.1 }, "-=0.4")
        .from(
          ".hero-card",
          { opacity: 0, y: 60, scale: 0.9, rotateX: 12, duration: 1.1 },
          "-=0.8",
        )
        .from(".hero-scroll", { opacity: 0, duration: 0.6 }, "-=0.3");
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="on-ink relative flex min-h-screen flex-col items-center overflow-hidden bg-ink pb-24 pt-36 text-white md:pt-40"
    >
      <div className="glow-royal absolute inset-0" />
      <div className="grid-fade absolute inset-0" />
      <div className="grain absolute inset-0" />

      <div className="shell relative z-10 flex flex-col items-center text-center">
        <p className="hero-eyebrow inline-flex items-center gap-2 rounded-pill border border-white/15 bg-white/[0.04] px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-signal" />
          Edge-medical · offline-first
        </p>

        <h1 className="mt-7 max-w-5xl font-display text-[clamp(2.75rem,6vw,5.5rem)] font-semibold leading-[1.02] tracking-tight">
          <span className="block overflow-hidden pb-1">
            <span className="hero-line block">Your medical record,</span>
          </span>
          <span className="block overflow-hidden pb-1">
            <span className="hero-line block">
              on a single <span className="text-royal-400">tap.</span>
            </span>
          </span>
        </h1>

        <p className="hero-sub mt-7 max-w-xl text-balance text-base leading-relaxed text-white/60 md:text-lg">
          An AES-256-GCM record encrypted onto an NFC wristband. Any phone reads
          it in under two seconds — with zero network, no login, and no database
          to breach.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <div className="hero-cta">
            <Button href="/app" variant="white" arrow cursorLabel="open" className="px-7 py-3.5">
              Launch the app
            </Button>
          </div>
          <div className="hero-cta">
            <Button href="#how" variant="ghostInverse" className="px-7 py-3.5">
              See how it works
            </Button>
          </div>
        </div>

        <div className="hero-card mt-16 [transform-style:preserve-3d]">
          <CredentialCard />
        </div>
      </div>

      <div className="hero-scroll pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40">
            Scroll
          </span>
          <span className="relative flex h-10 w-px justify-center bg-white/15">
            <span className="absolute top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-royal-400 animate-float-slow" />
          </span>
        </div>
      </div>
    </section>
  );
}
