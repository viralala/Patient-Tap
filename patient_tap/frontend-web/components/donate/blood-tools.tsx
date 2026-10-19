"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock, HelpCircle, XCircle } from "lucide-react";
import { FieldLabel, inputClass } from "@/components/site/form-controls";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Red-cell compatibility                                                     */
/* -------------------------------------------------------------------------- */

const TYPES = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] as const;
type BloodType = (typeof TYPES)[number];

const GIVES_TO: Record<BloodType, BloodType[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};
const RECEIVES_FROM = Object.fromEntries(
  TYPES.map((t) => [t, TYPES.filter((d) => GIVES_TO[d].includes(t))]),
) as Record<BloodType, BloodType[]>;

const pretty = (t: string) => t.replace("-", "−");

export function CompatibilityExplorer() {
  const [type, setType] = useState<BloodType>("O-");
  const notes: Partial<Record<BloodType, string>> = {
    "O-": "Universal red-cell donor — the type emergency teams reach for first.",
    "AB+": "Universal red-cell recipient, and AB plasma can be given to anyone.",
    "AB-": "AB plasma can be given to patients of any blood group.",
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h3 className="font-display text-xl font-semibold tracking-tight">Who can you give to?</h3>
      <p className="mt-1 text-sm text-white/50">Pick your blood group (red-cell transfusion).</p>
      <div role="radiogroup" aria-label="Your blood group" className="mt-5 grid grid-cols-4 gap-2">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={type === t}
            onClick={() => setType(t)}
            className={cn(
              "rounded-2xl border py-3 font-display text-lg font-semibold transition-colors",
              type === t ? "border-critical bg-critical text-white" : "border-white/12 text-white/70 hover:border-white/40",
            )}
          >
            {pretty(t)}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          ["Can donate to", GIVES_TO[type]],
          ["Can receive from", RECEIVES_FROM[type]],
        ].map(([label, list]) => (
          <div key={label as string} className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-white/40">{label as string}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {TYPES.map((t) => {
                const on = (list as BloodType[]).includes(t);
                return (
                  <span
                    key={t}
                    className={cn(
                      "rounded-full px-2.5 py-1 font-mono text-xs",
                      on ? "bg-critical/20 text-critical-soft" : "bg-white/[0.04] text-white/20 line-through",
                    )}
                  >
                    {pretty(t)}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 min-h-[1.25rem] text-sm text-white/60" aria-live="polite">
        {notes[type] ?? `${pretty(type)} can donate to ${GIVES_TO[type].length} of the 8 groups.`}
      </p>
      <p className="mt-2 text-xs text-white/35">
        Simplified ABO/Rh guide. Hospitals always cross-match blood before a transfusion.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Quick eligibility check                                                    */
/* -------------------------------------------------------------------------- */

type Verdict = { tone: "ok" | "wait" | "no" | "ask"; title: string; body: string };

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d;
}

export function EligibilityCheck() {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "other">("female");
  const [last, setLast] = useState("");
  const [unwell, setUnwell] = useState(false);
  const [tattoo, setTattoo] = useState(false);
  const [pregnant, setPregnant] = useState(false);

  const verdict = useMemo<Verdict | null>(() => {
    const a = Number(age);
    const w = Number(weight);
    if (!age || !weight) return null;
    if (a < 18) return { tone: "no", title: "Not yet", body: "Blood donors in India must be at least 18 years old." };
    if (a > 65) return { tone: "ask", title: "Ask the blood centre", body: "The usual upper age limit is 65. Some centres make exceptions for regular donors." };
    if (w < 45) return { tone: "no", title: "Not at the moment", body: "Donors usually need to weigh at least 45 kg." };
    if (unwell) return { tone: "wait", title: "Wait until you're well", body: "Come back once you've recovered and finished any course of antibiotics." };
    if (pregnant) return { tone: "wait", title: "Not right now", body: "Donation is deferred during pregnancy and for a period after delivery. The blood centre will advise you." };
    if (tattoo) return { tone: "wait", title: "Wait 12 months", body: "Tattoos, piercings and acupuncture mean waiting 12 months, to rule out infections." };
    if (last) {
      // Whole blood: at least 3 months; women are commonly asked to wait 4.
      const gap = sex === "male" ? 90 : 120;
      const next = addDays(last, gap);
      if (next > new Date()) {
        return {
          tone: "wait",
          title: `You can donate again from ${next.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
          body: `Whole-blood donations need a gap of about ${gap === 90 ? "3" : "4"} months so your body can rebuild its iron.`,
        };
      }
    }
    return {
      tone: "ok",
      title: "You're likely eligible",
      body: `Weight ${w >= 55 ? "suits a 350 or 450 ml donation" : "suits a 350 ml donation"}. Staff will check your haemoglobin, pulse and blood pressure on the day.`,
    };
  }, [age, weight, sex, last, unwell, tattoo, pregnant]);

  const icon = {
    ok: <CheckCircle2 className="h-6 w-6 text-signal-soft" />,
    wait: <Clock className="h-6 w-6 text-amber-300" />,
    no: <XCircle className="h-6 w-6 text-critical-soft" />,
    ask: <HelpCircle className="h-6 w-6 text-royal-300" />,
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
      <h3 className="font-display text-xl font-semibold tracking-tight">Can I donate?</h3>
      <p className="mt-1 text-sm text-white/50">A 30-second guide. Your answers never leave this page.</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <FieldLabel label="Age">
          {(id) => <input id={id} type="number" inputMode="numeric" min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)} className={inputClass} />}
        </FieldLabel>
        <FieldLabel label="Weight (kg)">
          {(id) => <input id={id} type="number" inputMode="numeric" min={0} max={300} value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClass} />}
        </FieldLabel>
        <FieldLabel label="Sex">
          {(id) => (
            <select id={id} value={sex} onChange={(e) => setSex(e.target.value as typeof sex)} className={inputClass}>
              <option value="female" className="bg-[#141417]">Female</option>
              <option value="male" className="bg-[#141417]">Male</option>
              <option value="other" className="bg-[#141417]">Prefer not to say</option>
            </select>
          )}
        </FieldLabel>
        <FieldLabel label="Last donated" optional>
          {(id) => <input id={id} type="date" max={new Date().toISOString().slice(0, 10)} value={last} onChange={(e) => setLast(e.target.value)} className={cn(inputClass, "[color-scheme:dark]")} />}
        </FieldLabel>
      </div>

      <fieldset className="mt-5 space-y-2.5">
        <legend className="mb-2 text-sm font-medium text-white/80">Any of these right now?</legend>
        {[
          [unwell, setUnwell, "Fever, feeling unwell, or taking antibiotics"],
          [tattoo, setTattoo, "Tattoo, piercing or acupuncture in the last 12 months"],
          [pregnant, setPregnant, "Pregnant, or had a baby in the last year"],
        ].map(([v, set, label]) => (
          <label key={label as string} className="flex cursor-pointer items-center gap-3 text-sm text-white/65">
            <input
              type="checkbox"
              checked={v as boolean}
              onChange={(e) => (set as (b: boolean) => void)(e.target.checked)}
              className="h-4 w-4 accent-[#F5333F]"
            />
            {label as string}
          </label>
        ))}
      </fieldset>

      <div aria-live="polite" className="mt-6 min-h-[88px]">
        {verdict ? (
          <div className="flex gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
            {icon[verdict.tone]}
            <div>
              <p className="font-medium">{verdict.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-white/60">{verdict.body}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/40">Enter your age and weight to see a result.</p>
        )}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-white/35">
        A rough guide based on national blood-donor guidelines, not a medical clearance. The blood
        centre makes the final decision after its own screening.
      </p>
    </div>
  );
}
