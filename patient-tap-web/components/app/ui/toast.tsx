"use client";

import { create } from "zustand";
import { CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "error";
interface Toast {
  id: number;
  msg: string;
  tone: Tone;
}

interface ToastState {
  toasts: Toast[];
  push: (msg: string, tone?: Tone) => void;
  dismiss: (id: number) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (msg, tone = "default") => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, msg, tone }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3400);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

const ICONS = { default: Info, success: CheckCircle2, error: AlertTriangle };
const TONES = {
  default: "text-ink",
  success: "text-signal-deep",
  error: "text-critical-deep",
};

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[200] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => {
        const Icon = ICONS[t.tone];
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-paper-line bg-paper-card px-4 py-3 card-shadow-lg animate-float-slow [animation-iteration-count:1]"
          >
            <Icon className={cn("h-5 w-5 shrink-0", TONES[t.tone])} strokeWidth={2} />
            <p className="text-sm text-ink">{t.msg}</p>
          </div>
        );
      })}
    </div>
  );
}
