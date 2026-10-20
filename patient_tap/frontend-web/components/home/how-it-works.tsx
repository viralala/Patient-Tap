"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ContactlessMark } from "./nfc-card";

const STEPS = [
  {
    time: "12:41",
    title: "He collapses on a platform.",
    body: "Arjun faints at Pune Junction. He cannot tell anyone that he is allergic to penicillin, takes metformin or has a DNR wish.",
  },
  {
    time: "12:42",
    title: "A paramedic taps his wrist.",
    body: "Any NFC phone with the Patient-Tap app reads the band. The chip is powered by the phone itself, so there is no unlocking, pairing or signal involved.",
  },
  {
    time: "12:42",
    title: "The record opens on the phone.",
    body: "The record is decrypted and checked. If anyone has changed the bytes on the tag, it refuses to open instead of showing wrong data. DNR and allergies are shown first.",
  },
  {
    time: "12:43",
    title: "His family hears and care is logged.",
    body: "When there is signal, his emergency contact gets an SMS with his location. Each treatment is written back to the band, so the next hospital sees it too.",
  },
];

/**
 * The emergency, step by step. As the list scrolls past the middle of the
 * screen, the rail fills, the nearest step lights up and the sticky clock
 * ticks to that step's time.
 */
export function HowItWorks() {
  const list = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const ol = list.current;
    if (!ol) return;
    const items = Array.from(ol.children) as HTMLElement[];
    let raf = 0;

    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.55;
      const r = ol.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (mid - r.top) / r.height));
      if (fill.current) fill.current.style.transform = `scaleY(${progress})`;

      let next = 0;
      items.forEach((el, i) => {
        if (el.getBoundingClientRect().top < mid) next = i;
      });
      setActive(next);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
    };
  }, []);

  const step = STEPS[active];

  return (
    <section id="how" className="scroll-mt-16 pb-28 text-bone md:pb-40">
      <div className="shell">
        <h2 data-reveal className="display text-[clamp(3rem,8vw,7rem)]">
          How a tap works
        </h2>

        <div className="mt-12 grid gap-10 lg:grid-cols-[0.75fr_1.5fr] lg:gap-16">
          {/* Sticky clock, wide screens only. */}
          <div className="hidden lg:block">
            <div className="sticky top-28 rounded-[18px] bg-pine p-8">
              <div className="flex items-center justify-between">
                <p className="label text-bone/75">Pune Junction, platform 3</p>
                <ContactlessMark animated={active === 1} className="h-6 w-6 text-bone" />
              </div>
              <p className="mt-10 overflow-hidden">
                <span key={`${active}-${step.time}`} className="tick display block text-[7.5rem] leading-none">
                  {step.time}
                </span>
              </p>
              <p className="label mt-6 flex justify-between text-bone/75">
                <span>
                  Step {String(active + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
                </span>
                <span>{active === 3 ? "Logged" : active === 0 ? "No ID" : "Reading"}</span>
              </p>
              <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden>
                {STEPS.map((s, i) => (
                  <span
                    key={s.title}
                    className={cn("h-1 rounded-sm transition-colors duration-500", i <= active ? "bg-lemon" : "bg-bone/25")}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="relative pl-8 md:pl-12">
            {/* Rail: grey track with a lemon fill that follows the scroll. */}
            <span aria-hidden className="absolute bottom-0 left-0 top-0 w-px bg-bone/15" />
            <span
              ref={fill}
              aria-hidden
              className="absolute bottom-0 left-0 top-0 w-px origin-top bg-lemon"
              style={{ transform: "scaleY(0)" }}
            />
            <ol ref={list}>
              {STEPS.map((s, i) => (
                <li
                  key={s.title}
                  aria-current={active === i ? "step" : undefined}
                  className={cn(
                    "relative py-10 transition-opacity duration-500 first:pt-2 md:py-14",
                    active === i ? "opacity-100" : "opacity-40",
                  )}
                >
                  <p className="label relative text-bone/60">
                    <span
                      aria-hidden
                      className={cn(
                        "absolute -left-8 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-sm transition-colors duration-500 md:-left-12",
                        i <= active ? "bg-lemon" : "bg-canvas ring-1 ring-bone/40",
                      )}
                    />
                    {String(i + 1).padStart(2, "0")} / {s.time}
                  </p>
                  <h3 className="mt-3 font-serif text-[clamp(1.75rem,3vw,2.6rem)] leading-tight">{s.title}</h3>
                  <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-bone/70">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
