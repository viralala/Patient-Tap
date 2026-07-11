"use client";
import React, { useState } from "react";
import { AppProvider, useApp } from "./AppContext";
import { StatusBar, Toast } from "./ui/Widgets";
import { Icon } from "./ui/Icons";
import { Lock } from "./screens/Lock";
import { Home } from "./screens/Home";
import { Reminders } from "./screens/Reminders";
import { WriteTag } from "./screens/WriteTag";
import { Responder } from "./screens/Responder";
import { Settings } from "./screens/Settings";
import { ProfileEdit } from "./screens/ProfileEdit";
import { ScanDoc } from "./screens/ScanDoc";

export default function App() {
  return (
    <AppProvider>
      <div className="stage">
        <div className="device">
          <StatusBar />
          <Shell />
        </div>
      </div>
    </AppProvider>
  );
}

function Shell() {
  const { unlocked, tab, route, toast } = useApp();
  // Responder mode is reachable without unlocking (F0.3).
  const [responderOnly, setResponderOnly] = useState(false);

  if (!unlocked && !responderOnly) {
    return (
      <>
        <LockWithResponder onResponder={() => setResponderOnly(true)} />
        {toast && <Toast msg={toast.msg} icon={toast.icon} />}
      </>
    );
  }

  if (responderOnly && !unlocked) {
    return (
      <>
        <div className="row-flex" style={{ padding: "6px 18px 0" }}>
          <span className="eyebrow">Emergency access · no login</span>
          <button className="pill-cta" onClick={() => setResponderOnly(false)}>
            <Icon.lock size={14} /> Exit
          </button>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Responder />
        </div>
        {toast && <Toast msg={toast.msg} icon={toast.icon} />}
      </>
    );
  }

  return (
    <>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
        {route === "profile-edit" ? (
          <ProfileEdit />
        ) : route === "scan-doc" ? (
          <ScanDoc />
        ) : route === "write-tag" ? (
          <WriteTag />
        ) : (
          <CurrentTab tab={tab} />
        )}
      </div>
      {!route && <TabBar />}
      {toast && <Toast msg={toast.msg} icon={toast.icon} />}
    </>
  );
}

function LockWithResponder({ onResponder }: { onResponder: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Lock
        footer={
          <button className="btn btn-ghost" style={{ color: "var(--accent-blue)" }} onClick={onResponder}>
            <Icon.stethoscope size={18} /> I&apos;m a responder — scan without unlocking
          </button>
        }
      />
    </div>
  );
}

function CurrentTab({ tab }: { tab: string }) {
  switch (tab) {
    case "home": return <Home />;
    case "reminders": return <Reminders />;
    case "scan": return <WriteTag />;
    case "responder": return <Responder />;
    case "settings": return <Settings />;
    default: return <Home />;
  }
}

function TabBar() {
  const { tab, setTab } = useApp();
  const item = (key: string, label: string, icon: React.ReactNode, extra = "") => (
    <button className={`tab ${extra} ${tab === key ? "active" : ""}`} onClick={() => setTab(key as any)}>
      <span className="tab-icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
  return (
    <div className="tabbar">
      {item("home", "Home", <Icon.home size={22} />)}
      {item("reminders", "Reminders", <Icon.bell size={22} />)}
      {item("scan", "Tag", <Icon.nfc size={24} />, "scan")}
      {item("responder", "Responder", <Icon.stethoscope size={22} />)}
      {item("settings", "Settings", <Icon.settings size={22} />)}
    </div>
  );
}
