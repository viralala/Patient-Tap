"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { PatientProfile } from "@/lib/types";
import { loadProfile, saveProfile } from "@/lib/store";
import { rescheduleAll } from "@/lib/reminders";

export type TabKey = "home" | "reminders" | "scan" | "responder" | "settings";
export type Route = "profile-edit" | "scan-doc" | "write-tag" | null;

interface Ctx {
  profile: PatientProfile;
  setProfile: (p: PatientProfile) => void;
  unlocked: boolean;
  setUnlocked: (v: boolean) => void;
  tab: TabKey;
  setTab: (t: TabKey) => void;
  route: Route;
  setRoute: (r: Route) => void;
  toast: { msg: string; icon?: React.ReactNode } | null;
  showToast: (msg: string, icon?: React.ReactNode) => void;
}

const AppCtx = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<PatientProfile>(loadProfile);
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTabState] = useState<TabKey>("home");
  const [route, setRoute] = useState<Route>(null);
  const [toast, setToast] = useState<Ctx["toast"]>(null);

  // Switching tabs clears any pushed sub-screen.
  const setTab = (t: TabKey) => {
    setRoute(null);
    setTabState(t);
  };
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setProfile = (p: PatientProfile) => {
    setProfileState(p);
    saveProfile(p);
    rescheduleAll(p.medications);
  };

  const showToast = (msg: string, icon?: React.ReactNode) => {
    setToast({ msg, icon });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    // Re-arm reminders on load.
    rescheduleAll(profile.medications);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppCtx.Provider value={{ profile, setProfile, unlocked, setUnlocked, tab, setTab, route, setRoute, toast, showToast }}>
      {children}
    </AppCtx.Provider>
  );
}
