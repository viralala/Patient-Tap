"use client";

import { Nfc, Pencil, Droplet, Pill, Users, ShieldAlert, Cloud } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { hasAllergies, medSummary } from "@/lib/models";
import { estimateEncodedBytes, TAG_CAPACITY_BYTES } from "@/lib/services";
import { formatRelative, clamp } from "@/lib/utils";
import { Screen, ScreenHeader, Card, SectionLabel } from "@/components/app/ui/screen";
import { CircularGauge } from "@/components/app/ui/circular-gauge";
import { ActionButton } from "@/components/app/ui/action-button";

export function PatientDashboard({
  onEdit,
  onWrite,
}: {
  onEdit: () => void;
  onWrite: () => void;
}) {
  const profile = useAppStore((s) => s.ownerProfile);
  const used = estimateEncodedBytes(profile);
  const fill = clamp(used / TAG_CAPACITY_BYTES, 0, 1);
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Patient"
        title="Your record"
        right={
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-signal/10 px-3 py-1.5 text-xs font-medium text-signal-deep">
            <Cloud className="h-3.5 w-3.5" /> Pro · synced
          </span>
        }
      />

      {/* identity card */}
      <Card className="relative overflow-hidden">
        <div className="glow-royal absolute inset-0 opacity-[0.06]" />
        <div className="relative flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-royal-500 font-display text-xl font-semibold text-white">
            {initials || "?"}
          </div>
          <div className="min-w-0">
            <p className="truncate font-display text-xl font-semibold tracking-tight text-ink">
              {profile.name || "Unnamed patient"}
            </p>
            <p className="font-mono text-xs text-ink/45">
              {profile.patientId} · updated {profile.updatedAt ? formatRelative(profile.updatedAt) : "—"}
            </p>
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-pill bg-royal-50 px-3 py-1.5 text-sm font-medium text-royal-700">
            <Droplet className="h-3.5 w-3.5" /> {profile.bloodType}
          </span>
          {profile.dnr ? (
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-critical/10 px-3 py-1.5 text-sm font-medium text-critical-deep">
              <ShieldAlert className="h-3.5 w-3.5" /> DNR active
            </span>
          ) : (
            <span className="rounded-pill bg-paper-sunk px-3 py-1.5 text-sm font-medium text-ink/55">
              No DNR
            </span>
          )}
        </div>
      </Card>

      {/* storage gauge */}
      <Card className="mt-4 flex items-center gap-5">
        <CircularGauge value={fill} used={used} total={TAG_CAPACITY_BYTES} size={148} />
        <div className="min-w-0 flex-1">
          <SectionLabel>On-tag storage</SectionLabel>
          <p className="text-sm leading-relaxed text-ink/60">
            {TAG_CAPACITY_BYTES - used} bytes free on the wristband.
          </p>
          <p className="mt-1 font-mono text-[11px] text-ink/40">NTAG215 · 504 B</p>
          <div className="mt-3">
            <ActionButton onClick={onWrite} icon={Nfc}>
              Write to tag
            </ActionButton>
          </div>
        </div>
      </Card>

      {/* stat grid */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatTile icon={ShieldAlert} label="Allergies" value={profile.allergies.length} tone={hasAllergies(profile) ? "critical" : "default"} />
        <StatTile icon={Pill} label="Medications" value={profile.medications.length} />
        <StatTile icon={Users} label="Contacts" value={profile.emergencyContacts.length} />
        <StatTile icon={Droplet} label="Blood type" value={profile.bloodType} />
      </div>

      {/* allergies */}
      <div className="mt-6">
        <SectionLabel>Allergies</SectionLabel>
        {hasAllergies(profile) ? (
          <div className="flex flex-wrap gap-2">
            {profile.allergies.map((a) => (
              <span
                key={a}
                className="rounded-pill bg-critical/10 px-3 py-1.5 text-sm font-medium text-critical-deep"
              >
                {a}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink/45">None recorded.</p>
        )}
      </div>

      {/* medications */}
      <div className="mt-6">
        <SectionLabel>Medications</SectionLabel>
        <div className="space-y-2">
          {profile.medications.length === 0 && (
            <p className="text-sm text-ink/45">None recorded.</p>
          )}
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
          {profile.emergencyContacts.length === 0 && (
            <p className="text-sm text-ink/45">None recorded.</p>
          )}
          {profile.emergencyContacts.map((c, i) => (
            <Card key={i} className="flex items-center justify-between p-3.5">
              <div>
                <p className="text-sm font-medium text-ink">{c.name}</p>
                <p className="text-xs text-ink/45">
                  {c.relation ? `${c.relation} · ` : ""}
                  {c.phone}
                </p>
              </div>
              <Users className="h-4 w-4 text-ink/25" />
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <ActionButton onClick={onEdit} variant="ghost" icon={Pencil}>
          Edit record
        </ActionButton>
      </div>
    </Screen>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Droplet;
  label: string;
  value: string | number;
  tone?: "default" | "critical";
}) {
  return (
    <Card className="p-4">
      <Icon
        className={tone === "critical" ? "h-5 w-5 text-critical" : "h-5 w-5 text-royal-500"}
        strokeWidth={1.8}
      />
      <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink tnum">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-ink/45">{label}</p>
    </Card>
  );
}
