"use client";

import { useState } from "react";
import { Nfc, ScrollText, Activity, Stethoscope } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { LogEntry } from "@/lib/models";
import { formatClock, formatDateTime } from "@/lib/utils";
import { Screen, ScreenHeader, Card } from "@/components/app/ui/screen";
import { Segmented } from "@/components/app/ui/segmented";
import { ActionButton } from "@/components/app/ui/action-button";

const isVitals = (e: LogEntry) => /vital|bp|hr|spo2|temp|recorded/i.test(e.action);

export function TreatmentLog({ onGoScan }: { onGoScan: () => void }) {
  const profile = useAppStore((s) => s.scanned?.profile ?? null);
  const [filter, setFilter] = useState("all");

  if (!profile) {
    return (
      <Screen className="flex flex-col">
        <ScreenHeader eyebrow="Responder" title="Treatment log" />
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="grid h-20 w-20 place-items-center rounded-full bg-paper-sunk text-ink/40">
            <ScrollText className="h-9 w-9" />
          </div>
          <h2 className="mt-5 font-display text-lg font-semibold text-ink">Nothing to show</h2>
          <p className="mt-2 max-w-xs text-sm text-ink/55">
            Scan a wristband to load its chain-of-custody log.
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

  const entries = [...profile.treatmentLog].reverse().filter((e) => {
    if (filter === "vitals") return isVitals(e);
    if (filter === "care") return !isVitals(e);
    return true;
  });

  return (
    <Screen>
      <ScreenHeader
        eyebrow="Responder"
        title="Treatment log"
        right={
          <span className="font-mono text-xs text-ink/40 tnum">
            {profile.treatmentLog.length} total
          </span>
        }
      />

      <div className="mb-5">
        <Segmented
          variant="dark"
          value={filter}
          onChange={setFilter}
          options={[
            { key: "all", label: "All" },
            { key: "care", label: "Care" },
            { key: "vitals", label: "Vitals" },
          ]}
        />
      </div>

      {entries.length === 0 ? (
        <Card className="p-5 text-center text-sm text-ink/45">No entries in this view.</Card>
      ) : (
        <ol className="relative ml-2 space-y-4 border-l border-paper-line pl-6">
          {entries.map((e, i) => (
            <li key={i} className="relative">
              <span
                className={`absolute -left-[31px] top-1 grid h-6 w-6 place-items-center rounded-full ring-4 ring-paper ${
                  isVitals(e) ? "bg-signal/15 text-signal-deep" : "bg-royal-50 text-royal-600"
                }`}
              >
                {isVitals(e) ? <Activity className="h-3.5 w-3.5" /> : <Stethoscope className="h-3.5 w-3.5" />}
              </span>
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-paper-sunk px-2.5 py-1 font-mono text-[11px] text-ink/55">
                    {e.responderId}
                  </span>
                  <span className="font-mono text-[11px] text-ink/40 tnum">{formatClock(e.timestamp)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink/80">{e.action}</p>
                <p className="mt-2 font-mono text-[10px] text-ink/30">{formatDateTime(e.timestamp)}</p>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </Screen>
  );
}
