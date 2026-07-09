"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Nfc } from "lucide-react";
import { Iridescence } from "@/components/holo/iridescence";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function BandChoice() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".s6-reveal", {
        opacity: 0,
        y: 30,
        duration: 0.85,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });
      gsap.from(".s6-band", {
        opacity: 0,
        y: 40,
        scale: 0.9,
        rotate: -6,
        duration: 1,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 62%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section className="relative overflow-hidden bg-void py-28 md:py-40" ref={root}>
      <Iridescence
        animate={false}
        blobs={[
          { color: "#ff5cc4", size: 500, top: "18%", left: "36%", blur: 120, opacity: 0.45 },
          { color: "#9b5cff", size: 520, top: "6%", left: "50%", blur: 120, opacity: 0.5 },
          { color: "#37e0f0", size: 420, top: "26%", left: "60%", blur: 120, opacity: 0.4 },
        ]}
      />

      <div className="shell relative z-10 grid items-center gap-14 lg:grid-cols-[1fr_auto_1fr]">
        {/* headline */}
        <h2 className="s6-reveal max-w-xs font-sans text-[clamp(2rem,4.4vw,3.4rem)] font-bold leading-[1.04] tracking-tight">
          Choose <span className="font-serif font-normal italic text-white/80">your</span> own{" "}
          <span className="font-serif font-normal italic text-white/80">band.</span>
        </h2>

        {/* fanned stack */}
        <div className="relative mx-auto h-[300px] w-[330px]">
          <BandFace
            finish="aurora"
            label="Wristband"
            className="s6-band left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 -rotate-[15deg]"
            style={{ marginLeft: -92, marginTop: 14 }}
          />
          <BandFace
            finish="royal"
            label="Card"
            className="s6-band left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rotate-[15deg]"
            style={{ marginLeft: 92, marginTop: 14 }}
          />
          <BandFace
            finish="stealth"
            label="Keychain"
            className="s6-band left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 -rotate-[3deg]"
          />
        </div>

        {/* microcopy + cta */}
        <div className="lg:justify-self-end">
          <p className="s6-reveal max-w-xs font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] text-white/40">
            No number printed on the band — that&apos;s by design. The record
            lives in the chip, sealed with AES-256-GCM.
          </p>
          <div className="s6-reveal mt-6">
            <Button href="#pricing" variant="ghostInverse" arrow cursorLabel="shop">
              Choose a band
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

const FINISHES = {
  aurora: "linear-gradient(135deg, #37e0f0 0%, #9b5cff 48%, #ff5cc4 100%)",
  royal: "linear-gradient(140deg, #3f74ff 0%, #243f9e 100%)",
  stealth: "linear-gradient(150deg, #1b1b20 0%, #0b0b0e 100%)",
} as const;

function BandFace({
  finish,
  label,
  className,
  style,
}: {
  finish: keyof typeof FINISHES;
  label: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const dark = finish === "stealth";
  return (
    <div
      className={cn(
        "absolute aspect-[1.586] w-60 overflow-hidden rounded-2xl border border-white/15 p-4 shadow-[0_30px_60px_-26px_rgba(0,0,0,0.85)]",
        className,
      )}
      style={{ background: FINISHES[finish], ...style }}
    >
      {/* gloss */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-center justify-between">
          <LogoMark className="h-5 w-5" />
          <Nfc className={cn("h-5 w-5", dark ? "text-white/60" : "text-white/80")} strokeWidth={1.6} />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">{label}</p>
          <p className="font-mono text-[11px] tracking-[0.15em] text-white/85">•••• 0007</p>
        </div>
      </div>
    </div>
  );
}
