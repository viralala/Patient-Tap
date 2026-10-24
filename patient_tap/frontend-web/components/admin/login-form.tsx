"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FieldLabel, inputClass } from "@/components/site/form-controls";

export function LoginForm({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && body.ok) {
        router.replace("/admin");
        router.refresh();
        return;
      }
      setError(body.error ?? "Could not sign in.");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) {
    return (
      <p role="note" className="border-l-4 border-lemon pl-4 text-[15px] leading-relaxed text-bone/75">
        Sign-in is switched off on this deployment until the owner credentials are configured.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <FieldLabel label="Password">
        {(id) => (
          <input
            id={id}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={error ? true : undefined}
            className={inputClass}
          />
        )}
      </FieldLabel>
      {error && (
        <p role="alert" className="text-sm text-lemon">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy || !password} className="self-start">
        {busy ? "Checking" : "Sign in"}
      </Button>
    </form>
  );
}
