"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Bespoke two-part cursor: a crisp center dot that tracks 1:1, and a larger
 * ring that trails with spring lag. The ring swells and the dot hides over
 * interactive elements (anything `[data-cursor]`, links, or buttons). The
 * native cursor is hidden via `body.cursor-custom` (precise pointers only).
 */
export function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;
    const label = labelRef.current!;
    document.body.classList.add("cursor-custom");

    const xDot = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3" });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3" });
    const xLabel = gsap.quickTo(label, "x", { duration: 0.28, ease: "power3" });
    const yLabel = gsap.quickTo(label, "y", { duration: 0.28, ease: "power3" });

    let visible = false;

    const move = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
      }
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
      xLabel(e.clientX);
      yLabel(e.clientY);

      const target = (e.target as HTMLElement)?.closest<HTMLElement>(
        "[data-cursor], a, button, input, textarea, select, [role='button']",
      );
      const cursorLabel = target?.getAttribute("data-cursor");
      const interactive = Boolean(target);

      gsap.to(ring, {
        scale: cursorLabel ? 2.1 : interactive ? 1.55 : 1,
        borderColor: interactive ? "rgba(47,95,224,0.9)" : "rgba(10,14,23,0.35)",
        backgroundColor: interactive ? "rgba(47,95,224,0.08)" : "rgba(47,95,224,0)",
        duration: 0.3,
        ease: "power3",
      });
      gsap.to(dot, { scale: interactive ? 0 : 1, duration: 0.25 });

      if (cursorLabel) {
        label.textContent = cursorLabel;
        gsap.to(label, { opacity: 1, scale: 1, duration: 0.25 });
      } else {
        gsap.to(label, { opacity: 0, scale: 0.6, duration: 0.2 });
      }
    };

    const leave = () => {
      visible = false;
      gsap.to([dot, ring, label], { opacity: 0, duration: 0.25 });
    };
    const down = () => gsap.to(ring, { scale: 0.85, duration: 0.15 });
    const up = () => gsap.to(ring, { scale: 1, duration: 0.25 });

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.addEventListener("pointerleave", leave);

    return () => {
      document.body.classList.remove("cursor-custom");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-ink/35 opacity-0 mix-blend-difference"
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-royal-500 opacity-0"
      />
      <div
        ref={labelRef}
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-pill bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white opacity-0"
      />
    </div>
  );
}
