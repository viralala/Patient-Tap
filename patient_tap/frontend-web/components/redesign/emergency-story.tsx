"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Activity, MapPin, Nfc, ShieldCheck, MessageSquareText, ScrollText } from "lucide-react";
import { Iridescence } from "@/components/holo/iridescence";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
  {
    kicker: "12:41",
    title: "A collapse. No words.",
    body: "Arjun faints on a crowded platform. He can't tell anyone he's allergic to penicillin, takes metformin, or has a DNR wish.",
  },
  {
    kicker: "12:42",
    title: "One tap on the wrist.",
    body: "A paramedic holds any NFC phone to his wristband. No unlock, no login, no signal needed — the chip powers up from the phone itself.",
  },
  {
    kicker: "+1.6 s",
    title: "Decrypted on the spot.",
    body: "The 504-byte record is verified (AES-256-GCM detects tampering) and opens straight into a life-safety layout — the loudest warnings first.",
  },
  {
    kicker: "12:43",
    title: "Family alerted. Care logged.",
    body: "When there is signal, his emergency contacts get an SMS with his location, and every treatment is written back to the band as a chain of custody.",
  },
];

const PLAINTEXT = [
  "PT-0007  ARJUN MEHTA   O−",
  "DNR ··········· YES",
  "ALLERGY ······· PENICILLIN",
  "ALLERGY ······· PEANUTS",
  "MED ··· METFORMIN 500MG 2X",
  "ICE ··· PRIYA +91 98765 43210",
];
const GLYPHS = "ABCDEF0123456789#$%&*+=/<>";

/** Ciphertext that resolves, character by character, into the record. */
function Decrypting({ active }: { active: boolean }) {
  const [lines, setLines] = useState(() => PLAINTEXT.map((l) => l.replace(/\S/g, "·")));

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const duration = 1400;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setLines(
        PLAINTEXT.map((line, li) =>
          line
            .split("")
            .map((ch, ci) => {
              const threshold = (ci / line.length) * 0.7 + (li / PLAINTEXT.length) * 0.3;
              if (ch === " " || p >= threshold + 0.08) return ch;
              return GLYPHS[(ci * 7 + li * 13 + Math.floor(now / 45)) % GLYPHS.length];
            })
            .join(""),
        ),
      );
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return (
    <pre className="overflow-hidden font-mono text-[11.5px] leading-[1.9] text-white/85 sm:text-[13px]">
      {lines.map((l, i) => (
        <div
          key={i}
          className={cn(
            i === 1 || i === 2 || i === 3 ? "text-critical-soft" : "",
            i === 0 ? "text-white" : "",
          )}
        >
          {l}
        </div>
      ))}
    </pre>
  );
}

function Scene({ index, step, staticMode }: { index: number; step: number; staticMode?: boolean }) {
  const active = staticMode || step === index;
  return (
    <div
      aria-hidden={!active}
      className={cn(
        "flex h-full flex-col justify-between p-6 transition-all duration-700 ease-smooth sm:p-8",
        staticMode ? "relative" : "absolute inset-0",
        active ? "opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      {index === 0 && (
        <>
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Platform 3, Pune Junction
            </span>
            <span>12:41</span>
          </div>
          <svg viewBox="0 0 400 120" className="w-full" aria-hidden>
            <path
              d="M0 60 H120 L135 60 L145 30 L158 95 L170 60 H230 L240 52 L250 60 H400"
              fill="none"
              stroke="#F5333F"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ecg-line"
            />
          </svg>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-display text-2xl font-semibold tracking-tight">Patient unresponsive</p>
              <p className="mt-1 text-sm text-white/50">History unknown · phone locked · no ID</p>
            </div>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-critical/15 ring-1 ring-critical/30">
              <Activity className="h-7 w-7 text-critical-soft" />
            </span>
          </div>
        </>
      )}

      {index === 1 && (
        <div className="relative flex h-full items-center justify-center">
          {[0, 1, 2].map((r) => (
            <span
              key={r}
              className="absolute h-40 w-40 rounded-full border border-royal-300/50 animate-pulse-ring"
              style={{ animationDelay: `${r * 0.8}s` }}
            />
          ))}
          <div className="relative flex items-center gap-6">
            <div className="h-44 w-24 rounded-[22px] border border-white/15 bg-gradient-to-b from-[#1b1b22] to-[#0c0c10] p-1.5 shadow-2xl">
              <div className="flex h-full flex-col items-center justify-center gap-2 rounded-[17px] bg-black/60">
                <Nfc className="h-7 w-7 text-royal-300" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-white/50">Reading…</span>
              </div>
            </div>
            <div className="h-16 w-36 rounded-full bg-[linear-gradient(135deg,#37e0f0,#9b5cff_50%,#ff5cc4)] p-[2px]">
              <div className="flex h-full items-center justify-center rounded-full bg-[#0f0f14]">
                <span className="h-7 w-11 rounded-lg bg-white/10 ring-1 ring-white/20" />
              </div>
            </div>
          </div>
          <p className="absolute bottom-0 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
            NFC · 13.56 MHz · no pairing
          </p>
        </div>
      )}

      {index === 2 && (
        <>
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/15 px-2.5 py-1 text-[11px] font-medium text-signal-soft">
              <ShieldCheck className="h-3.5 w-3.5" /> Integrity verified
            </span>
            <span className="font-mono text-[11px] text-white/40">AES-256-GCM</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <Decrypting active={active} />
          </div>
          <p className="text-sm text-white/50">Tampered tags fail verification and are flagged — never shown.</p>
        </>
      )}

      {index === 3 && (
        <>
          <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] p-4">
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white/45">
              <MessageSquareText className="h-3.5 w-3.5" /> SMS → Priya (spouse)
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-white/85">
              Patient-Tap: Arjun&apos;s wristband was scanned by a responder at 12:42 near Pune
              Junction. Location: maps.google.com/?q=18.5289,73.8744
            </p>
          </div>
          <div className="space-y-2">
            {[
              ["12:43", "PARAMEDIC-4471", "Oxygen 4 L/min via mask"],
              ["12:47", "PARAMEDIC-4471", "Avoided penicillin-class antibiotics"],
            ].map(([t, who, what]) => (
              <div key={t} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
                <ScrollText className="h-4 w-4 shrink-0 text-royal-300" />
                <span className="font-mono text-[11px] text-white/45">{t}</span>
                <span className="truncate text-sm text-white/80">{what}</span>
                <span className="ml-auto hidden font-mono text-[10px] text-white/35 sm:inline">{who}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-white/50">Logged on the tag itself — the next hospital sees it too.</p>
        </>
      )}
    </div>
  );
}

export function EmergencyStory() {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.create({
          trigger: ".story-pin",
          start: "top top",
          end: "+=260%",
          pin: true,
          scrub: 0.5,
          onUpdate: (self) => {
            const s = Math.min(STEPS.length - 1, Math.floor(self.progress * STEPS.length * 0.999));
            if (s !== stepRef.current) {
              stepRef.current = s;
              setStep(s);
            }
            gsap.set(".story-progress", { scaleY: self.progress });
          },
        });
      });
      gsap.from(".story-head > *", {
        opacity: 0,
        y: 28,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section id="how" ref={root} className="relative bg-void text-white">
      <div className="story-pin relative overflow-hidden md:flex md:h-screen md:items-center md:motion-reduce:block md:motion-reduce:h-auto md:motion-reduce:py-24">
        <Iridescence
          animate={false}
          blobs={[
            { color: "#3b6dff", size: 520, top: "10%", left: "55%", blur: 130, opacity: 0.4 },
            { color: "#ff5cc4", size: 420, top: "50%", left: "75%", blur: 130, opacity: 0.3 },
          ]}
        />
        <div className="shell relative z-10 py-24 md:py-0">
          <div className="story-head mb-12 max-w-2xl md:mb-10">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-critical" />
              How it works · in an emergency
            </p>
            <h2 className="mt-5 font-sans text-[clamp(2rem,4.4vw,3.6rem)] font-bold leading-[1.03] tracking-tight">
              Four moments that{" "}
              <span className="font-serif font-normal italic text-white/80">speak for you.</span>
            </h2>
          </div>

          {/* desktop: pinned, scroll-driven */}
          <div className="hidden gap-14 md:grid md:grid-cols-[1fr_1.1fr] md:motion-reduce:hidden">
            <div className="relative pl-8">
              <span className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px bg-white/10" />
              <span className="story-progress absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px origin-top scale-y-0 bg-gradient-to-b from-royal-400 to-critical" />
              <ol className="space-y-7">
                {STEPS.map((s, i) => (
                  <li
                    key={s.title}
                    aria-current={step === i ? "step" : undefined}
                    className={cn(
                      "transition-all duration-500",
                      step === i ? "opacity-100" : "opacity-35",
                    )}
                  >
                    <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-royal-300">
                      {String(i + 1).padStart(2, "0")} · {s.kicker}
                    </p>
                    <p className="mt-1.5 font-display text-xl font-semibold tracking-tight lg:text-2xl">{s.title}</p>
                    <p
                      className={cn(
                        "max-w-md overflow-hidden text-[15px] leading-relaxed text-white/60 transition-all duration-500",
                        step === i ? "mt-2 max-h-40" : "max-h-0",
                      )}
                    >
                      {s.body}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
            <div className="relative h-[440px] overflow-hidden rounded-[28px] border border-white/10 bg-[#0f0f13]/80 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] backdrop-blur-xl lg:h-[480px]">
              {STEPS.map((_, i) => (
                <Scene key={i} index={i} step={step} />
              ))}
            </div>
          </div>

          {/* mobile / reduced motion: a simple stack */}
          <ol className="space-y-6 md:hidden md:motion-reduce:grid md:motion-reduce:grid-cols-2 md:motion-reduce:gap-6 md:motion-reduce:space-y-0">
            {STEPS.map((s, i) => (
              <li key={s.title} className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03]">
                <div className="p-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-royal-300">
                    {String(i + 1).padStart(2, "0")} · {s.kicker}
                  </p>
                  <p className="mt-1.5 font-display text-xl font-semibold tracking-tight">{s.title}</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/60">{s.body}</p>
                </div>
                <div className="min-h-[260px] border-t border-white/10 bg-black/30">
                  <Scene index={i} step={i} staticMode />
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
