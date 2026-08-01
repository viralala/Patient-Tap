"use client";
import React from "react";
import { Icon } from "../ui/Icons";
import { Banner } from "../ui/Widgets";
import { useApp } from "../AppContext";
import { demoProfile, emptyProfile } from "@/lib/types";
import { wipeTag, tagIsSetUp, webNfcAvailable } from "@/lib/tag";
import { PLATFORM_LABEL, CAN_WRITE_TAG } from "@/lib/platform";

export function Settings() {
  const { profile, setProfile, setUnlocked, showToast } = useApp();

  const loadDemo = () => {
    setProfile(demoProfile());
    showToast("Demo profile loaded", <Icon.check size={16} color="var(--accent-green)" />);
  };
  const clearProfile = () => {
    if (confirm("Clear your local profile? This can't be undone.")) {
      setProfile(emptyProfile());
      showToast("Profile cleared", <Icon.check size={16} />);
    }
  };
  const clearTag = () => {
    wipeTag();
    showToast("Simulated tag wiped", <Icon.check size={16} />);
  };

  return (
    <div className="screen fade-in">
      <div className="large-title">Settings</div>

      <div className="section-title"><h2>Security</h2></div>
      <div className="card">
        <div className="rows">
          <Item icon={<Icon.lock size={20} />} tint="t-purple" title="App lock (PIN)" sub="Enabled · SHA-256 hashed, never stored in plaintext" />
          <Item icon={<Icon.fingerprint size={20} />} tint="t-purple" title="Biometric unlock" sub="Secondary method · simulated Face ID / fingerprint" />
          <Item icon={<Icon.key size={20} />} tint="t-green" title="Encryption" sub="AES-256-GCM · tamper detection via auth tag" />
        </div>
      </div>

      <div className="section-title"><h2>Tag &amp; platform</h2></div>
      <div className="card">
        <div className="rows">
          <Item icon={<Icon.nfc size={20} />} tint="t-blue" title="Platform" sub={`${PLATFORM_LABEL} · ${CAN_WRITE_TAG ? "read + write (NTAG215)" : "read-only (NDEF fallback)"}`} />
          <Item icon={<Icon.wifi size={20} />} tint={webNfcAvailable() ? "t-green" : "t-amber"} title="Web NFC" sub={webNfcAvailable() ? "Available — real taps supported" : "Not available — using simulated tag"} />
          <Item icon={<Icon.shield size={20} />} tint={tagIsSetUp() ? "t-green" : "t-amber"} title="Simulated tag" sub={tagIsSetUp() ? "Contains a written payload" : "Empty — write a profile to populate"} />
        </div>
      </div>

      <div className="section-title"><h2>Demo controls</h2></div>
      <div className="stack">
        <button className="btn btn-secondary" onClick={loadDemo}><Icon.sparkle size={18} /> Load demo profile</button>
        <button className="btn btn-secondary" onClick={clearTag}><Icon.nfc size={18} /> Wipe simulated tag</button>
        <button className="btn btn-ghost" style={{ color: "var(--accent-coral)" }} onClick={clearProfile}>Clear profile</button>
        <button className="btn btn-ghost" onClick={() => setUnlocked(false)}><Icon.lock size={18} /> Lock app</button>
      </div>

      <div style={{ height: 16 }} />
      <Banner kind="blue" title="About this build" icon={<Icon.info size={20} />}>
        Patient-Tap {PLATFORM_LABEL} — a Next.js build of PRD v2.0. Offline-first; encryption,
        conflict-checking, budgeting and parsing are real. NFC hardware, SMS and ML Kit OCR are
        native-only and simulated here.
      </Banner>
      <div className="caption center muted-2" style={{ paddingBottom: 20 }}>Version 2.0 · {profile.patientId}</div>
    </div>
  );
}

function Item({ icon, tint, title, sub }: { icon: React.ReactNode; tint: string; title: string; sub: string }) {
  return (
    <div className="row">
      <span className={`row-icon ${tint}`}>{icon}</span>
      <span className="row-main"><span className="row-title">{title}</span><span className="row-sub">{sub}</span></span>
    </div>
  );
}
