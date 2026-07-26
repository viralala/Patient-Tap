"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { Iridescence } from "@/components/holo/iridescence";
import { LogoMark } from "@/components/brand/logo";
import { Magnetic } from "@/components/ui/magnetic";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const COLS = [
  {
    title: "Product",
    links: [
      { label: "The card", href: "#card" },
      { label: "For responders", href: "#responders" },
      { label: "Pricing", href: "#pricing" },
      { label: "Updates", href: "#updates" },
    ],
  },
  {
    title: "App",
    links: [
      { label: "Patient mode", href: "/app?role=patient" },
      { label: "Responder mode", href: "/app?role=responder" },
      { label: "Treatment log", href: "/app?role=responder&screen=log" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "GitHub", href: "https://github.com/viralala/Patient-Tap" },
      { label: "hello@patienttap.io", href: "#" },
      { label: "Book a call", href: "#" },
    ],
  },
];

export function RedesignFooter() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".f-reveal", {
        opacity: 0,
        y: 30,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 78%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <footer ref={root} className="on-ink relative overflow-hidden bg-void pt-28 text-white md:pt-40">
      <Iridescence
        animate={false}
        blobs={[
          { color: "#9b5cff", size: 620, top: "-8%", left: "42%", blur: 130, opacity: 0.5 },
          { color: "#3b6dff", size: 520, top: "20%", left: "-8%", blur: 130, opacity: 0.45 },
          { color: "#ff5cc4", size: 520, top: "24%", left: "78%", blur: 130, opacity: 0.45 },
        ]}
      />
      <div className="grain absolute inset-0 opacity-30" />

      <div className="shell relative z-10">
        {/* closing CTA */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="f-reveal flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-signal" />
            Ready when you are
          </p>
          <h2 className="f-reveal mt-6 font-sans text-[clamp(2.6rem,6.5vw,5.5rem)] font-bold uppercase leading-[0.98] tracking-[-0.02em]">
            Put the record{" "}
            <span className="font-serif font-normal normal-case italic text-white/80">
              on the wrist.
            </span>
          </h2>
          <div className="f-reveal mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Magnetic strength={0.3}>
              <Link
                href="/app"
                data-cursor="open"
                className="group inline-flex items-center gap-2 rounded-full bg-white py-3.5 pl-7 pr-3.5 text-sm font-medium text-neutral-900 transition-transform duration-300 hover:scale-[1.03]"
              >
                Launch the app
                <span className="grid h-7 w-7 place-items-center rounded-full bg-neutral-900 text-white transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Magnetic>
            <Link
              href="https://github.com/viralala/Patient-Tap"
              className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium text-white transition-colors duration-300 hover:border-white/60"
            >
              View the code
            </Link>
          </div>
        </div>

        {/* columns */}
        <div className="f-reveal mt-24 grid gap-12 border-t border-white/10 pt-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <LogoMark className="h-6 w-6" />
              <span className="font-sans text-[15px] font-semibold tracking-tight text-white">
                Patient<span className="text-royal-400">·</span>Tap
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
              An encrypted medical record that lives on the wristband — not in a
              database. Readable by any phone, with zero network dependency.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-8 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Patient-Tap. Built at Codeamble.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-white">Privacy policy</a>
            <a href="#" className="transition-colors hover:text-white">Terms of use</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
