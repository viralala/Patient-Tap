"use client";

import { useRef, useState } from "react";
import { FieldLabel, FormStatus, Honeypot, SubmitButton, inputClass } from "@/components/site/form-controls";
import { REPORT_REASONS, REPORT_REASON_LABELS, postJson, type ReportReason } from "@/lib/forms";
import type { PackCode } from "@/lib/medverify/gs1";

export function ReportForm({ parsed }: { parsed: Partial<PackCode> }) {
  const startedAt = useRef(Date.now());
  const [reason, setReason] = useState<ReportReason>("suspected_fake");
  const [details, setDetails] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const res = await postJson("/api/medverify/report", {
      gtin: parsed.gtin,
      batch: parsed.batch,
      serial: parsed.serial,
      code: parsed.raw,
      reason,
      details: details || undefined,
      city: city || undefined,
      website,
      elapsedMs: Date.now() - startedAt.current,
    });
    if (res.ok) setStatus("done");
    else {
      setStatus("error");
      setError(res.error);
    }
  };

  if (status === "done") {
    return (
      <div className="rounded-[22px] border border-signal/30 bg-signal/[0.06] p-5 text-sm text-white/75">
        <p className="font-medium text-white">Thanks — your report is in.</p>
        <p className="mt-1">
          For official action, also tell your State Drug Controller or the{" "}
          <a href="https://cdsco.gov.in" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            CDSCO
          </a>
          . Keep the pack and your bill.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="relative space-y-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-5">
      <p className="font-medium">Report this medicine</p>
      <p className="-mt-2 text-sm text-white/50">
        Anonymous. We store the pack code, your answers and a hashed network address — nothing else.
      </p>
      <FieldLabel label="What's wrong?">
        {(id) => (
          <select id={id} value={reason} onChange={(e) => setReason(e.target.value as ReportReason)} className={inputClass}>
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r} className="bg-[#141417]">
                {REPORT_REASON_LABELS[r]}
              </option>
            ))}
          </select>
        )}
      </FieldLabel>
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <FieldLabel label="Details" optional>
          {(id) => (
            <input
              id={id}
              maxLength={2000}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Where you bought it, what looked off…"
              className={inputClass}
            />
          )}
        </FieldLabel>
        <FieldLabel label="City" optional>
          {(id) => <input id={id} maxLength={80} value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />}
        </FieldLabel>
      </div>
      <p className="text-xs text-white/40">Please don&apos;t include names, phone numbers or health details.</p>
      <Honeypot value={website} onChange={setWebsite} />
      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton sending={status === "sending"}>Send report</SubmitButton>
        <FormStatus status={status} error={error} success="" />
      </div>
    </form>
  );
}
