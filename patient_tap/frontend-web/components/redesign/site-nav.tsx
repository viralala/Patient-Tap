"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "How it works", href: "/#how" },
  { label: "MedVerify", href: "/verify", badge: "New" },
  { label: "Donate", href: "/donate" },
  { label: "Pricing", href: "/#pricing" },
  { label: "FAQ", href: "/#faq" },
];

/** Floating dark nav shared by every page: logo · links · CTA, with a mobile sheet. */
export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "transition-[background-color,backdrop-filter,border-color] duration-500",
          scrolled || open
            ? "border-b border-white/[0.06] bg-void/75 backdrop-blur-xl"
            : "border-b border-transparent",
        )}
      >
        <div className="shell flex items-center justify-between gap-6 py-4">
          <Link href="/" aria-label="Patient-Tap home" className="flex shrink-0 items-center gap-2">
            <LogoMark className="h-6 w-6" />
            <span className="font-sans text-[15px] font-semibold tracking-tight text-white">
              Patient<span className="text-royal-400">·</span>Tap
            </span>
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "page" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm transition-colors duration-300",
                  isActive(l.href) ? "bg-white/10 text-white" : "text-white/60 hover:text-white",
                )}
              >
                {l.label}
                {l.badge && (
                  <span className="ml-1.5 rounded-full bg-signal/20 px-1.5 py-0.5 align-middle font-mono text-[9px] uppercase tracking-wider text-signal-soft">
                    {l.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/app"
              data-cursor="open"
              className="hidden rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.04] sm:inline-flex"
            >
              Launch app
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10 lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* mobile sheet */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="h-[calc(100dvh-73px)] overflow-y-auto bg-void/95 backdrop-blur-xl lg:hidden"
      >
        <nav aria-label="Mobile" className="shell flex flex-col gap-1 py-6">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="flex items-center justify-between border-b border-white/[0.07] py-4 font-sans text-2xl font-semibold tracking-tight text-white"
            >
              <span>
                {l.label}
                {l.badge && (
                  <span className="ml-2 rounded-full bg-signal/20 px-2 py-0.5 align-middle font-mono text-[10px] uppercase tracking-wider text-signal-soft">
                    {l.badge}
                  </span>
                )}
              </span>
              <ArrowUpRight className="h-5 w-5 text-white/40" />
            </Link>
          ))}
          <Link
            href="/app"
            onClick={() => setOpen(false)}
            className="mt-6 rounded-full bg-white py-3.5 text-center text-sm font-medium text-black"
          >
            Launch the app
          </Link>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="rounded-full border border-white/20 py-3.5 text-center text-sm font-medium text-white"
          >
            Contact us
          </Link>
        </nav>
      </div>
    </header>
  );
}
