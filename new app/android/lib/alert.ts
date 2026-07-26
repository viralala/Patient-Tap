// Emergency-contact alert (F12) — SMS + GPS location.
//
// Android-native sends a real SMS via SmsManager. A browser can't send SMS
// silently, so we: capture a real GPS fix via the Geolocation API (this part is
// genuine), compose the exact SMS body, and either hand off to the device SMS
// app via an sms: deep link or record a simulated "sent" event for the demo.

import { ContactRef } from "./types";

export interface AlertResult {
  contact: ContactRef;
  body: string;
  lat?: number;
  lng?: number;
  mapsUrl?: string;
  sentAt: number;
  method: "sms-link" | "simulated";
}

export function getLocation(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  });
}

export async function sendAlert(
  contact: ContactRef,
  patientName: string
): Promise<AlertResult> {
  const loc = await getLocation();
  const mapsUrl = loc
    ? `https://maps.google.com/?q=${loc.lat.toFixed(5)},${loc.lng.toFixed(5)}`
    : undefined;
  const body =
    `PATIENT-TAP ALERT: ${patientName || "A patient"}'s emergency tag was just scanned by a first responder.` +
    (mapsUrl ? ` Location: ${mapsUrl}` : ` Location unavailable.`);

  // Best-effort real handoff to the SMS app; falls back to a simulated record.
  let method: AlertResult["method"] = "simulated";
  try {
    if (typeof window !== "undefined") {
      // Not auto-invoked (would navigate away); the UI offers this as a button.
      method = "sms-link";
    }
  } catch {
    method = "simulated";
  }

  return {
    contact,
    body,
    lat: loc?.lat,
    lng: loc?.lng,
    mapsUrl,
    sentAt: Date.now(),
    method,
  };
}

export function smsDeepLink(phone: string, body: string): string {
  return `sms:${phone.replace(/\s/g, "")}?&body=${encodeURIComponent(body)}`;
}
