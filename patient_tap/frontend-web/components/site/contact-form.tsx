"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Checkbox,
  FieldLabel,
  FormStatus,
  Honeypot,
  SubmitButton,
  inputClass,
} from "@/components/site/form-controls";
import { CONTACT_TOPICS, CONTACT_TOPIC_LABELS, postJson, type ContactTopic } from "@/lib/forms";

export function ContactForm() {
  const params = useSearchParams();
  const initialTopic = (CONTACT_TOPICS as readonly string[]).includes(params.get("topic") ?? "")
    ? (params.get("topic") as ContactTopic)
    : "general";

  const startedAt = useRef(Date.now());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<ContactTopic>(initialTopic);
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const res = await postJson("/api/contact", {
      name,
      email,
      topic,
      message,
      consent,
      website,
      elapsedMs: Date.now() - startedAt.current,
    });
    if (res.ok) {
      setStatus("done");
      setMessage("");
    } else {
      setStatus("error");
      setError(res.error);
    }
  };

  return (
    <form onSubmit={submit} className="relative flex flex-col gap-5" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldLabel label="Your name">
          {(id) => (
            <input
              id={id}
              required
              maxLength={120}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          )}
        </FieldLabel>
        <FieldLabel label="Email">
          {(id) => (
            <input
              id={id}
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          )}
        </FieldLabel>
      </div>

      <FieldLabel label="What's this about?">
        {(id) => (
          <select
            id={id}
            value={topic}
            onChange={(e) => setTopic(e.target.value as ContactTopic)}
            className={inputClass}
          >
            {CONTACT_TOPICS.map((t) => (
              <option key={t} value={t} className="bg-canvas">
                {CONTACT_TOPIC_LABELS[t]}
              </option>
            ))}
          </select>
        )}
      </FieldLabel>

      <FieldLabel
        label="Message"
        hint={
          topic === "security"
            ? "Please don't include working exploits here. We'll reply with a secure channel."
            : "Please don't include medical details. We can't give medical advice."
        }
      >
        {(id) => (
          <textarea
            id={id}
            required
            minLength={10}
            maxLength={4000}
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`${inputClass} resize-y`}
          />
        )}
      </FieldLabel>

      <Checkbox checked={consent} onChange={setConsent} required>
        I agree that Patient-Tap may use these details to reply to me, as described in the{" "}
        <Link href="/privacy" className="text-bone underline underline-offset-2">
          privacy policy
        </Link>
        .
      </Checkbox>

      <Honeypot value={website} onChange={setWebsite} />

      <div className="flex flex-wrap items-center gap-4">
        <SubmitButton sending={status === "sending"}>Send message</SubmitButton>
        <FormStatus
          status={status}
          error={error}
          success="Thanks, your message is in. We aim to reply within 3 business days."
        />
      </div>
    </form>
  );
}
