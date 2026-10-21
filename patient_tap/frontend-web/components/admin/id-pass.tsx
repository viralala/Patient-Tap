"use client";

import { QrCode } from "@/components/medverify/qr-code";
import { ContactlessMark } from "@/components/home/nfc-card";
import { cn } from "@/lib/utils";

export interface PassField {
  label: string;
  value: string;
}

/**
 * Flat ID pass in the NFC-card style: bone card, condensed wordmark, a
 * coloured band naming the access level, and a QR code for check-in.
 */
export function IdPass({
  band,
  bandClass = "bg-scarlet text-bone",
  name,
  subtitle,
  passId,
  fields,
  qr,
  className,
}: {
  band: string;
  bandClass?: string;
  name: string;
  subtitle: string;
  passId: string;
  fields: PassField[];
  qr: string;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <figure
      className={cn(
        "print-pack w-full max-w-[380px] overflow-hidden rounded-[22px] bg-bone text-canvas shadow-[0_30px_60px_-30px_rgba(0,0,0,0.8)]",
        className,
      )}
    >
      <div className="flex items-start justify-between p-6 pb-4">
        <span className="display text-[30px] leading-none">Patient-Tap</span>
        <ContactlessMark className="h-8 w-8 text-cobalt" />
      </div>
      <p className={cn("label px-6 py-2", bandClass)}>{band}</p>

      <div className="flex items-center gap-4 px-6 pt-6">
        <div
          aria-hidden
          className="display grid h-20 w-20 shrink-0 place-items-center rounded-[14px] bg-canvas text-[34px] text-lemon"
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="font-serif text-[26px] leading-tight">{name}</p>
          <p className="mt-1 text-sm text-canvas/60">{subtitle}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-6 pt-6">
        {fields.map((f) => (
          <div key={f.label} className="min-w-0">
            <dt className="label text-[10px] text-canvas/50">{f.label}</dt>
            <dd className="tnum mt-0.5 truncate font-mono text-[13px]">{f.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex items-end justify-between gap-4 border-t border-canvas/10 p-6">
        <div>
          <p className="label text-[10px] text-canvas/50">Pass ID</p>
          <p className="tnum mt-0.5 font-mono text-[15px] font-medium">{passId}</p>
          <p className="mt-3 max-w-[11rem] text-[11px] leading-snug text-canvas/55">
            Non-transferable. Report a lost pass to security@patient-tap.shop.
          </p>
        </div>
        <QrCode value={qr} size={96} fg="#191919" bg="#FBF8F3" label={`Pass code for ${passId}`} />
      </div>
    </figure>
  );
}
