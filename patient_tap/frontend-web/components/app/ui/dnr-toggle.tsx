"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Red life-safety toggle for the Do-Not-Resuscitate flag. */
export function DnrToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-colors",
        value
          ? "border-critical/40 bg-critical/[0.06]"
          : "border-paper-line bg-paper-card",
      )}
    >
      <span className="flex items-center gap-3">
        <span
          className={cn(
            "grid h-9 w-9 place-items-center rounded-xl transition-colors",
            value ? "bg-critical/15 text-critical" : "bg-paper-sunk text-ink/40",
          )}
        >
          <AlertTriangle className="h-5 w-5" strokeWidth={2} />
        </span>
        <span>
          <span className={cn("block text-sm font-medium", value ? "text-critical-deep" : "text-ink")}>
            Do Not Resuscitate
          </span>
          <span className="block text-xs text-ink/45">
            {value ? "Flagged — shown loudest to responders" : "Off"}
          </span>
        </span>
      </span>
      <span
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-pill transition-colors",
          value ? "bg-critical" : "bg-ink/15",
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform",
            value ? "translate-x-6" : "translate-x-1",
          )}
        />
      </span>
    </button>
  );
}
