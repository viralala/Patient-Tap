"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Fingerprint, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The signature product visual: a floating, encrypted patient credential card
 * with radiating NFC waves. Tilts in 3D toward the pointer (fine pointers),
 * and idles with a slow float otherwise. Pure CSS/SVG — no external assets.
 */
export function CredentialCard({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const card = cardRef.current;
    if (!wrap || !card) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3" });
    const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3" });

    const move = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      ry(gsap.utils.clamp(-16, 16, px * 14));
      rx(gsap.utils.clamp(-14, 14, -py * 10));
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    wrap.addEventListener("pointermove", move);
    wrap.addEventListener("pointerleave", leave);
    return () => {
      wrap.removeEventListener("pointermove", move);
      wrap.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={cn("relative [perspective:1400px]", className)}
      data-cursor="tap"
    >
      {/* NFC waves radiating from the tag corner */}
      <svg
        viewBox="0 0 120 120"
        className="absolute -right-6 top-1/2 h-40 w-40 -translate-y-1/2"
        aria-hidden
        fill="none"
      >
        {[0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M40 ${30 - i * 4} a${30 + i * 14} ${30 + i * 14} 0 0 1 0 ${60 + i * 8}`}
            className="stroke-royal-400"
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              transformOrigin: "40px 60px",
              animation: `pulse-ring 2.4s cubic-bezier(0.4,0,0.2,1) ${i * 0.5}s infinite`,
            }}
          />
        ))}
      </svg>

      <div
        ref={cardRef}
        className="relative w-[min(90vw,420px)] rounded-card border border-white/10 bg-gradient-to-br from-ink-raised to-ink-soft p-6 card-shadow-lg [transform-style:preserve-3d] animate-float-slow"
      >
        {/* sheen */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-card">
          <div className="absolute -inset-y-10 -left-1/2 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
        </div>

        {/* header */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">
            NTAG215 · 504 B
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-signal/15 px-2.5 py-1 text-[10px] font-medium text-signal-soft">
            <ShieldCheck className="h-3 w-3" strokeWidth={2.4} />
            AES-256-GCM
          </span>
        </div>

        {/* identity */}
        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
            Patient credential
          </p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-royal-500/20 ring-1 ring-royal-400/40">
              <Fingerprint className="h-5 w-5 text-royal-300" strokeWidth={1.8} />
            </div>
            <div>
              <div className="h-3 w-36 rounded-full bg-white/70" />
              <div className="mt-2 h-2.5 w-24 rounded-full bg-white/20" />
            </div>
          </div>
        </div>

        {/* critical fields */}
        <div className="mt-6 grid grid-cols-3 gap-2.5">
          <Field label="Blood" value="O−" />
          <div className="rounded-2xl border border-critical/30 bg-critical-wash px-3 py-2.5">
            <p className="font-mono text-[9px] uppercase tracking-widest text-critical-soft/70">
              DNR
            </p>
            <p className="mt-1 text-sm font-semibold text-critical-soft">Active</p>
          </div>
          <Field label="Allergies" value="3" />
        </div>

        {/* encrypted stream */}
        <div className="mt-5 overflow-hidden rounded-xl bg-black/30 px-3 py-2.5">
          <p className="truncate font-mono text-[10px] leading-relaxed text-royal-300/70">
            a3f9 7c21 e0b4 55da · 9f12 04cc 7e88 · 1bd6 aa30 f47e 92c1
          </p>
        </div>

        {/* capacity */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-royal-500 to-royal-300" />
          </div>
          <span className="font-mono text-[10px] tabular-nums text-white/45">312 / 504 B</span>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <p className="font-mono text-[9px] uppercase tracking-widest text-white/40">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
