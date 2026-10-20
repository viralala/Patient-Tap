"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the digest only — never the message, which could contain user input.
    console.error("[page error]", error.digest ?? "no-digest");
  }, [error]);

  return (
    <main id="main" className="flex min-h-screen items-center bg-canvas text-bone">
      <div className="shell text-center">
        <p className="label text-bone/50">Something broke</p>
        <h1 className="display mt-5 text-[clamp(3rem,9vw,7rem)]">This page didn&apos;t load</h1>
        <p className="mx-auto mt-5 max-w-md font-serif text-xl text-bone/65">
          It&apos;s on us, not you. Try again. If this is an emergency, call 112.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} glyph="↺">
            Try again
          </Button>
          <Button href="/" variant="line">
            Home
          </Button>
        </div>
      </div>
    </main>
  );
}
