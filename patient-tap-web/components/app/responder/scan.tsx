"use client";

import { useState } from "react";
import { Nfc, ShieldAlert, SearchX, RotateCcw } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { readFromTag, decryptProfile } from "@/lib/services";
import { Screen, ScreenHeader } from "@/components/app/ui/screen";
import { PulsingRing } from "@/components/app/ui/pulsing-ring";
import { ActionButton } from "@/components/app/ui/action-button";
import { DecryptedProfile } from "./decrypted-profile";

type Status = "idle" | "scanning" | "notag" | "tampered";

export function ResponderScan({
  onAddLog,
  onViewLog,
}: {
  onAddLog: () => void;
  onViewLog: () => void;
}) {
  const scanned = useAppStore((s) => s.scanned);
  const setScanned = useAppStore((s) => s.setScanned);
  const [status, setStatus] = useState<Status>("idle");

  const scan = async () => {
    setStatus("scanning");
    const bytes = await readFromTag();
    if (!bytes) {
      setStatus("notag");
      return;
    }
    const res = await decryptProfile(bytes);
    if (!res.profile || res.tampered) {
      setStatus("tampered");
      return;
    }
    setScanned(res);
    setStatus("idle");
  };

  // Decrypted record view once a valid tag is in hand.
  if (scanned?.profile) {
    return (
      <DecryptedProfile
        onAddLog={onAddLog}
        onViewLog={onViewLog}
        onRescan={() => {
          setScanned(null);
          setStatus("idle");
        }}
      />
    );
  }

  const scanning = status === "scanning";

  return (
    <Screen className="flex flex-col">
      <ScreenHeader eyebrow="Responder" title="Scan a tag" />

      <div className="flex flex-1 flex-col items-center justify-center pb-6 text-center">
        {status === "tampered" ? (
          <>
            <PulsingRing icon={ShieldAlert} active={false} tone="critical" />
            <h2 className="mt-6 font-display text-xl font-semibold text-ink">
              Verification failed
            </h2>
            <p className="mt-2 max-w-xs text-sm text-ink/55">
              The AES-256-GCM auth tag did not match — this record was corrupted
              or tampered with. Do not trust its contents.
            </p>
          </>
        ) : status === "notag" ? (
          <>
            <PulsingRing icon={SearchX} active={false} />
            <h2 className="mt-6 font-display text-xl font-semibold text-ink">No tag detected</h2>
            <p className="mt-2 max-w-xs text-sm text-ink/55">
              Move the phone closer to the wristband and hold still.
            </p>
          </>
        ) : (
          <>
            <PulsingRing icon={Nfc} active />
            <h2 className="mt-6 font-display text-xl font-semibold text-ink">
              {scanning ? "Reading tag…" : "Hold near a wristband"}
            </h2>
            <p className="mt-2 max-w-xs text-sm text-ink/55">
              {scanning
                ? "Decrypting the record on the NTAG215."
                : "Tap to read and decrypt the patient's record — no network required."}
            </p>
          </>
        )}
      </div>

      <div>
        {status === "idle" && (
          <ActionButton onClick={scan} icon={Nfc}>
            Scan tag
          </ActionButton>
        )}
        {scanning && (
          <ActionButton disabled variant="ghost">
            Scanning…
          </ActionButton>
        )}
        {(status === "notag" || status === "tampered") && (
          <ActionButton
            onClick={scan}
            variant={status === "tampered" ? "critical" : "primary"}
            icon={RotateCcw}
          >
            Scan again
          </ActionButton>
        )}
      </div>
    </Screen>
  );
}
