"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/** Concentric pulsing rings around a center icon — used on the scan screen. */
export function PulsingRing({
  icon: Icon,
  active = true,
  tone = "royal",
}: {
  icon: LucideIcon;
  active?: boolean;
  tone?: "royal" | "critical";
}) {
  const ring = tone === "critical" ? "border-critical/50" : "border-royal-400/50";
  const core = tone === "critical" ? "bg-critical" : "bg-royal-500";

  return (
    <div className="relative grid h-56 w-56 place-items-center">
      {active &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("absolute rounded-full border", ring)}
            style={{
              width: `${96 + i * 46}px`,
              height: `${96 + i * 46}px`,
              animation: `pulse-ring 2.4s cubic-bezier(0.4,0,0.2,1) ${i * 0.5}s infinite`,
            }}
          />
        ))}
      <div
        className={cn(
          "relative grid h-24 w-24 place-items-center rounded-full text-white card-shadow-lg",
          core,
        )}
      >
        <Icon className="h-10 w-10" strokeWidth={1.8} />
      </div>
    </div>
  );
}
