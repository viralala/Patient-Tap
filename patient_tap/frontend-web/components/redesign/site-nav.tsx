"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "How it works", href: "/#how" },
  { label: "MedVerify", href: "/verify" },
  { label: "Donate", href: "/donate" },
  { label: "Plans", href: "/#plans" },
  { label: "FAQ", href: "/#faq" },
];

/** Top bar shared by every marketing page: links · wordmark · app link. */
export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the sheet on navigation and on Escape; lock page scroll while open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => !href.includes("#") && pathname === href;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-bone/10 bg-canvas/90 text-bone backdrop-blur-md">
      <div className="shell grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4">
        <nav aria-label="Main" className="hidden items-center gap-6 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "text-[15px] transition-colors",
                isActive(l.href) ? "text-bone underline underline-offset-[6px]" : "text-bone/65 hover:text-bone",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="lg:hidden" />

        <Link href="/" aria-label="Patient-Tap home" className="display text-[28px] leading-none tracking-[0.01em]">
          Patient-Tap
        </Link>

        <div className="flex items-center justify-end gap-5">
          <Link href="/app" className="hidden text-[15px] text-bone transition-colors hover:text-lemon sm:inline">
            Open the app <span aria-hidden>→</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="label py-2 text-bone lg:hidden"
          >
            {open ? "Close ×" : "Menu +"}
          </button>
        </div>
      </div>

      <div id="mobile-nav" hidden={!open} className="h-[calc(100dvh-4rem)] overflow-y-auto bg-canvas lg:hidden">
        <nav aria-label="Mobile" className="shell flex flex-col py-4">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="display flex items-center justify-between border-b border-bone/10 py-5 text-5xl"
            >
              {l.label}
              <span aria-hidden className="font-mono text-base">↗</span>
            </Link>
          ))}
          <div className="mt-8 flex flex-col gap-3">
            <Link href="/app" onClick={() => setOpen(false)} className="btn btn-solid justify-between">
              <span>Open the app</span>
              <span aria-hidden>→</span>
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="btn btn-line justify-between">
              <span>Contact us</span>
              <span aria-hidden>→</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
