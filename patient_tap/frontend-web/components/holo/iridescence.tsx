"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface Blob {
  /** Any CSS color — the blob's core hue. */
  color: string;
  /** Diameter in px. */
  size: number;
  top: string;
  left: string;
  /** Gaussian blur radius in px (defaults to size/6). */
  blur?: number;
  /** Base opacity 0..1. */
  opacity?: number;
}

/**
 * Oil-slick iridescence. Each blob is a blurred radial gradient composited with
 * `mix-blend-screen`, so on a near-black canvas overlaps add up into a glowing
 * holographic mesh. A slow, independent GSAP loop drifts/rotates/scales each
 * blob (20-40s) so the background feels alive without being scroll-tied.
 *
 * useGSAP auto-reverts on unmount — no leaks, no stacked tweens on re-render.
 */
export function Iridescence({
  blobs,
  className,
  animate = true,
  parallax = 0,
}: {
  blobs: Blob[];
  className?: string;
  /** When false, blobs render statically (saves rAF for lower-priority glows). */
  animate?: boolean;
  /** Scroll parallax depth in % of the section height (0 = fixed to the section). */
  parallax?: number;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const el = scope.current;
      if (!el) return;

      // Depth: the glow layer drifts slower than the content scrolling over it.
      if (parallax) {
        gsap.fromTo(
          el,
          { yPercent: -parallax / 2 },
          {
            yPercent: parallax / 2,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      }

      if (!animate) return;
      // Scope the selector to this instance so nested/sibling Iridescence
      // components don't drive each other's blobs.
      const nodes = gsap.utils.toArray<HTMLElement>(".holo-blob", el);
      nodes.forEach((node, i) => {
        gsap.to(node, {
          xPercent: gsap.utils.random(-22, 22),
          yPercent: gsap.utils.random(-22, 22),
          scale: gsap.utils.random(0.85, 1.3),
          rotation: gsap.utils.random(-55, 55),
          duration: gsap.utils.random(22, 40),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * -3.5,
        });
      });
    },
    { scope },
  );

  return (
    <div
      ref={scope}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        parallax ? "-inset-y-[12%]" : "",
        className,
      )}
    >
      {blobs.map((b, i) => (
        <span
          key={i}
          className="holo-blob absolute rounded-full will-change-transform"
          style={{
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            opacity: b.opacity ?? 0.8,
            filter: `blur(${b.blur ?? Math.round(b.size / 6)}px)`,
            mixBlendMode: "screen",
            background: `radial-gradient(circle at 50% 50%, ${b.color} 0%, ${b.color}00 68%)`,
          }}
        />
      ))}
    </div>
  );
}
