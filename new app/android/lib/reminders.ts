// Medication reminders (F3) — fully offline via local notifications.
//
// Android-native uses AlarmManager/WorkManager. On web the equivalent offline
// primitive is the Notification API + an in-page timer (works while the app is
// open; a real PWA would use the Service Worker + Notification Triggers API).

import { MedEntry } from "./types";

export interface ScheduledReminder {
  med: MedEntry;
  fireAt: number; // epoch ms of next fire
  timer?: ReturnType<typeof setTimeout>;
}

const active: Map<string, ScheduledReminder> = new Map();

export async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}

/** Next epoch-ms for an "HH:MM" local time today or tomorrow. */
export function nextFireTime(hhmm: string, from: number = Date.now()): number {
  const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10));
  const d = new Date(from);
  d.setHours(h, m, 0, 0);
  if (d.getTime() <= from) d.setDate(d.getDate() + 1);
  return d.getTime();
}

function fire(med: MedEntry) {
  if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
    new Notification("💊 Medication reminder", {
      body: `${med.name} — ${med.dose}. ${med.frequency}`,
      tag: "patienttap-" + med.name,
    });
  }
  window.dispatchEvent(new CustomEvent("patienttap:reminder", { detail: med }));
}

export function scheduleReminder(med: MedEntry): ScheduledReminder | null {
  if (!med.reminderTime || !med.reminderEnabled) return null;
  cancelReminder(med);
  const fireAt = nextFireTime(med.reminderTime);
  const delay = Math.max(0, fireAt - Date.now());
  const timer = setTimeout(() => {
    fire(med);
    // Reschedule for next day (daily) — offline, no server.
    scheduleReminder(med);
  }, delay);
  const rec: ScheduledReminder = { med, fireAt, timer };
  active.set(med.name, rec);
  return rec;
}

export function cancelReminder(med: MedEntry): void {
  const rec = active.get(med.name);
  if (rec?.timer) clearTimeout(rec.timer);
  active.delete(med.name);
}

export function rescheduleAll(meds: MedEntry[]): void {
  for (const rec of active.values()) if (rec.timer) clearTimeout(rec.timer);
  active.clear();
  for (const m of meds) scheduleReminder(m);
}

export function getScheduled(): ScheduledReminder[] {
  return Array.from(active.values()).sort((a, b) => a.fireAt - b.fireAt);
}

/** Fire a reminder in `seconds` — used so a demo can show a live notification. */
export function scheduleDemoReminder(med: MedEntry, seconds: number): void {
  setTimeout(() => fire(med), seconds * 1000);
}
