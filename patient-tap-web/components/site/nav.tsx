"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "How it works", href: "#how" },
  { label: "Security", href: "#security" },
  { label: "For responders", href: "#responders" },
  { label: "Access", href: "#access" },
];

export function SiteNav() {
  const barRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY.current && y > 220;
      gsap.to(bar, {
        y: goingDown ? -120 : 0,
        duration: 0.5,
        ease: "power3.out",
      });
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
    >
      <nav className="glass flex w-full max-w-shell items-center justify-between rounded-pill py-2 pl-5 pr-2 text-white shadow-[0_10px_40px_-16px_rgba(0,0,0,0.6)]">
        <Link href="/" aria-label="Patient-Tap home" className="shrink-0">
          <Logo tone="white" />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-pill px-3.5 py-2 text-sm text-white/70 transition-colors duration-300 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/app"
            data-cursor="open"
            className="hidden rounded-pill bg-white px-5 py-2.5 text-sm font-medium text-ink transition-transform duration-300 hover:scale-[1.03] sm:inline-flex"
          >
            Launch app
          </Link>
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* mobile sheet */}
      <div
        className={cn(
          "glass absolute left-4 right-4 top-[72px] origin-top rounded-3xl p-3 text-white transition-all duration-300 md:hidden",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
      >
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className="block rounded-2xl px-4 py-3 text-sm text-white/80 hover:bg-white/5"
          >
            {l.label}
          </a>
        ))}
        <Link
          href="/app"
          className="mt-1 block rounded-2xl bg-white px-4 py-3 text-center text-sm font-medium text-ink"
        >
          Launch app
        </Link>
      </div>
    </div>
  );
}
