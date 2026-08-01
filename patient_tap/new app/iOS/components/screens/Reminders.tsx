"use client";
import React, { useEffect, useState } from "react";
import { Icon } from "../ui/Icons";
import { Segmented, Switch, Banner } from "../ui/Widgets";
import { useApp } from "../AppContext";
import { MedEntry } from "@/lib/types";
import { ensureNotificationPermission, scheduleDemoReminder, nextFireTime } from "@/lib/reminders";

// F3 — medication reminders, fully offline (local notifications).
export function Reminders() {
  const { profile, setProfile, setRoute, showToast } = useApp();
  const [range, setRange] = useState<"today" | "week" | "month">("today");
  const [perm, setPerm] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) setPerm(Notification.permission);
    const onFire = (e: Event) => {
      const med = (e as CustomEvent).detail as MedEntry;
      showToast(`Time to take ${med.name}`, <Icon.pill size={16} color="var(--accent-amber)" />);
    };
    window.addEventListener("patienttap:reminder", onFire);
    return () => window.removeEventListener("patienttap:reminder", onFire);
  }, [showToast]);

  const meds = profile.medications;
  const withReminders = meds.filter((m) => m.reminderEnabled && m.reminderTime);

  const toggle = (name: string, on: boolean) => {
    const next = structuredClone(profile);
    const m = next.medications.find((x) => x.name === name);
    if (m) {
      m.reminderEnabled = on;
      if (on && !m.reminderTime) m.reminderTime = "09:00";
    }
    setProfile(next);
  };

  const enableNotifications = async () => {
    const ok = await ensureNotificationPermission();
    setPerm(ok ? "granted" : "denied");
    showToast(ok ? "Notifications enabled" : "Permission denied", ok ? <Icon.check size={16} /> : <Icon.x size={16} />);
  };

  const testNotify = () => {
    const m = withReminders[0] ?? meds[0] ?? { name: "Metformin", dose: "500mg", frequency: "Twice daily" };
    scheduleDemoReminder(m, 4);
    showToast("Test reminder in 4s…", <Icon.clock size={16} color="var(--accent-amber)" />);
  };

  return (
    <div className="screen fade-in">
      <div className="large-title">Reminders</div>

      <Segmented
        value={range}
        onChange={setRange}
        options={[
          { value: "today", label: "Today" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
        ]}
      />

      {perm !== "granted" && (
        <div style={{ marginTop: 14 }}>
          <Banner kind="amber" title="Turn on notifications" icon={<Icon.bell size={20} />}>
            Reminders fire as offline local notifications. Enable them to get alerts even with no network.
          </Banner>
          <button className="btn btn-secondary" onClick={enableNotifications}>Enable notifications</button>
        </div>
      )}

      <div className="section-title"><h2>Scheduled today</h2></div>
      {withReminders.length === 0 ? (
        <div className="card center" style={{ padding: 26 }}>
          <Icon.clock size={30} color="var(--text-muted)" />
          <div className="caption" style={{ marginTop: 10 }}>No reminders yet. Add times to your medications.</div>
        </div>
      ) : (
        <div className="card">
          <div className="rows">
            {withReminders
              .slice()
              .sort((a, b) => (a.reminderTime! < b.reminderTime! ? -1 : 1))
              .map((m) => (
                <div key={m.name} className="row">
                  <span className="row-icon t-amber"><Icon.pill size={20} /></span>
                  <span className="row-main">
                    <span className="row-title">{m.name}</span>
                    <span className="row-sub">{m.dose} · {m.frequency}</span>
                  </span>
                  <span className="row-right">
                    <span className="row-value">{fmt(m.reminderTime!)}</span>
                    <span className="row-time">{relative(m.reminderTime!)}</span>
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="section-title"><h2>All medications</h2></div>
      <div className="card">
        <div className="rows">
          {meds.map((m) => (
            <div key={m.name} className="row">
              <span className="row-icon t-purple"><Icon.pill size={20} /></span>
              <span className="row-main">
                <span className="row-title">{m.name}</span>
                <span className="row-sub">{m.reminderEnabled && m.reminderTime ? `Reminder at ${fmt(m.reminderTime)}` : "No reminder"}</span>
              </span>
              <Switch on={!!m.reminderEnabled} onChange={(v) => toggle(m.name, v)} />
            </div>
          ))}
          {meds.length === 0 && <div className="caption muted-2" style={{ padding: "6px 2px" }}>No medications yet.</div>}
        </div>
      </div>

      <div style={{ height: 16 }} />
      <button className="btn btn-secondary" onClick={() => setRoute("profile-edit")}><Icon.plus size={18} /> Add medication</button>
      <button className="btn btn-ghost" style={{ marginTop: 8 }} onClick={testNotify}><Icon.bell size={18} /> Fire a test reminder</button>
      <div style={{ height: 20 }} />
    </div>
  );
}

function fmt(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ap}`;
}
function relative(hhmm: string): string {
  const diff = nextFireTime(hhmm) - Date.now();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h > 0) return `in ${h}h ${m}m`;
  return `in ${m}m`;
}
