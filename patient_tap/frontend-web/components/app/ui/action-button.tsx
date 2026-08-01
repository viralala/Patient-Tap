"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "dark" | "critical" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-royal-500 text-white hover:bg-royal-600",
  dark: "bg-ink text-white hover:bg-ink-soft",
  critical: "bg-critical text-white hover:bg-critical-deep",
  ghost: "border border-paper-line bg-paper-card text-ink hover:border-ink/25",
};

export function ActionButton({
  children,
  onClick,
  disabled,
  variant = "primary",
  icon: Icon,
  type = "button",
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: Variant;
  icon?: LucideIcon;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 text-sm font-semibold tracking-tight transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />}
      {children}
    </button>
  );
}
