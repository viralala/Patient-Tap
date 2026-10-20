"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Fades `[data-reveal]` elements up as they scroll into view. Elements already
 * on screen are shown before the page is marked ready, so nothing flickers.
 * Does nothing when the visitor prefers reduced motion.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-visible)"));

    const inView = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top < window.innerHeight * 0.92 && r.bottom > 0;
    };
    els.filter(inView).forEach((el) => el.classList.add("is-visible"));
    document.documentElement.classList.add("reveal-ready");

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    els.filter((el) => !el.classList.contains("is-visible")).forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
