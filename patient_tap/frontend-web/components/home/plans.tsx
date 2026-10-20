"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  price: (yearly: boolean) => string;
  period: (yearly: boolean) => string;
  forWho: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

// Yearly is the anchor price; monthly billing costs about 15% more over a year.
const PLANS: Plan[] = [
  {
    name: "Free",
    price: () => "₹0",
    period: () => "free forever",
    forWho: "For one patient getting started.",
    features: ["1 tag, read and written offline", "Responder mode with the last 3 log entries", "MedVerify medicine checks"],
    cta: "Start free",
    href: "/app",
  },
  {
    name: "Premium",
    price: (y) => (y ? "₹499" : "₹49"),
    period: (y) => (y ? "per year" : "per month"),
    forWho: "For individuals who want the full picture.",
    features: ["Multiple tags per patient", "Encrypted cloud backup and full log", "Emergency SMS and email alerts with location"],
    cta: "Join the waitlist",
    href: "/#waitlist",
    featured: true,
  },
  {
    name: "Family",
    price: (y) => (y ? "₹1,799" : "₹179"),
    period: (y) => (y ? "per year" : "per month"),
    forWho: "Up to 4 people, managed from one account.",
    features: ["Everything in Premium, for 4 members", "Guardian mode for children and elders", "Shared access log and alerts"],
    cta: "Join the waitlist",
    href: "/#waitlist",
  },
];

export function Plans() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="plans" className="scroll-mt-16 pb-28 text-bone md:pb-40">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="display text-[clamp(3rem,8vw,7rem)]">Plans</h2>
          <div role="group" aria-label="Billing period" className="flex w-fit rounded-btn border border-bone/20 p-1 md:mb-3">
            {(["Monthly", "Yearly"] as const).map((opt) => {
              const active = (opt === "Yearly") === yearly;
              return (
                <button
                  key={opt}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setYearly(opt === "Yearly")}
                  className={cn(
                    "label rounded-[7px] px-4 py-2 transition-colors",
                    active ? "bg-bone text-canvas" : "text-bone/60 hover:text-bone",
                  )}
                >
                  {opt}
                  {opt === "Yearly" && <span className="ml-1.5 opacity-70">(save 15%)</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3 lg:gap-5">
          {PLANS.map((p) => (
            <article
              key={p.name}
              className={cn(
                "flex flex-col rounded-[18px] p-7 md:p-8",
                p.featured ? "bg-lemon text-canvas" : "border border-bone/15",
              )}
            >
              <p className="label">{p.name}</p>
              <p className="display mt-8 text-[5rem] leading-none">{p.price(yearly)}</p>
              <p className={cn("label mt-2", p.featured ? "text-canvas/60" : "text-bone/50")}>
                {p.period(yearly)}
              </p>
              <p className="mt-6 font-serif text-xl leading-snug">{p.forWho}</p>
              <ul
                className={cn(
                  "mt-6 space-y-2.5 border-t pt-6 font-mono text-[13px] leading-relaxed",
                  p.featured ? "border-canvas/20" : "border-bone/15 text-bone/75",
                )}
              >
                {p.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span aria-hidden>+</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <Button href={p.href} variant={p.featured ? "dark" : "line"} className="w-full justify-between">
                  {p.cta}
                </Button>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 flex flex-col justify-between gap-6 rounded-[18px] border border-bone/15 p-7 md:flex-row md:items-center md:p-8">
          <div className="max-w-2xl">
            <p className="font-serif text-2xl">Just need the wristbands?</p>
            <p className="mt-2 text-[15px] leading-relaxed text-bone/60">
              Wristbands, cards and keychains ship blank and you write your own encrypted record.
              Pre-orders open soon. No payment is taken yet.
            </p>
          </div>
          <Button href="/contact?topic=order" variant="solid" className="shrink-0">
            Pre-order wristbands
          </Button>
        </div>

        <p className="mt-6 max-w-3xl font-mono text-xs leading-relaxed text-bone/45">
          Prototype pricing in INR. Payments are not live, so nothing here charges you. Schools, events,
          EMS fleets and hospitals can{" "}
          <Link href="/contact?topic=partnership" className="underline underline-offset-2 hover:text-bone">
            ask about bulk tags
          </Link>
          . See the{" "}
          <Link href="/refunds" className="underline underline-offset-2 hover:text-bone">
            refund policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
