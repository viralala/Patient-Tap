"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Lock, Nfc, HeartPulse, ShieldCheck, Check } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const STEPS = [
  {
    n: "01",
    title: "Seal it once",
    body: "The patient fills their record a single time. It is serialized to protobuf and sealed with AES-256-GCM on-device — the key never leaves the phone.",
  },
  {
    n: "02",
    title: "Tap to write",
    body: "Hold the phone against the NTAG215 wristband. 504 bytes of ciphertext land in one tap — no pairing, no account, no upload.",
  },
  {
    n: "03",
    title: "Tap to read",
    body: "Any responder's phone taps the band and decrypts instantly. DNR and allergies load first; every treatment action appends to the chain.",
  },
];

export function HowItWorks() {
  const section = useRef<HTMLElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const st = ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "+=2400",
        pin: true,
        onUpdate: (self) => {
          const idx = Math.min(2, Math.floor(self.progress * 3.001));
          setActive((prev) => (prev === idx ? prev : idx));
          if (progress.current) {
            gsap.set(progress.current, { scaleY: self.progress });
          }
        },
      });
      return () => st.kill();
    },
    { scope: section },
  );

  return (
    <section
      id="how"
      ref={section}
      className="on-ink relative flex min-h-screen items-center overflow-hidden bg-ink py-24 text-white"
    >
      <div className="grid-fade absolute inset-0 opacity-70" />
      <div className="grain absolute inset-0" />

      <div className="shell relative z-10 grid w-full items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
        {/* Left — pinned narrative */}
        <div>
          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-royal-400">
            <span className="h-1.5 w-1.5 rounded-full bg-royal-400" />
            From wrist to record
          </p>
          <h2 className="mt-5 max-w-md font-display text-[clamp(2rem,4.4vw,3.6rem)] font-semibold leading-[1.04] tracking-tight">
            Three taps. Zero infrastructure.
          </h2>

          <div className="mt-10 flex gap-6">
            {/* progress rail */}
            <div className="relative mt-2 w-px shrink-0 bg-white/12">
              <div
                ref={progress}
                className="absolute inset-x-0 top-0 h-full origin-top scale-y-0 bg-royal-400"
              />
            </div>

            <ol className="space-y-7">
              {STEPS.map((s, i) => (
                <li
                  key={s.n}
                  className={cn(
                    "transition-all duration-500",
                    i === active ? "opacity-100" : "opacity-35",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-full font-mono text-xs transition-colors duration-500",
                        i < active
                          ? "bg-royal-500 text-white"
                          : i === active
                            ? "bg-white text-ink"
                            : "border border-white/20 text-white/50",
                      )}
                    >
                      {i < active ? <Check className="h-4 w-4" /> : s.n}
                    </span>
                    <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                  </div>
                  <p className="mt-2 max-w-sm pl-11 text-sm leading-relaxed text-white/55">
                    {s.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Right — swapping stage */}
        <div className="relative h-[380px] w-full md:h-[440px]">
          <Stage active={active} index={0}>
            <EncryptVisual />
          </Stage>
          <Stage active={active} index={1}>
            <WriteVisual />
          </Stage>
          <Stage active={active} index={2}>
            <ReadVisual />
          </Stage>
        </div>
      </div>
    </section>
  );
}

function Stage({
  active,
  index,
  children,
}: {
  active: number;
  index: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 grid place-items-center transition-all duration-700 ease-smooth",
        active === index
          ? "translate-y-0 opacity-100"
          : active > index
            ? "-translate-y-6 opacity-0"
            : "translate-y-6 opacity-0",
      )}
    >
      {children}
    </div>
  );
}

function StagePanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[min(88vw,440px)] overflow-hidden rounded-card border border-white/10 bg-gradient-to-br from-ink-raised to-ink-soft p-8 card-shadow-lg">
      <div className="glow-royal absolute inset-0 opacity-40" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function EncryptVisual() {
  return (
    <StagePanel>
      <div className="flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-royal-500/20 ring-1 ring-royal-400/40">
          <Lock className="h-5 w-5 text-royal-300" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
          protobuf · gcm
        </span>
      </div>
      <div className="mt-8 space-y-2.5">
        {["w-full", "w-10/12", "w-11/12", "w-8/12", "w-9/12"].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-white/30">
              {String(i).padStart(2, "0")}
            </span>
            <div className={`h-2.5 ${w} rounded-full bg-royal-500/30`} />
          </div>
        ))}
      </div>
      <p className="mt-8 font-mono text-xs text-royal-300/70">
        sealing 312 bytes → ciphertext ✓
      </p>
    </StagePanel>
  );
}

function WriteVisual() {
  return (
    <StagePanel>
      <div className="flex flex-col items-center py-4">
        <div className="relative flex h-40 w-40 items-center justify-center">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute rounded-full border border-royal-400/60"
              style={{
                width: `${70 + i * 34}px`,
                height: `${70 + i * 34}px`,
                animation: `pulse-ring 2.2s cubic-bezier(0.4,0,0.2,1) ${i * 0.45}s infinite`,
              }}
            />
          ))}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-ink">
            <Nfc className="h-7 w-7" />
          </div>
        </div>
        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-white/50">
          writing to NTAG215
        </p>
        <div className="mt-4 h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-royal-500 to-royal-300" />
        </div>
      </div>
    </StagePanel>
  );
}

function ReadVisual() {
  return (
    <StagePanel>
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-pill bg-signal/15 px-2.5 py-1 text-[10px] font-medium text-signal-soft">
          <ShieldCheck className="h-3 w-3" /> verified
        </span>
        <span className="font-mono text-[10px] text-white/40">PT-0007</span>
      </div>
      <div className="mt-5 rounded-2xl border border-critical/40 bg-critical-wash p-4">
        <div className="flex items-center gap-2 text-critical-soft">
          <HeartPulse className="h-4 w-4" />
          <span className="font-display text-lg font-semibold">DNR — Active</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Penicillin", "Peanuts", "Latex"].map((a) => (
            <span
              key={a}
              className="rounded-pill bg-critical/15 px-2.5 py-1 text-[11px] text-critical-soft"
            >
              {a}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-xl bg-white/[0.05] px-3 py-2.5">
          <p className="font-mono text-[9px] uppercase tracking-widest text-white/40">Blood</p>
          <p className="mt-0.5 font-semibold">O−</p>
        </div>
        <div className="rounded-xl bg-white/[0.05] px-3 py-2.5">
          <p className="font-mono text-[9px] uppercase tracking-widest text-white/40">Meds</p>
          <p className="mt-0.5 font-semibold">3 active</p>
        </div>
      </div>
    </StagePanel>
  );
}
