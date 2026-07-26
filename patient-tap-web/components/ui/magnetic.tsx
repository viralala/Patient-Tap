"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { cn } from "@/lib/utils";

/**
 * Pulls its child toward the pointer while hovered, springs back on leave.
 * No-op on coarse/touch pointers.
 */
export function Magnetic({
  children,
  className,
  strength = 0.4,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "elastic.out(1, 0.4)" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "elastic.out(1, 0.4)" });

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const relX = e.clientX - (r.left + r.width / 2);
      const relY = e.clientY - (r.top + r.height / 2);
      xTo(relX * strength);
      yTo(relY * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={cn("inline-block", className)}>
      {children}
    </div>
  );
}
