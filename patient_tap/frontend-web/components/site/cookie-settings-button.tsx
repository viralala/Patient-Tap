"use client";

import { Cookie } from "lucide-react";
import { openConsentSettings } from "@/lib/consent";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openConsentSettings}
      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-black transition-transform hover:scale-[1.03]"
    >
      <Cookie className="h-4 w-4" /> Open cookie settings
    </button>
  );
}
