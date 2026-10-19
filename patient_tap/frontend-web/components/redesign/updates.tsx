"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight, ScanLine, Smartphone, Fingerprint } from "lucide-react";
import { site } from "@/lib/site";
import { Iridescence } from "@/components/holo/iridescence";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// A real build log — every card links to something you can open today.
const POSTS = [
  {
    tag: "New",
    title: "MedVerify: scan a strip, catch a fake.",
    date: "Oct 2026",
    icon: ScanLine,
    href: "/verify",
    cover: "linear-gradient(135deg, #12c58b 0%, #3f74ff 100%)",
  },
  {
    tag: "Android",
    title: "Native app: real NFC, OCR auto-fill and biometric lock.",
    date: "Oct 2026",
    icon: Smartphone,
    href: site.links.github,
    cover: "linear-gradient(135deg, #3f74ff 0%, #9b5cff 100%)",
  },
  {
    tag: "Why",
    title: "Why your record should live on your wrist.",
    date: "Oct 2026",
    icon: Fingerprint,
    href: "/#how",
    cover: "linear-gradient(135deg, #9b5cff 0%, #ff5cc4 100%)",
  },
];

export function Updates() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".s7-reveal", {
        opacity: 0,
        y: 34,
        duration: 0.85,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 74%", once: true },
      });
    },
    { scope: root },
  );

  return (
    <section id="updates" className="relative overflow-hidden bg-void py-28 md:py-40" ref={root}>
      <Iridescence
        animate={false}
        parallax={16}
        blobs={[
          { color: "#3b6dff", size: 460, top: "0%", left: "6%", blur: 130, opacity: 0.35 },
          { color: "#ff5cc4", size: 440, top: "8%", left: "82%", blur: 130, opacity: 0.35 },
        ]}
      />

      <div className="shell relative z-10">
        <div className="s7-reveal mb-12 flex items-end justify-between gap-4">
          <h2 className="font-sans text-[clamp(2rem,4.4vw,3.4rem)] font-bold leading-none tracking-tight">
            From the <span className="font-serif font-normal italic text-white/80">build log</span>
          </h2>
          <a
            href={site.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-white sm:inline-flex"
          >
            Follow on GitHub <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {POSTS.map((p) => (
            <a
              key={p.title}
              href={p.href}
              {...(p.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              data-cursor="read"
              className="s7-reveal group block overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.02] transition-colors duration-500 hover:border-white/25"
            >
              {/* holographic cover */}
              <div className="relative h-44 overflow-hidden">
                <div
                  className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110"
                  style={{ background: p.cover }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/10" />
                <div className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-xl bg-black/25 backdrop-blur-xs">
                  <p.icon className="h-5 w-5 text-white" strokeWidth={1.8} />
                </div>
                <span className="absolute bottom-4 left-4 rounded-full bg-black/30 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-white backdrop-blur-xs">
                  {p.tag}
                </span>
              </div>

              <div className="p-5">
                <p className="font-display text-lg font-semibold leading-snug tracking-tight text-white">
                  {p.title}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-white/40">
                    {p.date}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-white/55 transition-colors group-hover:text-white">
                    Open <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
