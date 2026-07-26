"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TEXT =
  "When a stranger finds you unconscious, the record on your wrist speaks for you. No password. No signal. No waiting on a server that might be down. This is medical sovereignty, carried at the edge.";

export function Mission() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const words = gsap.utils.toArray<HTMLElement>(".mword");
      gsap.fromTo(
        words,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.4,
          scrollTrigger: {
            trigger: root.current,
            start: "top 72%",
            end: "bottom 62%",
            scrub: 0.6,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative bg-paper py-32 md:py-48">
      <div className="shell">
        <p className="mb-10 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-royal-600">
          <span className="h-1.5 w-1.5 rounded-full bg-royal-500" />
          Why it matters
        </p>
        <p className="max-w-4xl font-display text-[clamp(1.7rem,3.6vw,3.1rem)] font-semibold leading-[1.22] tracking-tight text-ink">
          {TEXT.split(" ").map((w, i) => (
            <span key={i} className="mword inline-block">
              {w}&nbsp;
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
