"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { PatientProfile } from "@/lib/types";
import { loadProfile, saveProfile } from "@/lib/store";
import { rescheduleAll } from "@/lib/reminders";
import {
  getSession,
  onAuthChange,
  getSubscriptionStatus,
  signInWithGoogle,
  signOut,
  saveProfileBackup,
  restoreProfileBackup,
  saveEmergencyContacts,
  IS_LIVE,
  type AppSession,
  type SubscriptionInfo,
} from "@/lib/backend";

export type TabKey = "home" | "reminders" | "scan" | "responder" | "settings";
export type Route = "profile-edit" | "scan-doc" | "write-tag" | null;

const K_CLOUD = "patienttap.pref.cloudBackup";
const K_ALERTS = "patienttap.pref.alerts";

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

  // ---- Backend / account ----
  session: AppSession | null;
  authReady: boolean;
  isLive: boolean;
  subscription: SubscriptionInfo;
  refreshSubscription: () => Promise<void>;
  signIn: () => Promise<void>;
  signOutApp: () => Promise<void>;
  cloudBackup: boolean;
  setCloudBackup: (v: boolean) => void;
  alertsEnabled: boolean;
  setAlertsEnabled: (v: boolean) => void;
  backupNow: () => Promise<boolean>;
  restoreFromCloud: () => Promise<boolean>;
}

const AppCtx = createContext<Ctx | null>(null);

export function useApp(): Ctx {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp must be used within AppProvider");
  return c;
}

function readPref(key: string, dflt: boolean): boolean {
  if (typeof window === "undefined") return dflt;
  const v = localStorage.getItem(key);
  return v === null ? dflt : v === "1";
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<PatientProfile>(loadProfile);
  const [unlocked, setUnlocked] = useState(false);
  const [tab, setTabState] = useState<TabKey>("home");
  const [route, setRoute] = useState<Route>(null);
  const [toast, setToast] = useState<Ctx["toast"]>(null);

  const [session, setSession] = useState<AppSession | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({ tier: "free" });
  const [cloudBackup, setCloudBackupState] = useState(false);
  const [alertsEnabled, setAlertsEnabledState] = useState(false);

  const setTab = (t: TabKey) => {
    setRoute(null);
    setTabState(t);
  };
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string, icon?: React.ReactNode) => {
    setToast({ msg, icon });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const refreshSubscription = async () => {
    try {
      setSubscription(await getSubscriptionStatus());
    } catch {
      /* offline — keep last known */
    }
  };

  // Persisted preferences.
  const setCloudBackup = (v: boolean) => {
    setCloudBackupState(v);
    if (typeof window !== "undefined") localStorage.setItem(K_CLOUD, v ? "1" : "0");
  };
  const setAlertsEnabled = (v: boolean) => {
    setAlertsEnabledState(v);
    if (typeof window !== "undefined") localStorage.setItem(K_ALERTS, v ? "1" : "0");
    if (v && session) void saveEmergencyContacts(profile.emergencyContacts);
  };

  const setProfile = (p: PatientProfile) => {
    setProfileState(p);
    saveProfile(p);
    rescheduleAll(p.medications);
    // Opportunistic, debounced E2E cloud backup.
    if (cloudBackup && session) {
      if (backupTimer.current) clearTimeout(backupTimer.current);
      backupTimer.current = setTimeout(() => {
        void saveProfileBackup(p);
        if (alertsEnabled) void saveEmergencyContacts(p.emergencyContacts);
      }, 1500);
    }
  };

  const backupNow = async () => {
    const ok = await saveProfileBackup(profile);
    if (ok && alertsEnabled) await saveEmergencyContacts(profile.emergencyContacts);
    return ok;
  };

  const restoreFromCloud = async () => {
    const restored = await restoreProfileBackup();
    if (restored) {
      setProfileState(restored);
      saveProfile(restored);
      rescheduleAll(restored.medications);
      return true;
    }
    return false;
  };

  const signIn = () => signInWithGoogle();
  const signOutApp = async () => {
    await signOut();
    setSession(null);
    setUnlocked(false);
    setSubscription({ tier: "free" });
  };

  // ---- Boot: reminders + auth session ----
  useEffect(() => {
    rescheduleAll(profile.medications);
    setCloudBackupState(readPref(K_CLOUD, false));
    setAlertsEnabledState(readPref(K_ALERTS, false));

    // Returning from Stripe Checkout — refresh billing state, tidy the URL.
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const billing = params.get("billing");
      if (billing) {
        params.delete("billing");
        const qs = params.toString();
        window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
        if (billing === "success") {
          showToast("Subscription updated");
          setTimeout(() => void refreshSubscription(), 2000);
        }
      }
    }

    let mounted = true;
    getSession()
      .then((s) => {
        if (!mounted) return;
        setSession(s);
        setAuthReady(true);
        if (s) void refreshSubscription();
      })
      .catch(() => mounted && setAuthReady(true));

    const unsub = onAuthChange((s) => {
      setSession(s);
      setAuthReady(true);
      if (s) void refreshSubscription();
    });
    return () => {
      mounted = false;
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppCtx.Provider
      value={{
        profile,
        setProfile,
        unlocked,
        setUnlocked,
        tab,
        setTab,
        route,
        setRoute,
        toast,
        showToast,
        session,
        authReady,
        isLive: IS_LIVE,
        subscription,
        refreshSubscription,
        signIn,
        signOutApp,
        cloudBackup,
        setCloudBackup,
        alertsEnabled,
        setAlertsEnabled,
        backupNow,
        restoreFromCloud,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}
