import Link from "next/link";
import { Parallax } from "@/components/ui/parallax";

type Panel = {
  n: string;
  tag: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  bg: string;
};

const PANELS: Panel[] = [
  {
    n: "01",
    tag: "For patients",
    title: "The wristband",
    body: "You fill in your record in the app and write it to the band. It is sealed with AES-256-GCM, so a generic NFC reader sees only scrambled bytes and a tampered tag fails to open.",
    cta: "Open patient mode",
    href: "/app?role=patient",
    bg: "bg-cobalt",
  },
  {
    n: "02",
    tag: "For responders",
    title: "Tap to read",
    body: "A paramedic holds a phone running the Patient-Tap app to the band. No login and no signal needed. DNR and allergies show first, and each treatment is written back to the band with the time.",
    cta: "Open responder mode",
    href: "/app?role=responder",
    bg: "bg-pine",
  },
  {
    n: "03",
    tag: "For everyone",
    title: "MedVerify",
    body: "Scan the QR code on a medicine pack. MedVerify checks the product, batch, expiry and recalls, and flags a serial that has been copied. It runs in your browser with no upload.",
    cta: "Check a medicine",
    href: "/verify",
    bg: "bg-scarlet",
  },
  {
    n: "04",
    tag: "For donors",
    title: "Donor status",
    body: "Carry your blood group and your blood or organ donor pledge on the band. Responders see it as information only. It never changes the care you receive.",
    cta: "Blood and organ donation",
    href: "/donate",
    bg: "bg-plum",
  },
];

function PanelCard({ p, d }: { p: Panel; d: number }) {
  return (
    <div data-reveal style={{ "--d": d } as React.CSSProperties}>
      <article
        className={`lift flex min-h-[25rem] flex-col rounded-[18px] p-7 text-bone md:p-9 ${p.bg}`}
      >
        <p className="label flex justify-between text-bone/75">
          <span>{p.n}</span>
          <span>{p.tag}</span>
        </p>
        <h3 className="mt-14 font-serif text-[clamp(2.2rem,3.6vw,3rem)] leading-none">
          {p.title}
        </h3>
        <p className="mt-5 max-w-md font-mono text-[13.5px] leading-relaxed text-bone/85">
          {p.body}
        </p>
        <Link
          href={p.href}
          className="arrow-link label mt-auto inline-flex w-fit items-center gap-2 pt-10 text-bone"
        >
          <span className="line-link">{p.cta}</span>
          <span aria-hidden className="arr">
            →
          </span>
        </Link>
      </article>
    </div>
  );
}

export function WhatItDoes() {
  return (
    <section id="what" className="pb-28 text-bone md:pb-40">
      <div className="shell">
        <h2 data-reveal className="display text-[clamp(3rem,8vw,7rem)]">
          What it does
        </h2>
        <div className="mt-12 grid gap-4 lg:grid-cols-2 lg:gap-5">
          <div className="grid gap-4 lg:gap-5">
            <PanelCard p={PANELS[0]} d={0} />
            <PanelCard p={PANELS[2]} d={0} />
          </div>
          {/* The right column runs slightly ahead of the page on wide screens. */}
          <Parallax speed={0.06} minWidth={1024} className="lg:mt-28">
            <div className="grid gap-4 lg:gap-5">
              <PanelCard p={PANELS[1]} d={1} />
              <PanelCard p={PANELS[3]} d={1} />
            </div>
          </Parallax>
        </div>
      </div>
    </section>
  );
}
