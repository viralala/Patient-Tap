"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Counts from 0 to `to` once, when scrolled into view. */
export function CountUp({
  to,
  className,
  duration = 1.6,
}: {
  to: number;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const obj = { v: 0 };
      gsap.to(obj, {
        v: to,
        duration,
        ease: "power2.out",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
        onUpdate: () => {
          if (ref.current) ref.current.textContent = Math.round(obj.v).toString();
        },
      });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
