"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Section, SectionHeader, Em } from "./section";
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
    <Section
      id="waitlist"
      blobs={[
        { color: "#3b6dff", size: 520, top: "10%", left: "20%", blur: 140, opacity: 0.4 },
        { color: "#ff5cc4", size: 460, top: "20%", left: "70%", blur: 140, opacity: 0.35 },
      ]}
    >
      <div className="grid items-start gap-12 lg:grid-cols-2">
        <SectionHeader
          eyebrow="Early access"
          dot="bg-signal"
          title={
            <>
              Be first to <Em>wear one.</Em>
            </>
          }
          sub="Join the waitlist for wristbands, the app launch and MedVerify pilots. One email when it's ready — no spam, and you can leave any time."
        />

        <div className="rv rounded-[28px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl md:p-8">
          {status === "done" ? (
            <div className="py-6 text-center">
              <p className="font-display text-2xl font-semibold">You&apos;re on the list.</p>
              <p className="mt-2 text-white/60">
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
              <FieldLabel label="I'm interested…">
                {(id) => (
                  <select
                    id={id}
                    value={interest}
                    onChange={(e) => setInterest(e.target.value as WaitlistInterest)}
                    className={inputClass}
                  >
                    {WAITLIST_INTERESTS.map((i) => (
                      <option key={i} value={i} className="bg-[#141417]">
                        {WAITLIST_INTEREST_LABELS[i]}
                      </option>
                    ))}
                  </select>
                )}
              </FieldLabel>
              <Checkbox checked={consent} onChange={setConsent} required>
                Email me about the Patient-Tap launch. I&apos;ve read the{" "}
                <Link href="/privacy" className="text-royal-300 underline underline-offset-2">
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
    </Section>
  );
}
