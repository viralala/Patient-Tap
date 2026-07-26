"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Travel distance in px. */
  y?: number;
  delay?: number;
  duration?: number;
  /** When set, stagger direct children marked `data-reveal-item`. */
  stagger?: boolean;
  start?: string;
}

/**
 * Scroll-triggered entrance. Uses `gsap.from` so the resting state is the
 * visible one — if JS never runs, content still shows (no stuck-hidden cells).
 */
export function Reveal({
  children,
  className,
  y = 28,
  delay = 0,
  duration = 0.9,
  stagger = false,
  start = "top 84%",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const targets: gsap.TweenTarget = stagger
        ? el.querySelectorAll("[data-reveal-item]")
        : el;
      gsap.from(targets, {
        opacity: 0,
        y,
        duration,
        delay,
        ease: "power3.out",
        stagger: stagger ? 0.09 : 0,
        scrollTrigger: { trigger: el, start },
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
