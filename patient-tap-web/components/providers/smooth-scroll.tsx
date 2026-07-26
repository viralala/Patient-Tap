"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Global smooth-scroll driver. Wires Lenis inertial scrolling into GSAP's
 * ticker and keeps ScrollTrigger in sync, so every scroll-scrubbed animation
 * shares one clock. Disabled when the user prefers reduced motion.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // Dev-only handle so tooling can pause the animation clock for still captures.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __gsap?: typeof gsap }).__gsap = gsap;
    }

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    // Let late-loading media (fonts, images) settle trigger positions.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const t = window.setTimeout(refresh, 600);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      window.removeEventListener("load", refresh);
      window.clearTimeout(t);
    };
  }, []);

  return <>{children}</>;
}
