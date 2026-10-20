"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Checkbox,
  FieldLabel,
  FormStatus,
  Honeypot,
  SubmitButton,
  inputClass,
} from "@/components/site/form-controls";
import {
  WAITLIST_INTERESTS,
  WAITLIST_INTEREST_LABELS,
  postJson,
  type WaitlistInterest,
} from "@/lib/forms";

export function Waitlist() {
  const startedAt = useRef(Date.now());
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [interest, setInterest] = useState<WaitlistInterest>("patient");
  const [consent, setConsent] = useState(false);
  const [adult, setAdult] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const res = await postJson("/api/waitlist", {
      email,
      name,
      interest,
      consent,
      adult,
      website,
      elapsedMs: Date.now() - startedAt.current,
    });
    if (res.ok) setStatus("done");
    else {
      setStatus("error");
      setError(res.error);
    }
  };

  return (
    <section id="waitlist" className="scroll-mt-16 pb-28 text-bone md:pb-40">
      <div className="shell">
        <div className="grid gap-10 rounded-[18px] bg-cobalt p-7 md:p-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <h2 className="display text-[clamp(3rem,7vw,6rem)]">Join the waitlist</h2>
            <p className="mt-6 max-w-sm font-serif text-xl leading-snug text-bone/80">
              One email when wristbands and the app launch. Nothing else.
            </p>
          </div>
          <div>
            {status === "done" ? (
              <div className="py-6">
                <p className="font-serif text-3xl">You&apos;re on the list.</p>
                <p className="mt-2 text-bone/75">
                  We&apos;ll email you once at launch. To leave, just reply &ldquo;unsubscribe&rdquo;.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="relative flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <FieldLabel label="Email">
                    {(id) => (
                      <input
                        id={id}
                        type="email"
                        required
                        autoComplete="email"
                        maxLength={254}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        placeholder="you@example.com"
                      />
                    )}
                  </FieldLabel>
                  <FieldLabel label="Name" optional>
                    {(id) => (
                      <input
                        id={id}
                        autoComplete="given-name"
                        maxLength={120}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                      />
                    )}
                  </FieldLabel>
                </div>
                <FieldLabel label="I am signing up">
                  {(id) => (
                    <select
                      id={id}
                      value={interest}
                      onChange={(e) => setInterest(e.target.value as WaitlistInterest)}
                      className={inputClass}
                    >
                      {WAITLIST_INTERESTS.map((i) => (
                        <option key={i} value={i} className="bg-canvas">
                          {WAITLIST_INTEREST_LABELS[i]}
                        </option>
                      ))}
                    </select>
                  )}
                </FieldLabel>
                <Checkbox checked={consent} onChange={setConsent} required>
                  Email me about the Patient-Tap launch. I&apos;ve read the{" "}
                  <Link href="/privacy" className="text-bone underline underline-offset-2">
                    privacy policy
                  </Link>{" "}
                  and can withdraw at any time.
                </Checkbox>
                <Checkbox checked={adult} onChange={setAdult} required>
                  I&apos;m 18 or older.
                </Checkbox>
                <Honeypot value={website} onChange={setWebsite} />
                <div className="flex flex-wrap items-center gap-4">
                  <SubmitButton sending={status === "sending"}>Join the waitlist</SubmitButton>
                  <FormStatus status={status} error={error} success="" />
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
