"use client";

import { HeartPulse, Siren } from "lucide-react";
import { cn } from "@/lib/utils";

export type Role = "patient" | "responder";

export function RoleSwitch({
  role,
  onChange,
}: {
  role: Role;
  onChange: (r: Role) => void;
}) {
  return (
    <div className="relative flex rounded-pill bg-ink p-1 text-sm">
      <span
        className={cn(
          "absolute inset-y-1 w-[calc(50%-4px)] rounded-pill bg-royal-500 transition-transform duration-300 ease-springy",
          role === "responder" && "translate-x-full",
        )}
      />
      <button
        onClick={() => onChange("patient")}
        className={cn(
          "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-pill px-4 py-2 font-medium transition-colors",
          role === "patient" ? "text-white" : "text-white/50",
        )}
      >
        <HeartPulse className="h-4 w-4" /> Patient
      </button>
      <button
        onClick={() => onChange("responder")}
        className={cn(
          "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-pill px-4 py-2 font-medium transition-colors",
          role === "responder" ? "text-white" : "text-white/50",
        )}
      >
        <Siren className="h-4 w-4" /> Responder
      </button>
    </div>
  );
}
