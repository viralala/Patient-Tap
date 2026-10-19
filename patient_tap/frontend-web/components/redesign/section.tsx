"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Iridescence, type Blob } from "@/components/holo/iridescence";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Shared chrome for the landing sections: near-black canvas, a parallax
 * holographic glow, and a staggered fade-up for every `.rv` descendant
 * (via `gsap.from`, so content is never stuck hidden without JS).
 */
export function Section({
  id,
  blobs,
  className,
  children,
}: {
  id?: string;
  blobs?: Blob[];
  className?: string;
  children: React.ReactNode;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const items = gsap.utils.toArray<HTMLElement>(".rv", root.current);
      if (!items.length) return;
      ScrollTrigger.batch(items, {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.from(batch, { opacity: 0, y: 34, duration: 0.85, stagger: 0.08, ease: "power3.out" }),
      });
    },
    { scope: root },
  );

  return (
    <section id={id} ref={root} className={cn("relative overflow-hidden bg-void py-28 text-white md:py-36", className)}>
      {blobs && <Iridescence parallax={16} animate={false} blobs={blobs} />}
      <div className="shell relative z-10">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  dot = "bg-royal-400",
  title,
  sub,
  align = "left",
  className,
}: {
  eyebrow: string;
  dot?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <p
        className={cn(
          "rv flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45",
          align === "center" && "justify-center",
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
        {eyebrow}
      </p>
      <h2 className="rv mt-5 font-sans text-[clamp(2rem,4.4vw,3.6rem)] font-bold leading-[1.04] tracking-tight">
        {title}
      </h2>
      {sub && <div className="rv mt-5 text-base leading-relaxed text-white/55 md:text-lg">{sub}</div>}
    </div>
  );
}

/** Italic serif emphasis used inside headlines. */
export function Em({ children }: { children: React.ReactNode }) {
  return <span className="font-serif font-normal italic text-white/80">{children}</span>;
}
