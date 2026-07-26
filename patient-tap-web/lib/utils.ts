import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className joiner. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** "14:32" — 24h clock, used on log rows. */
export function formatClock(d: Date): string {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

/** "9 Jul, 14:32". */
export function formatDateTime(d: Date): string {
  return d.toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** "12 min ago" / "3 h ago" / "just now". */
export function formatRelative(d: Date): string {
  const secs = Math.round((Date.now() - d.getTime()) / 1000);
  if (secs < 45) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  return `${days} d ago`;
}

/** Clamp a number to [min, max]. */
export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
