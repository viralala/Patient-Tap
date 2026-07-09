"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Pill, UserPlus } from "lucide-react";
import { BLOOD_TYPES, type PatientProfile } from "@/lib/models";
import { useAppStore } from "@/lib/store";
import { useToast } from "@/components/app/ui/toast";
import { Screen, ScreenHeader, Card, SectionLabel } from "@/components/app/ui/screen";
import { Field, TextInput, SelectInput } from "@/components/app/ui/field";
import { ChipInput } from "@/components/app/ui/chip-input";
import { DnrToggle } from "@/components/app/ui/dnr-toggle";
import { ActionButton } from "@/components/app/ui/action-button";

const MAX_CONTACTS = 3;

export function ProfileForm({ onSaved }: { onSaved: () => void }) {
  const stored = useAppStore((s) => s.ownerProfile);
  const setOwnerProfile = useAppStore((s) => s.setOwnerProfile);
  const push = useToast((s) => s.push);

  const [draft, setDraft] = useState<PatientProfile>(stored);
  const patch = (p: Partial<PatientProfile>) => setDraft((d) => ({ ...d, ...p }));

  const save = () => {
    if (!draft.name.trim()) {
      push("Add a name before saving.", "error");
      return;
    }
    setOwnerProfile({ ...draft, updatedAt: new Date() });
    push("Record saved.", "success");
    onSaved();
  };

  return (
    <Screen>
      <ScreenHeader eyebrow="Patient" title="Edit record" />

      <div className="space-y-4">
        <Card className="space-y-4">
          <Field label="Full name">
            <TextInput
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              placeholder="e.g. Alex Harmozi"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Patient ID">
              <TextInput
                value={draft.patientId}
                onChange={(e) => patch({ patientId: e.target.value })}
                placeholder="PT-0000"
              />
            </Field>
            <Field label="Blood type">
              <SelectInput
                value={draft.bloodType}
                onChange={(e) => patch({ bloodType: e.target.value as PatientProfile["bloodType"] })}
              >
                {BLOOD_TYPES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </SelectInput>
            </Field>
          </div>
        </Card>

        <Card>
          <SectionLabel>Allergies</SectionLabel>
          <ChipInput
            values={draft.allergies}
            onChange={(allergies) => patch({ allergies })}
            placeholder="Add an allergy"
            tone="critical"
          />
        </Card>

        {/* medications */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel>Medications</SectionLabel>
            <button
              type="button"
              onClick={() =>
                patch({ medications: [...draft.medications, { name: "", dose: "", frequency: "" }] })
              }
              className="inline-flex items-center gap-1 rounded-pill bg-royal-50 px-3 py-1.5 text-xs font-medium text-royal-700"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
          <div className="space-y-3">
            {draft.medications.length === 0 && (
              <p className="text-sm text-ink/40">No medications yet.</p>
            )}
            {draft.medications.map((m, i) => (
              <div key={i} className="rounded-2xl border border-paper-line bg-paper-sunk/40 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink/40">
                    <Pill className="h-3.5 w-3.5" /> Med {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      patch({ medications: draft.medications.filter((_, idx) => idx !== i) })
                    }
                    className="text-ink/30 transition-colors hover:text-critical"
                    aria-label="Remove medication"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <TextInput
                    value={m.name}
                    placeholder="Name"
                    onChange={(e) => {
                      const meds = [...draft.medications];
                      meds[i] = { ...m, name: e.target.value };
                      patch({ medications: meds });
                    }}
                  />
                  <TextInput
                    value={m.dose}
                    placeholder="Dose"
                    onChange={(e) => {
                      const meds = [...draft.medications];
                      meds[i] = { ...m, dose: e.target.value };
                      patch({ medications: meds });
                    }}
                  />
                  <TextInput
                    value={m.frequency}
                    placeholder="Frequency"
                    onChange={(e) => {
                      const meds = [...draft.medications];
                      meds[i] = { ...m, frequency: e.target.value };
                      patch({ medications: meds });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* DNR */}
        <Card>
          <SectionLabel>Life-safety</SectionLabel>
          <DnrToggle value={draft.dnr} onChange={(dnr) => patch({ dnr })} />
        </Card>

        {/* contacts */}
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <SectionLabel>Emergency contacts</SectionLabel>
            <button
              type="button"
              disabled={draft.emergencyContacts.length >= MAX_CONTACTS}
              onClick={() =>
                patch({
                  emergencyContacts: [
                    ...draft.emergencyContacts,
                    { name: "", phone: "", relation: "" },
                  ],
                })
              }
              className="inline-flex items-center gap-1 rounded-pill bg-royal-50 px-3 py-1.5 text-xs font-medium text-royal-700 disabled:opacity-40"
            >
              <UserPlus className="h-3.5 w-3.5" /> Add
            </button>
          </div>
          <p className="mb-3 text-xs text-ink/40">Up to {MAX_CONTACTS} contacts.</p>
          <div className="space-y-3">
            {draft.emergencyContacts.map((c, i) => (
              <div key={i} className="rounded-2xl border border-paper-line bg-paper-sunk/40 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] text-ink/40">Contact {i + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      patch({
                        emergencyContacts: draft.emergencyContacts.filter((_, idx) => idx !== i),
                      })
                    }
                    className="text-ink/30 transition-colors hover:text-critical"
                    aria-label="Remove contact"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <TextInput
                    value={c.name}
                    placeholder="Name"
                    onChange={(e) => {
                      const cs = [...draft.emergencyContacts];
                      cs[i] = { ...c, name: e.target.value };
                      patch({ emergencyContacts: cs });
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <TextInput
                      value={c.phone}
                      placeholder="Phone"
                      onChange={(e) => {
                        const cs = [...draft.emergencyContacts];
                        cs[i] = { ...c, phone: e.target.value };
                        patch({ emergencyContacts: cs });
                      }}
                    />
                    <TextInput
                      value={c.relation}
                      placeholder="Relation"
                      onChange={(e) => {
                        const cs = [...draft.emergencyContacts];
                        cs[i] = { ...c, relation: e.target.value };
                        patch({ emergencyContacts: cs });
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <ActionButton onClick={save} icon={Save}>
          Save record
        </ActionButton>
      </div>
    </Screen>
  );
}
