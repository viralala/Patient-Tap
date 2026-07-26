"use client";

import { useState } from "react";
import {
  ShieldCheck,
  HeartPulse,
  Droplet,
  Pill,
  PhoneCall,
  ClipboardPlus,
  ScrollText,
  RotateCcw,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { hasAllergies, medSummary, type ContactRef } from "@/lib/models";
import { sendAlert } from "@/lib/services";
import { demoLocation } from "@/lib/mock-data";
import { formatRelative } from "@/lib/utils";
import { useToast } from "@/components/app/ui/toast";
import { Screen, ScreenHeader, Card, SectionLabel } from "@/components/app/ui/screen";
import { ActionButton } from "@/components/app/ui/action-button";

export function DecryptedProfile({
  onAddLog,
  onViewLog,
  onRescan,
}: {
  onAddLog: () => void;
  onViewLog: () => void;
  onRescan: () => void;
}) {
  const profile = useAppStore((s) => s.scanned?.profile ?? null);
  const push = useToast((s) => s.push);
  const [alerting, setAlerting] = useState<string | null>(null);

  if (!profile) return null;

  const alert = async (c: ContactRef) => {
    setAlerting(c.phone);
    push(`Alerting ${c.name}…`);
    await sendAlert(c, demoLocation());
    setAlerting(null);
    push(`SMS + GPS sent to ${c.name}.`, "success");
  };

  const recent = [...profile.treatmentLog].reverse().slice(0, 2);

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Responder"
        title="Patient record"
        right={
          <button
            onClick={onRescan}
            className="inline-flex items-center gap-1.5 rounded-pill bg-paper-sunk px-3 py-1.5 text-xs font-medium text-ink/60"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Rescan
          </button>
        }
      />

      {/* verified + identity */}
      <Card className="flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-signal/10 px-2.5 py-1 text-xs font-medium text-signal-deep">
            <ShieldCheck className="h-3.5 w-3.5" /> Decrypted · verified
          </span>
          <p className="mt-2 font-display text-xl font-semibold tracking-tight text-ink">
            {profile.name}
          </p>
          <p className="font-mono text-xs text-ink/45">
            {profile.patientId} · updated{" "}
            {profile.updatedAt ? formatRelative(profile.updatedAt) : "—"}
          </p>
        </div>
      </Card>

      {/* DNR banner — loudest element */}
      {profile.dnr && (
        <div className="mt-4 flex items-center gap-3 rounded-card bg-critical px-5 py-4 text-white card-shadow">
          <HeartPulse className="h-6 w-6 shrink-0" strokeWidth={2.2} />
          <div>
            <p className="font-display text-lg font-semibold leading-tight">DNR — Do Not Resuscitate</p>
            <p className="text-xs text-white/80">Directive present on this record.</p>
          </div>
        </div>
      )}

      {/* Allergies */}
      <div className="mt-4">
        <SectionLabel>Allergies</SectionLabel>
        {hasAllergies(profile) ? (
          <div className="flex flex-wrap gap-2">
            {profile.allergies.map((a) => (
              <span
                key={a}
                className="rounded-pill bg-critical/10 px-3.5 py-2 text-sm font-semibold text-critical-deep"
              >
                {a}
              </span>
            ))}
          </div>
        ) : (
          <Card className="p-3.5 text-sm text-ink/45">None recorded.</Card>
        )}
      </div>

      {/* vitals tiles */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-ink/40">
            <Droplet className="h-4 w-4" />
            <span className="font-mono text-[11px] uppercase tracking-wider">Blood</span>
          </div>
          <p className="mt-1 font-display text-3xl font-semibold text-ink tnum">{profile.bloodType}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-ink/40">
            <Pill className="h-4 w-4" />
            <span className="font-mono text-[11px] uppercase tracking-wider">Meds</span>
          </div>
          <p className="mt-1 font-display text-3xl font-semibold text-ink tnum">
            {profile.medications.length}
          </p>
        </Card>
      </div>

      {/* medications */}
      <div className="mt-6">
        <SectionLabel>Medications</SectionLabel>
        <div className="space-y-2">
          {profile.medications.map((m, i) => (
            <Card key={i} className="flex items-center gap-3 p-3.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-royal-50 text-royal-600">
                <Pill className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-medium text-ink">{m.name}</p>
                <p className="font-mono text-xs text-ink/45">{medSummary(m)}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* contacts */}
      <div className="mt-6">
        <SectionLabel>Emergency contacts</SectionLabel>
        <div className="space-y-2">
          {profile.emergencyContacts.map((c, i) => (
            <Card key={i} className="flex items-center justify-between p-3.5">
              <div>
                <p className="text-sm font-medium text-ink">{c.name}</p>
                <p className="text-xs text-ink/45">
                  {c.relation ? `${c.relation} · ` : ""}
                  {c.phone}
                </p>
              </div>
              <button
                onClick={() => alert(c)}
                disabled={alerting === c.phone}
                className="inline-flex items-center gap-1.5 rounded-pill bg-royal-500 px-4 py-2 text-xs font-semibold text-white transition-transform active:scale-95 disabled:opacity-60"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                {alerting === c.phone ? "Sending…" : "Alert"}
              </button>
            </Card>
          ))}
        </div>
      </div>

      {/* recent log */}
      <div className="mt-6">
        <SectionLabel>Recent treatment</SectionLabel>
        {recent.length === 0 ? (
          <Card className="p-3.5 text-sm text-ink/45">No entries yet.</Card>
        ) : (
          <div className="space-y-2">
            {recent.map((e, i) => (
              <Card key={i} className="p-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-royal-600">{e.responderId}</span>
                  <span className="font-mono text-[11px] text-ink/40">{formatRelative(e.timestamp)}</span>
                </div>
                <p className="mt-1 text-sm text-ink/75">{e.action}</p>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <ActionButton onClick={onAddLog} icon={ClipboardPlus}>
          Add entry
        </ActionButton>
        <ActionButton onClick={onViewLog} variant="ghost" icon={ScrollText}>
          Full log
        </ActionButton>
      </div>
    </Screen>
  );
}
