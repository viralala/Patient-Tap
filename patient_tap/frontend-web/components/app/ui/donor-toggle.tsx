"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Calm (non-alarming) switch for donor status — informational, not life-safety. */
export function DonorToggle({
  icon: Icon,
  label,
  hint,
  value,
  onChange,
}: {
  icon: LucideIcon;
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-colors",
        value ? "border-royal-300 bg-royal-50" : "border-paper-line bg-paper-card",
      )}
    >
      <span className="flex items-center gap-3">
        <span
          className={cn(
            "grid h-9 w-9 place-items-center rounded-xl transition-colors",
            value ? "bg-royal-100 text-royal-600" : "bg-paper-sunk text-ink/40",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={2} />
        </span>
        <span>
          <span className="block text-sm font-medium text-ink">{label}</span>
          <span className="block text-xs text-ink/45">{hint}</span>
        </span>
      </span>
      <span className={cn("relative h-7 w-12 shrink-0 rounded-pill transition-colors", value ? "bg-royal-500" : "bg-ink/15")}>
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            value ? "translate-x-6" : "translate-x-1",
          )}
        />
      </span>
    </button>
  );
}
