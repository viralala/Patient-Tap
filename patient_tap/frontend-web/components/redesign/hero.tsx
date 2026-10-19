"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowRight, ScanLine, Lock, WifiOff, Timer, Cpu } from "lucide-react";
import { Iridescence } from "@/components/holo/iridescence";
import { HeroStage } from "@/components/three/hero-stage";
import { Magnetic } from "@/components/ui/magnetic";
import { site } from "@/lib/site";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CHIPS = [
  { icon: Lock, label: "AES-256-GCM", sub: "sealed on the chip", pos: "left-[4%] top-[16%]", depth: 1.4 },
  { icon: WifiOff, label: "Zero network", sub: "works underground", pos: "right-[3%] top-[22%]", depth: 1 },
  { icon: Timer, label: "< 2 s", sub: "tap to life-saving facts", pos: "left-[8%] bottom-[14%]", depth: 0.8 },
  { icon: Cpu, label: "504 bytes", sub: "NTAG215, no battery", pos: "right-[7%] bottom-[10%]", depth: 1.2 },
];

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".hero-badge", { opacity: 0, y: 16, duration: 0.7 })
        .from(".hero-line", { yPercent: 115, duration: 1.05, stagger: 0.12 }, "-=0.4")
        .from(".hero-stage", { opacity: 0, scale: 0.92, duration: 1.4 }, "-=0.7")
        .from(".hero-chip", { opacity: 0, y: 24, duration: 0.7, stagger: 0.08 }, "-=1")
        .from(".hero-sub, .hero-cta", { opacity: 0, y: 18, duration: 0.6, stagger: 0.08 }, "-=0.8");

      // Scroll: the band turns and sinks; type drifts up faster (parallax depth).
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
      if (reduced) return;

      gsap.to(".hero-copy", {
        yPercent: -28,
        opacity: 0.2,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });

      // Floating chips: pointer parallax at different depths.
      if (!window.matchMedia("(pointer: fine)").matches) return;
      const chips = gsap.utils.toArray<HTMLElement>(".hero-chip");
      const setters = chips.map((el) => ({
        x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }),
        y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }),
        depth: Number(el.dataset.depth ?? 1),
      }));
      const move = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        const ny = e.clientY / window.innerHeight - 0.5;
        setters.forEach((s) => {
          s.x(nx * 36 * s.depth);
          s.y(ny * 28 * s.depth);
        });
      };
      window.addEventListener("pointermove", move);
      return () => window.removeEventListener("pointermove", move);
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="on-ink relative flex min-h-[100svh] flex-col overflow-hidden bg-void pb-16 pt-28 text-white md:pt-32"
    >
      <Iridescence
        parallax={18}
        blobs={[
          { color: "#3b6dff", size: 640, top: "-18%", left: "46%", blur: 95 },
          { color: "#37e0f0", size: 520, top: "-12%", left: "66%", blur: 80 },
          { color: "#9b5cff", size: 580, top: "-4%", left: "56%", blur: 95 },
          { color: "#ff5cc4", size: 520, top: "0%", left: "76%", blur: 88 },
          { color: "#57ffb0", size: 440, top: "-8%", left: "88%", blur: 92 },
          { color: "#7b5cff", size: 560, top: "44%", left: "24%", blur: 120, opacity: 0.55 },
          { color: "#ff5cc4", size: 460, top: "50%", left: "52%", blur: 120, opacity: 0.45 },
          { color: "#37e0f0", size: 420, top: "46%", left: "62%", blur: 120, opacity: 0.4 },
        ]}
      />
      <div className="grain absolute inset-0 opacity-40" />

      <div className="hero-copy shell relative z-20 flex flex-col items-center text-center">
        <p className="hero-badge inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/60 backdrop-blur-md">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
          </span>
          Live prototype · {site.event}
        </p>

        <h1 className="mt-6 max-w-6xl font-sans text-[clamp(2.4rem,6.4vw,5.4rem)] font-bold uppercase leading-[0.93] tracking-[-0.02em]">
          <span className="block overflow-hidden pb-[0.08em]">
            <span className="hero-line block">
              Your record,{" "}
              <span className="font-serif font-normal normal-case italic text-white/80">sealed.</span>
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span className="hero-line block">
              Read in one{" "}
              <span className="font-serif font-normal normal-case italic text-white/80">tap.</span>
            </span>
          </span>
        </h1>
      </div>

      {/* 3D stage + floating spec chips */}
      <div className="relative z-10 mx-auto -mt-2 h-[min(46vh,470px)] min-h-[300px] w-full max-w-[1100px]">
        <div className="hero-stage absolute inset-0">
          <HeroStage progress={progress} />
        </div>
        {CHIPS.map((c) => (
          <div
            key={c.label}
            data-depth={c.depth}
            className={`hero-chip pointer-events-none absolute hidden items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.06] px-3.5 py-2.5 backdrop-blur-xl md:flex ${c.pos}`}
          >
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/[0.08]">
              <c.icon className="h-4 w-4 text-royal-200" strokeWidth={1.8} />
            </span>
            <span className="text-left">
              <span className="block font-display text-sm font-semibold leading-tight">{c.label}</span>
              <span className="block text-[11px] text-white/50">{c.sub}</span>
            </span>
          </div>
        ))}
        <p className="sr-only">
          An animated 3D Patient-Tap NFC wristband, with signal rings pulsing from its chip.
        </p>
      </div>

      <div className="shell relative z-20 flex flex-col items-center text-center">
        <p className="hero-sub max-w-xl text-balance text-sm leading-relaxed text-white/60 md:text-base">
          Your allergies, medicines, blood group and emergency contacts — encrypted onto an NFC
          wristband that any responder&apos;s phone reads in under two seconds, with no network
          and no database to breach. Plus <strong className="font-medium text-white">MedVerify</strong>:
          scan a medicine strip to catch fakes.
        </p>

        <div className="hero-cta mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Magnetic strength={0.3}>
            <Link
              href="/app"
              data-cursor="open"
              className="group inline-flex items-center gap-2 rounded-full bg-white py-3.5 pl-7 pr-3.5 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.03]"
            >
              Launch the app
              <span className="grid h-7 w-7 place-items-center rounded-full bg-black text-white transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </Magnetic>
          <Link
            href="/verify"
            data-cursor="scan"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3.5 text-sm font-medium text-white backdrop-blur-sm transition-colors duration-300 hover:border-white/60 hover:bg-white/[0.06]"
          >
            <ScanLine className="h-4 w-4" /> Verify a medicine
          </Link>
        </div>
      </div>
    </section>
  );
}
