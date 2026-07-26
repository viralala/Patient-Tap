"use client";
import React, { useState } from "react";
import { Icon } from "../ui/Icons";
import { Banner, Switch } from "../ui/Widgets";
import { useApp } from "../AppContext";
import { demoProfile, emptyProfile, ALL_SELECTED, type WriteSelection } from "@/lib/types";
import { projectForWrite } from "@/lib/store";
import { wipeTag, tagIsSetUp, webNfcAvailable } from "@/lib/tag";
import { PLATFORM_LABEL, CAN_WRITE_TAG } from "@/lib/platform";
import { TIERS, TIER_ORDER, tierRank, type BillingCycle, type Tier } from "@/lib/config";
import { createCheckout, openBillingPortal, createShareLink, notifyEmergencyContacts } from "@/lib/backend";

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export function Settings() {
  const {
    profile,
    setProfile,
    setUnlocked,
    showToast,
    session,
    isLive,
    subscription,
    refreshSubscription,
    signOutApp,
    cloudBackup,
    setCloudBackup,
    alertsEnabled,
    setAlertsEnabled,
    backupNow,
    restoreFromCloud,
  } = useApp();

  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [busy, setBusy] = useState<string | null>(null);
  const [share, setShare] = useState<{ url: string; expiresAt: string | null } | null>(null);

  const tier = subscription.tier;

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

  // ---- Billing ----
  const upgrade = async (target: Tier) => {
    setBusy(target);
    const res = await createCheckout(target, cycle);
    setBusy(null);
    if (!res.ok) {
      showToast(res.message || "Checkout failed", <Icon.x size={16} />);
      return;
    }
    if (res.url) {
      window.location.href = res.url; // real Stripe Checkout
      return;
    }
    // Demo — simulated upgrade
    await refreshSubscription();
    showToast(res.message || "Upgraded", <Icon.checkCircle size={16} color="var(--accent-green)" />);
  };

  const manage = async () => {
    setBusy("portal");
    const res = await openBillingPortal();
    setBusy(null);
    if (res.url) {
      window.location.href = res.url;
      return;
    }
    await refreshSubscription();
    showToast(res.message || "Updated", <Icon.check size={16} />);
  };

  // ---- Cloud ----
  const doBackup = async () => {
    setBusy("backup");
    const ok = await backupNow();
    setBusy(null);
    showToast(ok ? "Backed up (encrypted)" : "Backup failed", <Icon.check size={16} color={ok ? "var(--accent-green)" : undefined} />);
  };
  const doRestore = async () => {
    if (!confirm("Restore the cloud backup? This replaces your current on-device profile.")) return;
    setBusy("restore");
    const ok = await restoreFromCloud();
    setBusy(null);
    showToast(ok ? "Profile restored" : "No backup found", ok ? <Icon.check size={16} color="var(--accent-green)" /> : <Icon.info size={16} />);
  };
  const testAlert = async () => {
    setBusy("alert");
    const res = await notifyEmergencyContacts({
      patientPublicId: profile.patientId,
      patientName: profile.name || undefined,
      message: `Test emergency alert for ${profile.name || "a Patient-Tap user"}.`,
    });
    setBusy(null);
    showToast(res.message || (res.ok ? "Alert sent" : "Alert failed"), <Icon.alert size={16} />);
  };

  // ---- Share ----
  const SHARE_SEL: WriteSelection = { ...ALL_SELECTED, log: false };
  const makeShare = async () => {
    setBusy("share");
    const card = { ...projectForWrite(profile, SHARE_SEL), ts: Date.now() };
    const link = await createShareLink(card, { expiresInHours: 24, label: "Emergency card" });
    setBusy(null);
    if (!link) {
      showToast("Could not create link", <Icon.x size={16} />);
      return;
    }
    setShare({ url: link.url, expiresAt: link.expiresAt });
  };
  const copyShare = async () => {
    if (!share) return;
    try {
      await navigator.clipboard.writeText(share.url);
      showToast("Link copied", <Icon.check size={16} color="var(--accent-green)" />);
    } catch {
      showToast("Copy failed — long-press the link", <Icon.info size={16} />);
    }
  };

  return (
    <div className="screen fade-in">
      <div className="large-title">Settings</div>

      {/* ---------- Account ---------- */}
      <div className="section-title"><h2>Account</h2></div>
      <div className="card">
        <div className="row">
          <span className="avatar" style={{ width: 40, height: 40 }}>
            {session?.user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.avatarUrl} alt="" style={{ width: "100%", height: "100%", borderRadius: 999 }} />
            ) : (
              (session?.user.name?.[0] || "U").toUpperCase()
            )}
          </span>
          <span className="row-main">
            <span className="row-title">{session?.user.name || "Signed in"}</span>
            <span className="row-sub">{session?.user.email}{!isLive && " · demo session"}</span>
          </span>
        </div>
        <div style={{ padding: "12px 14px 14px" }}>
          <button className="btn btn-secondary btn-sm" onClick={signOutApp} style={{ width: "100%" }}>
            <Icon.lock size={16} /> Sign out
          </button>
        </div>
      </div>

      {/* ---------- Subscription ---------- */}
      <div className="section-title">
        <h2>Subscription</h2>
        <span className="pill-cta" style={{ height: 28, fontSize: 12 }}>{TIERS[tier].displayName}</span>
      </div>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{TIERS[tier].displayName} plan</div>
            <div className="row-sub">
              {tier === "free"
                ? "Upgrade for cloud backup, alerts & sharing"
                : `${subscription.status || "active"}${subscription.currentPeriodEnd ? ` · renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}` : ""}`}
            </div>
          </div>
        </div>

        {/* Billing cycle */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {(["monthly", "yearly"] as BillingCycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className="btn-sm"
              style={{
                flex: 1,
                borderRadius: 999,
                fontWeight: 600,
                background: cycle === c ? "var(--accent-purple)" : "var(--surface-alt)",
                color: cycle === c ? "#fff" : "var(--text-secondary)",
              }}
            >
              {c === "monthly" ? "Monthly" : "Yearly · save 10%"}
            </button>
          ))}
        </div>

        {/* Plan options */}
        <div className="stack" style={{ gap: 10 }}>
          {TIER_ORDER.map((t) => {
            const meta = TIERS[t];
            const price = t === "free" ? 0 : cycle === "monthly" ? meta.monthlyInr : meta.yearlyInr;
            const isCurrent = t === tier;
            const isUpgrade = tierRank(t) > tierRank(tier);
            return (
              <div key={t} className="card-alt" style={{ borderColor: isCurrent ? "var(--accent-purple)" : "var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{meta.displayName}</div>
                    <div className="row-sub" style={{ whiteSpace: "normal" }}>{meta.blurb}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{t === "free" ? "Free" : inr(price)}</div>
                    {t !== "free" && <div className="row-sub">/{cycle === "monthly" ? "mo" : "yr"}</div>}
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  {isCurrent ? (
                    <button className="btn btn-secondary btn-sm" disabled style={{ width: "100%" }}>
                      <Icon.check size={16} /> Current plan
                    </button>
                  ) : isUpgrade ? (
                    <button className="btn btn-primary btn-sm" onClick={() => upgrade(t)} disabled={busy === t} style={{ width: "100%" }}>
                      {busy === t ? "…" : `Upgrade to ${meta.displayName}`}
                    </button>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={manage} disabled={busy === "portal"} style={{ width: "100%" }}>
                      Switch / manage
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {tier !== "free" && (
          <button className="btn btn-ghost btn-sm" onClick={manage} disabled={busy === "portal"} style={{ width: "100%", marginTop: 10 }}>
            Manage billing
          </button>
        )}
      </div>

      {/* ---------- Cloud & sync ---------- */}
      <div className="section-title"><h2>Cloud &amp; sync</h2></div>
      <div className="card">
        <div className="rows">
          <ToggleRow
            icon={<Icon.wifi size={20} />} tint="t-blue"
            title="Cloud backup" sub="End-to-end encrypted — the server stores ciphertext only"
            on={cloudBackup} onChange={setCloudBackup}
          />
          <ToggleRow
            icon={<Icon.alert size={20} />} tint="t-amber"
            title="Emergency alerts" sub="Notify your contacts when your tag is scanned"
            on={alertsEnabled} onChange={setAlertsEnabled}
          />
        </div>
        <div style={{ display: "flex", gap: 10, padding: "12px 14px 14px" }}>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={doBackup} disabled={!cloudBackup || busy === "backup"}>
            {busy === "backup" ? "…" : "Back up now"}
          </button>
          <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={doRestore} disabled={busy === "restore"}>
            {busy === "restore" ? "…" : "Restore"}
          </button>
        </div>
        {alertsEnabled && (
          <div style={{ padding: "0 14px 14px" }}>
            <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={testAlert} disabled={busy === "alert"}>
              <Icon.alert size={16} /> Send a test alert
            </button>
          </div>
        )}
      </div>

      {/* ---------- Secure share ---------- */}
      <div className="section-title"><h2>Secure share</h2></div>
      <div className="card" style={{ padding: 16 }}>
        <div className="row-sub" style={{ whiteSpace: "normal", marginBottom: 12 }}>
          Create a revocable, time-limited link to your emergency card for when there&apos;s no NFC
          reader. The decryption key stays in the link and never reaches our servers.
        </div>
        <button className="btn btn-secondary btn-sm" style={{ width: "100%" }} onClick={makeShare} disabled={busy === "share"}>
          <Icon.arrowSwap size={16} /> {busy === "share" ? "Creating…" : "Create emergency link"}
        </button>
        {share && (
          <div className="card-alt" style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, wordBreak: "break-all", color: "var(--text-secondary)", marginBottom: 10 }}>{share.url}</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={copyShare}><Icon.doc size={16} /> Copy</button>
              <a className="btn btn-secondary btn-sm" style={{ flex: 1, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }} href={share.url} target="_blank" rel="noreferrer"><Icon.eye size={16} /> Open</a>
            </div>
            {share.expiresAt && <div className="row-sub" style={{ marginTop: 8 }}>Expires {new Date(share.expiresAt).toLocaleString()}</div>}
          </div>
        )}
      </div>

      {/* ---------- Security ---------- */}
      <div className="section-title"><h2>Security</h2></div>
      <div className="card">
        <div className="rows">
          <Item icon={<Icon.lock size={20} />} tint="t-purple" title="App lock (PIN)" sub="Enabled · SHA-256 hashed, never stored in plaintext" />
          <Item icon={<Icon.fingerprint size={20} />} tint="t-purple" title="Biometric unlock" sub="Secondary method · simulated Face ID / fingerprint" />
          <Item icon={<Icon.key size={20} />} tint="t-green" title="Encryption" sub="AES-256-GCM · tamper detection via auth tag" />
        </div>
      </div>

      {/* ---------- Tag & platform ---------- */}
      <div className="section-title"><h2>Tag &amp; platform</h2></div>
      <div className="card">
        <div className="rows">
          <Item icon={<Icon.nfc size={20} />} tint="t-blue" title="Platform" sub={`${PLATFORM_LABEL} · ${CAN_WRITE_TAG ? "read + write (NTAG215)" : "read-only (NDEF fallback)"}`} />
          <Item icon={<Icon.wifi size={20} />} tint={webNfcAvailable() ? "t-green" : "t-amber"} title="Web NFC" sub={webNfcAvailable() ? "Available — real taps supported" : "Not available — using simulated tag"} />
          <Item icon={<Icon.shield size={20} />} tint={tagIsSetUp() ? "t-green" : "t-amber"} title="Simulated tag" sub={tagIsSetUp() ? "Contains a written payload" : "Empty — write a profile to populate"} />
        </div>
      </div>

      {/* ---------- Demo controls ---------- */}
      <div className="section-title"><h2>Demo controls</h2></div>
      <div className="stack">
        <button className="btn btn-secondary" onClick={loadDemo}><Icon.sparkle size={18} /> Load demo profile</button>
        <button className="btn btn-secondary" onClick={clearTag}><Icon.nfc size={18} /> Wipe simulated tag</button>
        <button className="btn btn-ghost" style={{ color: "var(--accent-coral)" }} onClick={clearProfile}>Clear profile</button>
        <button className="btn btn-ghost" onClick={() => setUnlocked(false)}><Icon.lock size={18} /> Lock app</button>
      </div>

      <div style={{ height: 16 }} />
      <Banner kind="blue" title="About this build" icon={<Icon.info size={20} />}>
        Patient-Tap {PLATFORM_LABEL} — a Next.js build of PRD v2.0. {isLive ? "Connected to the live backend." : "Running in demo mode — add backend keys to go live."} Encryption, backup, billing, sharing and alerts are wired end-to-end.
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

function ToggleRow({
  icon, tint, title, sub, on, onChange,
}: {
  icon: React.ReactNode; tint: string; title: string; sub: string; on: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="row">
      <span className={`row-icon ${tint}`}>{icon}</span>
      <span className="row-main"><span className="row-title">{title}</span><span className="row-sub" style={{ whiteSpace: "normal" }}>{sub}</span></span>
      <span className="row-right"><Switch on={on} onChange={onChange} /></span>
    </div>
  );
}
