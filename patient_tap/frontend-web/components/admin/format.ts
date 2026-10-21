/**
 * Date helpers for the admin views. Everything is formatted in IST against the
 * registry's own timestamp, so server and client render the same text.
 */

const TZ = "Asia/Kolkata";

export function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
}

export function fmtDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: TZ,
  });
}

export function fmtAgo(iso: string, nowIso: string): string {
  const mins = Math.max(0, Math.round((Date.parse(nowIso) - Date.parse(iso)) / 60_000));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return `${Math.round(hrs / 24)} d ago`;
}
