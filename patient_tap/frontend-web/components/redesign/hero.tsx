"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight } from "lucide-react";
import { Iridescence } from "@/components/holo/iridescence";
import { HoloCard } from "@/components/holo/holo-card";
import { Magnetic } from "@/components/ui/magnetic";

gsap.registerPlugin(useGSAP);

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(".hero-line", { yPercent: 115, duration: 1.05, stagger: 0.12 })
        .from(".hero-card", { opacity: 0, y: 60, scale: 0.92, duration: 1.1 }, "-=0.6")
        .from(".hero-sub", { opacity: 0, y: 22, duration: 0.7 }, "-=0.7")
        .from(".hero-cta", { opacity: 0, y: 18, duration: 0.6 }, "-=0.45");
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="on-ink relative flex min-h-screen flex-col items-center overflow-hidden bg-void pb-24 pt-36 text-white"
    >
      {/* oil-slick backdrop: top-right sweep + a pool behind the card */}
      <Iridescence
        blobs={[
          { color: "#3b6dff", size: 640, top: "-18%", left: "46%", blur: 95 },
          { color: "#37e0f0", size: 520, top: "-12%", left: "66%", blur: 80 },
          { color: "#9b5cff", size: 580, top: "-4%", left: "56%", blur: 95 },
          { color: "#ff5cc4", size: 520, top: "0%", left: "76%", blur: 88 },
          { color: "#57ffb0", size: 440, top: "-8%", left: "88%", blur: 92 },
          { color: "#7b5cff", size: 560, top: "44%", left: "34%", blur: 120, opacity: 0.55 },
          { color: "#ff5cc4", size: 460, top: "50%", left: "52%", blur: 120, opacity: 0.5 },
          { color: "#37e0f0", size: 420, top: "46%", left: "60%", blur: 120, opacity: 0.45 },
        ]}
      />
      <div className="grain absolute inset-0 opacity-40" />

      <div className="shell relative z-10 flex flex-col items-center text-center">
        <h1 className="max-w-5xl font-sans text-[clamp(2.6rem,8.4vw,7rem)] font-bold uppercase leading-[0.93] tracking-[-0.02em]">
          <span className="block overflow-hidden pb-[0.08em]">
            <span className="hero-line block">
              Your record,{" "}
              <span className="font-serif font-normal normal-case italic text-white/80">
                sealed.
              </span>
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.08em]">
            <span className="hero-line block">
              Read in one{" "}
              <span className="font-serif font-normal normal-case italic text-white/80">
                tap.
              </span>
            </span>
          </span>
        </h1>

        <div className="hero-card mt-12 [transform-style:preserve-3d]">
          <HoloCard />
        </div>

        <p className="hero-sub mt-12 max-w-md text-balance text-sm leading-relaxed text-white/55 md:text-base">
          An AES-256-GCM medical record encrypted onto an NFC wristband — read by
          any phone in under two seconds, with zero network and no database to
          breach.
        </p>

        <div className="hero-cta mt-8">
          <Magnetic strength={0.3}>
            <a
              href="/app"
              data-cursor="open"
              className="group inline-flex items-center gap-2 rounded-full bg-white py-3.5 pl-7 pr-3.5 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.03]"
            >
              Launch the app
              <span className="grid h-7 w-7 place-items-center rounded-full bg-black text-white transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
