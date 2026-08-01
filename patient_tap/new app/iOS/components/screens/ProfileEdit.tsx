"use client";
import React, { useState } from "react";
import { Icon } from "../ui/Icons";
import { NavHeader, Switch, Sheet } from "../ui/Widgets";
import { useApp } from "../AppContext";
import { MedEntry, ContactRef, PatientProfile } from "@/lib/types";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// F1 — manual profile creation/edit.
export function ProfileEdit() {
  const { profile, setProfile, setRoute, showToast } = useApp();
  const [draft, setDraft] = useState<PatientProfile>(() => structuredClone(profile));
  const [allergyInput, setAllergyInput] = useState("");
  const [medSheet, setMedSheet] = useState<{ index: number | null } | null>(null);
  const [contactSheet, setContactSheet] = useState<{ index: number | null } | null>(null);

  const set = (patch: Partial<PatientProfile>) => setDraft((d) => ({ ...d, ...patch }));

  const addAllergy = () => {
    const v = allergyInput.trim();
    if (!v) return;
    if (!draft.allergies.includes(v)) set({ allergies: [...draft.allergies, v] });
    setAllergyInput("");
  };

  const save = () => {
    setProfile(draft);
    showToast("Profile saved", <Icon.check size={16} color="var(--accent-green)" />);
    setRoute(null);
  };

  return (
    <>
      <NavHeader
        title="Edit profile"
        onBack={() => setRoute(null)}
        right={<button className="link" onClick={save}>Save</button>}
      />
      <div className="screen" style={{ paddingTop: 8 }}>
        <div className="field">
          <label>Full name</label>
          <input className="input" value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Aarav Mehta" />
        </div>

        <div className="field">
          <label>Blood type</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {BLOOD_TYPES.map((bt) => (
              <button
                key={bt}
                className="chip"
                style={{
                  background: draft.bloodType === bt ? "var(--accent-coral)" : "var(--surface-alt)",
                  color: draft.bloodType === bt ? "#fff" : "var(--text-primary)",
                }}
                onClick={() => set({ bloodType: bt })}
              >
                {bt}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Allergies</label>
          <div className="chip-input-row">
            <input
              className="input"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addAllergy()}
              placeholder="Add an allergy…"
            />
            <button className="btn btn-secondary btn-sm" onClick={addAllergy}><Icon.plus size={18} /></button>
          </div>
          <div style={{ marginTop: 10 }}>
            {draft.allergies.map((a) => (
              <span key={a} className="chip" style={{ background: "rgba(255,98,89,0.16)", color: "var(--accent-coral)" }}>
                {a}
                <button onClick={() => set({ allergies: draft.allergies.filter((x) => x !== a) })}><Icon.x size={14} /></button>
              </span>
            ))}
            {draft.allergies.length === 0 && <span className="caption muted-2">No known allergies</span>}
          </div>
        </div>

        {/* DNR */}
        <div className="card-alt row-flex" style={{ marginBottom: 14 }}>
          <div>
            <div className="row-title">DNR — Do Not Resuscitate</div>
            <div className="row-sub">Shown as a critical flag to responders</div>
          </div>
          <Switch on={draft.dnrFlag} onChange={(v) => set({ dnrFlag: v })} />
        </div>

        {/* Medications */}
        <div className="section-title">
          <h2>Medications</h2>
          <button className="pill-cta" onClick={() => setMedSheet({ index: null })}><Icon.plus size={16} /> Add</button>
        </div>
        <div className="card">
          <div className="rows">
            {draft.medications.map((m, i) => (
              <div key={i} className="row" onClick={() => setMedSheet({ index: i })} style={{ cursor: "pointer" }}>
                <span className="row-icon t-purple"><Icon.pill size={20} /></span>
                <span className="row-main">
                  <span className="row-title">{m.name}</span>
                  <span className="row-sub">{m.dose} · {m.frequency}</span>
                </span>
                <Icon.chevronRight size={18} color="var(--text-muted)" />
              </div>
            ))}
            {draft.medications.length === 0 && <div className="caption muted-2" style={{ padding: "6px 2px" }}>No medications added</div>}
          </div>
        </div>

        {/* Emergency contacts */}
        <div className="section-title">
          <h2>Emergency contacts</h2>
          {draft.emergencyContacts.length < 3 && (
            <button className="pill-cta" onClick={() => setContactSheet({ index: null })}><Icon.plus size={16} /> Add</button>
          )}
        </div>
        <div className="card">
          <div className="rows">
            {draft.emergencyContacts.map((c, i) => (
              <div key={i} className="row" onClick={() => setContactSheet({ index: i })} style={{ cursor: "pointer" }}>
                <span className="row-icon t-blue"><Icon.contact size={20} /></span>
                <span className="row-main">
                  <span className="row-title">{c.name}{i === 0 && <span className="badge t-blue" style={{ marginLeft: 8 }}>Primary</span>}</span>
                  <span className="row-sub">{c.phone}</span>
                </span>
                <Icon.chevronRight size={18} color="var(--text-muted)" />
              </div>
            ))}
            {draft.emergencyContacts.length === 0 && <div className="caption muted-2" style={{ padding: "6px 2px" }}>Add up to 3 contacts</div>}
          </div>
        </div>

        <div style={{ height: 16 }} />
        <button className="btn btn-primary" onClick={save}>Save profile</button>
        <div style={{ height: 20 }} />
      </div>

      {medSheet && (
        <MedSheet
          med={medSheet.index !== null ? draft.medications[medSheet.index] : undefined}
          onClose={() => setMedSheet(null)}
          onDelete={medSheet.index !== null ? () => {
            set({ medications: draft.medications.filter((_, i) => i !== medSheet.index) });
            setMedSheet(null);
          } : undefined}
          onSave={(m) => {
            if (medSheet.index !== null) {
              const next = [...draft.medications];
              next[medSheet.index] = m;
              set({ medications: next });
            } else {
              set({ medications: [...draft.medications, m] });
            }
            setMedSheet(null);
          }}
        />
      )}

      {contactSheet && (
        <ContactSheet
          contact={contactSheet.index !== null ? draft.emergencyContacts[contactSheet.index] : undefined}
          onClose={() => setContactSheet(null)}
          onDelete={contactSheet.index !== null ? () => {
            set({ emergencyContacts: draft.emergencyContacts.filter((_, i) => i !== contactSheet.index) });
            setContactSheet(null);
          } : undefined}
          onSave={(c) => {
            if (contactSheet.index !== null) {
              const next = [...draft.emergencyContacts];
              next[contactSheet.index] = c;
              set({ emergencyContacts: next });
            } else {
              set({ emergencyContacts: [...draft.emergencyContacts, c] });
            }
            setContactSheet(null);
          }}
        />
      )}
    </>
  );
}

function MedSheet({
  med,
  onClose,
  onSave,
  onDelete,
}: {
  med?: MedEntry;
  onClose: () => void;
  onSave: (m: MedEntry) => void;
  onDelete?: () => void;
}) {
  const [m, setM] = useState<MedEntry>(med ?? { name: "", dose: "", frequency: "", reminderTime: "09:00", reminderEnabled: false });
  return (
    <Sheet open onClose={onClose} title={med ? "Edit medication" : "Add medication"}>
      <div className="field"><label>Name</label><input className="input" value={m.name} onChange={(e) => setM({ ...m, name: e.target.value })} placeholder="e.g. Metformin" /></div>
      <div className="grid-2">
        <div className="field"><label>Dose</label><input className="input" value={m.dose} onChange={(e) => setM({ ...m, dose: e.target.value })} placeholder="500mg" /></div>
        <div className="field"><label>Frequency</label><input className="input" value={m.frequency} onChange={(e) => setM({ ...m, frequency: e.target.value })} placeholder="Twice daily" /></div>
      </div>
      <div className="card-alt row-flex" style={{ marginBottom: 12 }}>
        <div><div className="row-title">Reminder</div><div className="row-sub">Local notification, offline</div></div>
        <Switch on={!!m.reminderEnabled} onChange={(v) => setM({ ...m, reminderEnabled: v })} />
      </div>
      {m.reminderEnabled && (
        <div className="field"><label>Reminder time</label><input className="input" type="time" value={m.reminderTime} onChange={(e) => setM({ ...m, reminderTime: e.target.value })} /></div>
      )}
      <button className="btn btn-primary" disabled={!m.name.trim()} onClick={() => onSave(m)}>{med ? "Save" : "Add medication"}</button>
      {onDelete && <button className="btn btn-ghost" style={{ color: "var(--accent-coral)", marginTop: 8 }} onClick={onDelete}>Delete</button>}
    </Sheet>
  );
}

function ContactSheet({
  contact,
  onClose,
  onSave,
  onDelete,
}: {
  contact?: ContactRef;
  onClose: () => void;
  onSave: (c: ContactRef) => void;
  onDelete?: () => void;
}) {
  const [c, setC] = useState<ContactRef>(contact ?? { name: "", phone: "" });
  return (
    <Sheet open onClose={onClose} title={contact ? "Edit contact" : "Add contact"}>
      <div className="field"><label>Name</label><input className="input" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} placeholder="e.g. Priya Mehta" /></div>
      <div className="field"><label>Phone</label><input className="input" type="tel" value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} placeholder="+91 …" /></div>
      <button className="btn btn-primary" disabled={!c.name.trim() || !c.phone.trim()} onClick={() => onSave(c)}>{contact ? "Save" : "Add contact"}</button>
      {onDelete && <button className="btn btn-ghost" style={{ color: "var(--accent-coral)", marginTop: 8 }} onClick={onDelete}>Delete</button>}
    </Sheet>
  );
}
