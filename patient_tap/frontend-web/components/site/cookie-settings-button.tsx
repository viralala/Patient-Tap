"use client";

import { Button } from "@/components/ui/button";
import { openConsentSettings } from "@/lib/consent";

export function CookieSettingsButton() {
  return (
    <Button onClick={openConsentSettings} glyph="→">
      Open cookie settings
    </Button>
  );
}
