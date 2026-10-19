"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the digest only — never the message, which could contain user input.
    console.error("[page error]", error.digest ?? "no-digest");
  }, [error]);

  return (
    <main id="main" className="flex min-h-screen items-center bg-void text-white">
      <div className="shell text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">Something broke</p>
        <h1 className="mt-5 font-sans text-[clamp(2rem,6vw,4rem)] font-bold leading-tight tracking-tight">
          We couldn&apos;t load this page.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-white/55">
          It&apos;s on us, not you. Try again — and if this is an emergency, call 112.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={reset} className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black">
            Try again
          </button>
          <Link href="/" className="rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
