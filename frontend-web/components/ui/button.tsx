"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Magnetic } from "./magnetic";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "ghostInverse" | "white";

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-pill px-6 py-3 text-sm font-medium tracking-tight transition-colors duration-300 ease-smooth select-none";

const variants: Record<Variant, string> = {
  // Solid royal — dark bg, white text.
  primary: "bg-royal-500 text-white hover:bg-royal-600",
  // Outline on light paper — ink text.
  ghost: "border border-ink/15 text-ink hover:border-ink/40 hover:bg-ink/[0.03]",
  // Outline on dark ink — white text.
  ghostInverse: "border border-white/25 text-white hover:border-white/60 hover:bg-white/[0.06]",
  // Solid white — dark ink text (for dark backgrounds).
  white: "bg-white text-ink hover:bg-white/90",
};

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  arrow?: boolean;
  magnetic?: boolean;
  cursorLabel?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}

export function Button({
  children,
  href,
  onClick,
  variant = "primary",
  className,
  arrow = false,
  magnetic = true,
  cursorLabel,
  type = "button",
  disabled,
}: ButtonProps) {
  const inner = (
    <>
      {/* hover sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-sheen"
      />
      <span className="relative z-10">{children}</span>
      {arrow && (
        <ArrowUpRight
          className="relative z-10 h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          strokeWidth={2}
        />
      )}
    </>
  );

  const cls = cn(base, variants[variant], disabled && "pointer-events-none opacity-50", className);

  const node = href ? (
    <Link href={href} className={cls} data-cursor={cursorLabel}>
      {inner}
    </Link>
  ) : (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cls}
      data-cursor={cursorLabel}
    >
      {inner}
    </button>
  );

  return magnetic ? <Magnetic strength={0.3}>{node}</Magnetic> : node;
}
