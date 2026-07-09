"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  HeartPulse,
  ShieldCheck,
  Layers,
  GitCommit,
  PhoneCall,
  Droplet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const POINTS = [
  {
    icon: Layers,
    title: "Decided by hierarchy",
    body: "DNR and allergies are the largest, reddest elements on screen — never buried below the fold.",
  },
  {
    icon: GitCommit,
    title: "Append-only chain",
    body: "Every dose and vital is written back to the tag as tamper-evident history of care.",
  },
  {
    icon: PhoneCall,
    title: "One-tap next of kin",
    body: "Fire an SMS with a live GPS pin to an emergency contact without leaving the record.",
  },
];

export function LifeSafety() {
  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        card.current,
        { scale: 0.86, opacity: 0.5, filter: "brightness(0.65)" },
        {
          scale: 1,
          opacity: 1,
          filter: "brightness(1)",
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
            end: "top 26%",
            scrub: true,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      id="responders"
      ref={root}
      className="on-ink relative overflow-hidden bg-ink py-28 text-white md:py-40"
    >
      <div className="glow-royal absolute inset-0 opacity-40" />
      <div className="grain absolute inset-0" />

      <div className="shell relative z-10 grid items-center gap-16 lg:grid-cols-2">
        {/* copy */}
        <div>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-critical-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-critical" />
            For first responders
          </p>
          <h2 className="mt-5 max-w-lg font-display text-[clamp(2rem,4.2vw,3.4rem)] font-semibold leading-[1.05] tracking-tight">
            The most dangerous facts, impossible to miss.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-white/55">
            A responder has seconds and a stranger&apos;s wrist. The scan opens
            straight into a life-safety layout — the record does the triage
            before anyone reads a word.
          </p>

          <ul className="mt-10 space-y-6">
            {POINTS.map((p) => (
              <li key={p.title} className="flex gap-4">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10">
                  <p.icon className="h-5 w-5 text-royal-300" strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="font-medium">{p.title}</h3>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-white/50">
                    {p.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <Button href="/app?role=responder" variant="ghostInverse" arrow cursorLabel="scan">
              Open responder mode
            </Button>
          </div>
        </div>

        {/* responder screen mock */}
        <div className="flex justify-center lg:justify-end">
          <div
            ref={card}
            className="w-[min(92vw,400px)] overflow-hidden rounded-[28px] border border-white/10 bg-paper text-ink card-shadow-lg"
          >
            {/* status bar */}
            <div className="flex items-center justify-between bg-ink px-5 py-3 text-white">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-signal-soft">
                <ShieldCheck className="h-3.5 w-3.5" /> Decrypted · verified
              </span>
              <span className="font-mono text-[10px] text-white/50">PT-0007</span>
            </div>

            {/* critical banner */}
            <div className="bg-critical px-5 py-4 text-white">
              <div className="flex items-center gap-2">
                <HeartPulse className="h-5 w-5" />
                <span className="font-display text-xl font-semibold tracking-tight">
                  DNR — DO NOT RESUSCITATE
                </span>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
                  Allergies
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {["Penicillin", "Peanuts", "Latex"].map((a) => (
                    <span
                      key={a}
                      className="rounded-pill bg-critical/10 px-3 py-1.5 text-sm font-medium text-critical-deep"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-paper-line bg-paper-card p-3.5">
                  <div className="flex items-center gap-1.5 text-ink/40">
                    <Droplet className="h-3.5 w-3.5" />
                    <span className="font-mono text-[10px] uppercase tracking-widest">Blood</span>
                  </div>
                  <p className="mt-1 font-display text-2xl font-semibold tnum">O−</p>
                </div>
                <div className="rounded-2xl border border-paper-line bg-paper-card p-3.5">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-ink/40">
                    Medications
                  </span>
                  <p className="mt-1 font-display text-2xl font-semibold tnum">3</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-royal-50 p-3.5">
                <div>
                  <p className="text-sm font-medium text-ink">Priya Mehta</p>
                  <p className="text-xs text-ink/50">Spouse · +91 98765 43210</p>
                </div>
                <span className="rounded-pill bg-royal-500 px-3.5 py-2 text-xs font-medium text-white">
                  Alert
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
