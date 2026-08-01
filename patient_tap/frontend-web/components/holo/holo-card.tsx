"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { Nfc } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Iridescence } from "./iridescence";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP);

/**
 * A dark, minimal medical credential card with a live holographic reflection
 * sweeping across it. Idles with a slow float; tilts in 3D toward the pointer
 * on precise-pointer devices.
 */
export function HoloCard({ className }: { className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduced) {
        gsap.to(card.current, {
          y: -12,
          duration: 3.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      if (!window.matchMedia("(pointer: fine)").matches) return;
      const rx = gsap.quickTo(card.current, "rotationX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(card.current, "rotationY", { duration: 0.6, ease: "power3" });
      const move = (e: PointerEvent) => {
        const el = wrap.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        ry(gsap.utils.clamp(-16, 16, px * 15));
        rx(gsap.utils.clamp(-14, 14, -py * 11));
      };
      const leave = () => {
        rx(0);
        ry(0);
      };
      const el = wrap.current!;
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: wrap },
  );

  return (
    <div ref={wrap} className={cn("relative [perspective:1400px]", className)} data-cursor="tap">
      {/* soft cast shadow / floor glow */}
      <div className="absolute -inset-x-10 bottom-2 h-20 rounded-[50%] bg-black/60 blur-3xl" />

      <div
        ref={card}
        className="relative aspect-[1.586] w-[min(86vw,392px)] overflow-hidden rounded-[26px] border border-white/10 [transform-style:preserve-3d]"
        style={{
          background: "linear-gradient(150deg, #17171c 0%, #101013 55%, #0b0b0e 100%)",
          boxShadow: "0 40px 80px -30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* holographic reflection */}
        <Iridescence
          blobs={[
            { color: "#37e0f0", size: 250, top: "-24%", left: "4%", blur: 48, opacity: 0.5 },
            { color: "#9b5cff", size: 270, top: "18%", left: "36%", blur: 54, opacity: 0.5 },
            { color: "#ff5cc4", size: 230, top: "34%", left: "62%", blur: 50, opacity: 0.45 },
            { color: "#57ffb0", size: 200, top: "-10%", left: "70%", blur: 52, opacity: 0.4 },
          ]}
        />
        {/* fine grain + diagonal gloss */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-between p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <LogoMark className="h-6 w-6" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                Medical credential
              </span>
            </div>
            <Nfc className="h-6 w-6 text-white/70" strokeWidth={1.6} />
          </div>

          {/* metallic chip */}
          <div
            className="h-9 w-12 rounded-[7px] border border-white/20"
            style={{
              background:
                "linear-gradient(135deg, #d9c48a 0%, #b7995a 30%, #f0e3b0 55%, #a98a4e 80%)",
            }}
          />

          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-[15px] tracking-[0.18em] text-white/85">
                •••• •••• 0007
              </p>
              <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                NTAG215 · 504 B
              </p>
            </div>
            <span className="font-serif text-lg italic text-white/70">tap</span>
          </div>
        </div>
      </div>
    </div>
  );
}
