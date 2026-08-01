"use client";
import React, { useMemo, useState } from "react";
import { Icon } from "../ui/Icons";
import { Ring, Segmented } from "../ui/Widgets";
import { useApp } from "../AppContext";
import { tagIsSetUp } from "@/lib/tag";
import { CAN_WRITE_TAG } from "@/lib/platform";

export function Home() {
  const { profile, setTab, setRoute } = useApp();
  const [range, setRange] = useState<"today" | "week" | "month">("week");
  const synced = typeof window !== "undefined" ? tagIsSetUp() : false;

  const adherence = useMemo(() => {
    // One accent family — depth via shade, not a rainbow.
    const palette = ["#3ec9a7", "#2b9b81", "#7addc4", "#1f7361", "#a9e9d8"];
    const meds = profile.medications.length ? profile.medications : [{ name: "—" } as any];
    return meds.map((m, i) => ({ value: 1, color: palette[i % palette.length], label: m.name }));
  }, [profile.medications]);

  const initials = (profile.name || "Me")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="screen fade-in">
      {/* Top bar — identity + reminders */}
      <div className="topbar">
        <div className="avatar">{initials}</div>
        <div className="brandline">
          <div className="b-name">Patient-Tap</div>
          <div className="b-sub">{CAN_WRITE_TAG ? "NTAG215 · READ/WRITE" : "NDEF · READ ONLY"}</div>
        </div>
        <button className="icon-btn" onClick={() => setTab("reminders")} aria-label="Reminders">
          <Icon.bell size={20} />
          {profile.medications.some((m) => m.reminderEnabled) && <span className="dot" />}
        </button>
      </div>

      {/* Hero — medical ID card */}
      <div className="hero">
        <div className="hero-sheen" />
        <div className="hero-nfc"><Icon.nfc size={130} /></div>
        <div className="row-flex">
          <span className="eyebrow">Medical ID</span>
          <span className={`badge ${synced ? "t-green" : "t-amber"}`}>
            <Icon.nfc size={13} /> {synced ? "tag synced" : "not written"}
          </span>
        </div>
        <div className="display" style={{ margin: "16px 0 4px" }}>{profile.name || "Set up your profile"}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
          <span className="badge t-coral"><Icon.drop size={13} /> {profile.bloodType || "blood —"}</span>
          {profile.dnrFlag && <span className="badge t-coral">DNR</span>}
          <span className="badge" style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}>
            {profile.patientId}
          </span>
        </div>
      </div>

      {/* Critical strip */}
      {profile.allergies.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div className="banner banner-danger">
            <span className="banner-icon"><Icon.drop size={20} /></span>
            <div>
              <div className="banner-title">Allergies</div>
              <div className="banner-body">{profile.allergies.join(" · ")}</div>
            </div>
          </div>
        </div>
      )}

      {/* Two-up stat tiles */}
      <div className="grid-2" style={{ marginTop: 10 }}>
        <button className="card-alt" style={{ textAlign: "left" }} onClick={() => setTab("reminders")}>
          <div className="row-flex">
            <span className="row-icon t-purple" style={{ width: 34, height: 34 }}><Icon.pill size={18} /></span>
            <span className="mono" style={{ fontSize: 22, fontWeight: 600 }}>{profile.medications.length}</span>
          </div>
          <div className="caption" style={{ marginTop: 10 }}>Medications</div>
        </button>
        <button className="card-alt" style={{ textAlign: "left" }} onClick={() => setRoute("profile-edit")}>
          <div className="row-flex">
            <span className="row-icon t-blue" style={{ width: 34, height: 34 }}><Icon.contact size={18} /></span>
            <span className="mono" style={{ fontSize: 22, fontWeight: 600 }}>{profile.emergencyContacts.length}</span>
          </div>
          <div className="caption" style={{ marginTop: 10 }}>Emergency contacts</div>
        </button>
      </div>

      {/* Adherence */}
      <div className="card" style={{ marginTop: 10 }}>
        <div className="row-flex" style={{ marginBottom: 8 }}>
          <span className="headline">Medication adherence</span>
        </div>
        <div style={{ display: "grid", placeItems: "center", padding: "6px 0 14px" }}>
          <Ring segments={adherence} centerLabel="this week" centerValue={profile.medications.length ? "87%" : "—"} />
        </div>
        <Segmented
          value={range}
          onChange={setRange}
          options={[
            { value: "today", label: "Today" },
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
          ]}
        />
      </div>

      {/* Quick actions */}
      <div className="section-title"><h2>Quick actions</h2></div>
      <div className="stack">
        <QuickRow icon={<Icon.doc size={20} />} tint="t-amber" title="Scan a document" sub="Auto-fill from a prescription or report" onClick={() => setRoute("scan-doc")} />
        <QuickRow icon={<Icon.edit size={20} />} tint="t-purple" title="Edit profile" sub="Name, blood type, allergies, medications" onClick={() => setRoute("profile-edit")} />
        <QuickRow icon={<Icon.nfc size={20} />} tint="t-green" title="Write to tag" sub="Choose what to store on the wristband" onClick={() => setRoute("write-tag")} />
        <QuickRow icon={<Icon.stethoscope size={20} />} tint="t-blue" title="Responder mode" sub="Scan a patient tag — no login needed" onClick={() => setTab("responder")} />
      </div>
    </div>
  );
}

function QuickRow({
  icon,
  tint,
  title,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  tint: string;
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button className="card-alt row" style={{ width: "100%", borderBottom: "none" }} onClick={onClick}>
      <span className={`row-icon ${tint}`}>{icon}</span>
      <span className="row-main" style={{ textAlign: "left" }}>
        <span className="row-title">{title}</span>
        <span className="row-sub">{sub}</span>
      </span>
      <Icon.chevronRight size={20} color="var(--text-muted)" />
    </button>
  );
}
