"use client";

import { useState } from "react";
import { Nfc, ClipboardPlus, ScanLine } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { LogEntry } from "@/lib/models";
import {
  encryptProfile,
  appendLogEntry,
  writeToTag,
  tagWriteErrorMessage,
} from "@/lib/services";
import { useToast } from "@/components/app/ui/toast";
import { Screen, ScreenHeader, Card, SectionLabel } from "@/components/app/ui/screen";
import { Field, TextInput, TextArea } from "@/components/app/ui/field";
import { ActionButton } from "@/components/app/ui/action-button";

const QUICK = [
  "Administered 10mg morphine IV.",
  "Vitals recorded: BP 120/80, HR 88, SpO2 98%.",
  "Applied pressure dressing.",
];

export function AddLogEntry({
  onSaved,
  onGoScan,
}: {
  onSaved: () => void;
  onGoScan: () => void;
}) {
  const profile = useAppStore((s) => s.scanned?.profile ?? null);
  const appendScannedLog = useAppStore((s) => s.appendScannedLog);
  const push = useToast((s) => s.push);

  const [responderId, setResponderId] = useState("PARAMEDIC-4471");
  const [action, setAction] = useState("");
  const [writing, setWriting] = useState(false);

  if (!profile) {
    return (
      <Screen className="flex flex-col">
        <ScreenHeader eyebrow="Responder" title="Add entry" />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-paper-sunk text-ink/40">
            <ScanLine className="h-9 w-9" />
          </div>
          <h2 className="mt-5 font-display text-lg font-semibold text-ink">No record loaded</h2>
          <p className="mt-2 max-w-xs text-sm text-ink/55">
            Scan a patient&apos;s wristband before adding a treatment entry.
          </p>
          <div className="mt-6 w-full max-w-xs">
            <ActionButton onClick={onGoScan} icon={Nfc}>
              Go to scan
            </ActionButton>
          </div>
        </div>
      </Screen>
    );
  }

  const save = async () => {
    if (!action.trim()) {
      push("Describe the action taken.", "error");
      return;
    }
    setWriting(true);
    const entry: LogEntry = {
      timestamp: new Date(),
      responderId: responderId.trim() || "UNKNOWN",
      action: action.trim(),
    };
    const bytes = await encryptProfile(profile);
    const updated = await appendLogEntry(bytes, entry);
    const res = await writeToTag(updated);
    setWriting(false);
    if (res.ok) {
      appendScannedLog(entry);
      push("Entry written to tag.", "success");
      onSaved();
    } else {
      push(res.error ? tagWriteErrorMessage(res.error) : "Write failed.", "error");
    }
  };

  return (
    <Screen>
      <ScreenHeader eyebrow="Responder" title="Add entry" />

      <Card className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-ink">{profile.name}</p>
          <p className="font-mono text-xs text-ink/45">{profile.patientId}</p>
        </div>
        <span className="font-mono text-[11px] text-ink/40">
          {profile.treatmentLog.length} entries
        </span>
      </Card>

      <div className="space-y-4">
        <Card className="space-y-4">
          <Field label="Responder ID">
            <TextInput
              value={responderId}
              onChange={(e) => setResponderId(e.target.value)}
              placeholder="e.g. PARAMEDIC-4471"
            />
          </Field>
          <Field label="Action taken" hint="Appended to the tamper-evident chain and re-written to the tag.">
            <TextArea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              rows={3}
              placeholder="Describe the treatment administered…"
            />
          </Field>
        </Card>

        <div>
          <SectionLabel>Quick insert</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAction(q)}
                className="rounded-pill border border-paper-line bg-paper-card px-3 py-1.5 text-xs text-ink/60 transition-colors hover:border-royal-300 hover:text-royal-700"
              >
                {q.length > 34 ? `${q.slice(0, 34)}…` : q}
              </button>
            ))}
          </div>
        </div>

        <ActionButton onClick={save} disabled={writing} icon={Nfc}>
          {writing ? "Re-writing tag…" : "Save & re-write tag"}
        </ActionButton>
      </div>
    </Screen>
  );
}
