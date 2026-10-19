"use client";

import { useEffect, useRef, useState } from "react";
import { CameraOff, Loader2 } from "lucide-react";

type Controls = { stop: () => void };

/**
 * Live QR / DataMatrix / barcode scanning with ZXing, entirely in the
 * browser. Frames never leave the device; only the decoded text is passed up.
 * ZXing is loaded on demand so it doesn't weigh down the rest of the site.
 */
export function CameraScanner({ onCode, active }: { onCode: (text: string) => void; active: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"starting" | "scanning" | "error">("starting");
  const [error, setError] = useState("");
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;

  useEffect(() => {
    if (!active) return;
    let controls: Controls | null = null;
    let cancelled = false;

    (async () => {
      setState("starting");
      if (!navigator.mediaDevices?.getUserMedia) {
        setState("error");
        setError("This browser can't open the camera. Upload a photo or type the code instead.");
        return;
      }
      try {
        const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
          import("@zxing/browser"),
          import("@zxing/library"),
        ]);
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.QR_CODE,
          BarcodeFormat.DATA_MATRIX,
          BarcodeFormat.EAN_13,
          BarcodeFormat.CODE_128,
        ]);
        hints.set(DecodeHintType.TRY_HARDER, true);
        const reader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 120 });
        if (cancelled || !video.current) return;
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 } } },
          video.current,
          (result, _err, ctl) => {
            if (result) {
              ctl.stop();
              navigator.vibrate?.(40);
              onCodeRef.current(result.getText());
            }
          },
        );
        if (cancelled) controls.stop();
        else setState("scanning");
      } catch (e) {
        const name = (e as { name?: string }).name;
        setState("error");
        setError(
          name === "NotAllowedError"
            ? "Camera permission was blocked. Allow it in your browser settings, or upload a photo instead."
            : name === "NotFoundError"
              ? "No camera found on this device. Upload a photo or type the code instead."
              : "The camera couldn't start. Upload a photo or type the code instead.",
        );
      }
    })();

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [active]);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[22px] bg-black">
      <video ref={video} className="h-full w-full object-cover" muted playsInline aria-label="Camera preview" />

      {state === "scanning" && (
        <>
          {/* viewfinder */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="relative h-[62%] w-[62%] max-w-[300px] rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
              {["left-0 top-0 border-l-2 border-t-2 rounded-tl-3xl", "right-0 top-0 border-r-2 border-t-2 rounded-tr-3xl", "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-3xl", "right-0 bottom-0 border-r-2 border-b-2 rounded-br-3xl"].map((c) => (
                <span key={c} className={`absolute h-8 w-8 border-signal ${c}`} />
              ))}
              <span className="scan-sweep absolute inset-x-3 top-2 h-0.5 bg-signal shadow-[0_0_16px_3px_rgba(18,197,139,0.6)] [--sweep:calc(100%-1rem)]" />
            </div>
          </div>
          <p className="absolute inset-x-0 bottom-4 text-center text-sm text-white/80">
            Point at the QR code on the strip or box
          </p>
        </>
      )}

      {state === "starting" && (
        <div className="absolute inset-0 grid place-items-center text-white/70">
          <span className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" /> Starting camera…
          </span>
        </div>
      )}

      {state === "error" && (
        <div className="absolute inset-0 grid place-items-center p-8 text-center">
          <div>
            <CameraOff className="mx-auto h-8 w-8 text-white/50" />
            <p className="mt-3 max-w-xs text-sm text-white/70">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/** Decode a code from a still photo (also fully on-device). */
export async function decodeImageFile(file: File): Promise<string | null> {
  const [{ BrowserMultiFormatReader }, { DecodeHintType }] = await Promise.all([
    import("@zxing/browser"),
    import("@zxing/library"),
  ]);
  const hints = new Map();
  hints.set(DecodeHintType.TRY_HARDER, true);
  const reader = new BrowserMultiFormatReader(hints);
  const url = URL.createObjectURL(file);
  try {
    const result = await reader.decodeFromImageUrl(url);
    return result.getText();
  } catch {
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
