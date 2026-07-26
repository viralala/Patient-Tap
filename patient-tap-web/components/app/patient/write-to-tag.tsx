"use client";

import { useState } from "react";
import { Nfc, Lock, Check, AlertTriangle, RotateCcw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import {
  encryptProfile,
  writeToTag,
  tagWriteErrorMessage,
  TAG_CAPACITY_BYTES,
  type TagWriteError,
} from "@/lib/services";
import { clamp } from "@/lib/utils";
import { Screen, ScreenHeader } from "@/components/app/ui/screen";
import { PulsingRing } from "@/components/app/ui/pulsing-ring";
import { ActionButton } from "@/components/app/ui/action-button";

type Status = "ready" | "encrypting" | "writing" | "success" | "error";

export function WriteToTag({ onDone }: { onDone: () => void }) {
  const profile = useAppStore((s) => s.ownerProfile);
  const [status, setStatus] = useState<Status>("ready");
  const [bytes, setBytes] = useState(0);
  const [error, setError] = useState<TagWriteError | null>(null);

  const run = async () => {
    setError(null);
    setStatus("encrypting");
    const encoded = await encryptProfile(profile);
    setBytes(encoded.length);
    setStatus("writing");
    const res = await writeToTag(encoded);
    if (res.ok) setStatus("success");
    else {
      setError(res.error);
      setStatus("error");
    }
  };

  const busy = status === "encrypting" || status === "writing";
  const fill = clamp(bytes / TAG_CAPACITY_BYTES, 0, 1);

  return (
    <Screen className="flex flex-col">
      <ScreenHeader eyebrow="Patient" title="Write to tag" />

      <div className="flex flex-1 flex-col items-center justify-center pb-6 text-center">
        {status === "ready" && (
          <>
            <PulsingRing icon={Nfc} active={false} />
            <h2 className="mt-6 font-display text-xl font-semibold text-ink">
              Hold your phone to the wristband
            </h2>
            <p className="mt-2 max-w-xs text-sm text-ink/55">
              Your record is encrypted with AES-256-GCM, then written to the
              NTAG215 in a single tap.
            </p>
          </>
        )}

        {status === "encrypting" && (
          <>
            <PulsingRing icon={Lock} />
            <h2 className="mt-6 font-display text-xl font-semibold text-ink">Encrypting record…</h2>
            <p className="mt-2 font-mono text-sm text-ink/50">protobuf → AES-256-GCM</p>
          </>
        )}

        {status === "writing" && (
          <>
            <PulsingRing icon={Nfc} />
            <h2 className="mt-6 font-display text-xl font-semibold text-ink">
              Writing to tag… hold steady
            </h2>
            <p className="mt-2 font-mono text-sm text-ink/50 tnum">
              {bytes} / {TAG_CAPACITY_BYTES} B
            </p>
            <div className="mt-4 h-1.5 w-56 overflow-hidden rounded-full bg-paper-sunk">
              <div
                className="h-full rounded-full bg-royal-500 transition-[width] duration-700"
                style={{ width: `${Math.round(fill * 100)}%` }}
              />
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="grid h-28 w-28 place-items-center rounded-full bg-signal/15 text-signal-deep">
              <Check className="h-14 w-14" strokeWidth={2.4} />
            </div>
            <h2 className="mt-6 font-display text-xl font-semibold text-ink">Record on the tag</h2>
            <p className="mt-2 max-w-xs text-sm text-ink/55">
              {bytes} bytes written · {TAG_CAPACITY_BYTES - bytes} B free. Any phone
              can now read this wristband offline.
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="grid h-28 w-28 place-items-center rounded-full bg-critical/10 text-critical">
              <AlertTriangle className="h-14 w-14" strokeWidth={2} />
            </div>
            <h2 className="mt-6 font-display text-xl font-semibold text-ink">Write failed</h2>
            <p className="mt-2 max-w-xs text-sm text-ink/55">
              {error ? tagWriteErrorMessage(error) : "Something went wrong."}
            </p>
          </>
        )}
      </div>

      <div className="space-y-3">
        {status === "ready" && (
          <ActionButton onClick={run} icon={Nfc}>
            Encrypt &amp; write
          </ActionButton>
        )}
        {busy && (
          <ActionButton disabled variant="ghost">
            Working…
          </ActionButton>
        )}
        {status === "success" && (
          <>
            <ActionButton onClick={onDone}>Done</ActionButton>
            <ActionButton onClick={() => setStatus("ready")} variant="ghost" icon={RotateCcw}>
              Write again
            </ActionButton>
          </>
        )}
        {status === "error" && (
          <ActionButton onClick={run} variant="critical" icon={RotateCcw}>
            Try again
          </ActionButton>
        )}
      </div>
    </Screen>
  );
}
