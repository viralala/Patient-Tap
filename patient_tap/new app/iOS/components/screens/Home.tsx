"use client";
import React, { useMemo, useState } from "react";
import { Icon } from "../ui/Icons";
import { Ring, Segmented } from "../ui/Widgets";
import { useApp } from "../AppContext";
import { tagIsSetUp } from "@/lib/tag";
import { CAN_WRITE_TAG, PLATFORM_LABEL } from "@/lib/platform";

export function Home() {
  const { profile, setTab, setRoute } = useApp();
  const [range, setRange] = useState<"today" | "week" | "month">("week");
  const synced = typeof window !== "undefined" ? tagIsSetUp() : false;

  const adherence = useMemo(() => {
    // Demo adherence: color arcs per medication, one segment each.
    const palette = ["var(--accent-purple)", "var(--accent-coral)", "var(--accent-amber)", "var(--accent-green)", "var(--accent-blue)"];
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
      {/* Top bar — avatar + search + bell (§9.5) */}
      <div className="topbar">
        <div className="avatar">{initials}</div>
        <div className="searchpill">
          <Icon.search size={18} />
          <input placeholder="Find a field…" />
        </div>
        <button className="icon-btn" onClick={() => setTab("reminders")}>
          <Icon.bell size={20} />
          {profile.medications.some((m) => m.reminderEnabled) && <span className="dot" />}
        </button>
      </div>

      {/* Hero — My Profile status card */}
      <div className="hero">
        <div className="hero-sheen" />
        <div className="row-flex">
          <span className="headline">My Profile</span>
          <span className="badge t-blue">{PLATFORM_LABEL} · {CAN_WRITE_TAG ? "Read + Write" : "Read only"}</span>
        </div>
        <div className="display" style={{ margin: "18px 0 2px" }}>{profile.name || "Set up profile"}</div>
        <div className="row-flex" style={{ marginTop: 10 }}>
          <div className="caption">
            Blood type <b style={{ color: "#fff" }}>{profile.bloodType || "—"}</b> · ID {profile.patientId}
          </div>
          <div className={`badge ${synced ? "t-green" : "t-amber"}`}>
            <Icon.nfc size={14} /> {synced ? "Tag synced" : "Not written"}
          </div>
        </div>
      </div>

      {/* DNR / allergy critical strip */}
      {(profile.dnrFlag || profile.allergies.length > 0) && (
        <div style={{ marginTop: 12 }}>
          {profile.dnrFlag && (
            <div className="banner banner-danger" style={{ marginBottom: 8 }}>
              <span className="banner-icon"><Icon.alert size={20} /></span>
              <div><div className="banner-title">DNR — Do Not Resuscitate</div></div>
            </div>
          )}
          {profile.allergies.length > 0 && (
            <div className="banner banner-danger">
              <span className="banner-icon"><Icon.drop size={20} /></span>
              <div>
                <div className="banner-title">Allergies</div>
                <div className="banner-body">{profile.allergies.join(" · ")}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Two-up cards — Medications / Emergency contacts */}
      <div className="grid-2" style={{ marginTop: 12 }}>
        <button className="card-alt" style={{ textAlign: "left" }} onClick={() => setTab("reminders")}>
          <Icon.pill size={22} color="var(--accent-purple)" />
          <div className="headline" style={{ marginTop: 10 }}>{profile.medications.length}</div>
          <div className="caption">Medications</div>
        </button>
        <button className="card-alt" style={{ textAlign: "left" }} onClick={() => setRoute("profile-edit")}>
          <Icon.contact size={22} color="var(--accent-blue)" />
          <div className="headline" style={{ marginTop: 10 }}>{profile.emergencyContacts.length}</div>
          <div className="caption">Emergency contacts</div>
        </button>
      </div>

      {/* Adherence ring */}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="row-flex" style={{ marginBottom: 8 }}>
          <span className="headline">Medication adherence</span>
        </div>
        <div style={{ display: "grid", placeItems: "center", padding: "6px 0 14px" }}>
          <Ring segments={adherence} centerLabel="This week" centerValue={profile.medications.length ? "92%" : "—"} />
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
        <QuickRow icon={<Icon.doc size={20} />} tint="t-amber" title="Scan document" sub="Auto-fill from a prescription or report" onClick={() => setRoute("scan-doc")} />
        <QuickRow icon={<Icon.edit size={20} />} tint="t-purple" title="Edit profile" sub="Name, blood type, allergies, meds" onClick={() => setRoute("profile-edit")} />
        <QuickRow icon={<Icon.nfc size={20} />} tint="t-green" title="Write to tag" sub={CAN_WRITE_TAG ? "Choose what to store on your wristband" : "iOS reads only — write on Android"} onClick={() => setRoute("write-tag")} />
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
