"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Floating dark pill bottom nav with circular icon buttons; the active item
 * expands to reveal its label (royal fill). Matches the reference design.
 */
export function PillNav({
  items,
  active,
  onChange,
}: {
  items: NavItem[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <nav className="glass pointer-events-auto flex items-center gap-1 rounded-pill bg-ink/90 p-1.5 shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)]">
        {items.map((it) => {
          const isActive = it.key === active;
          return (
            <button
              key={it.key}
              onClick={() => onChange(it.key)}
              data-cursor={isActive ? undefined : it.label.toLowerCase()}
              aria-label={it.label}
              className={cn(
                "flex items-center gap-2 rounded-pill text-sm font-medium transition-all duration-300 ease-springy",
                isActive
                  ? "bg-royal-500 px-4 py-2.5 text-white"
                  : "px-2.5 py-2.5 text-white/55 hover:text-white",
              )}
            >
              <it.icon className="h-5 w-5 shrink-0" strokeWidth={2} />
              <span
                className={cn(
                  "overflow-hidden whitespace-nowrap transition-all duration-300",
                  isActive ? "max-w-[100px] opacity-100" : "max-w-0 opacity-0",
                )}
              >
                {it.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
