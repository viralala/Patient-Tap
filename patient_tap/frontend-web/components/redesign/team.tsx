"use client";

import { Github } from "lucide-react";
import { Section, SectionHeader, Em } from "./section";
import { site } from "@/lib/site";

const GRADIENTS = [
  "linear-gradient(135deg,#3f74ff,#9b5cff)",
  "linear-gradient(135deg,#9b5cff,#ff5cc4)",
  "linear-gradient(135deg,#37e0f0,#3f74ff)",
  "linear-gradient(135deg,#12c58b,#37e0f0)",
];

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function Team() {
  return (
    <Section id="team">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          eyebrow={`The team · ${site.event}`}
          title={
            <>
              Built by <Em>{site.operator.name}.</Em>
            </>
          }
          sub="Four students who think the most important medical record is the one that's there when you can't speak."
        />
        <a
          href={site.links.github}
          target="_blank"
          rel="noopener noreferrer"
          className="rv inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/20 px-5 py-2.5 text-sm text-white transition-colors hover:border-white/60 lg:self-auto"
        >
          <Github className="h-4 w-4" /> Read the code
        </a>
      </div>
      <ul className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {site.team.map((m, i) => (
          <li key={m.name} className="rv rounded-[22px] border border-white/10 bg-white/[0.03] p-5">
            <span
              aria-hidden
              className="grid h-14 w-14 place-items-center rounded-2xl font-display text-lg font-semibold"
              style={{ background: GRADIENTS[i % GRADIENTS.length] }}
            >
              {initials(m.name)}
            </span>
            <p className="mt-5 font-display text-lg font-semibold tracking-tight">{m.name}</p>
            {m.role && <p className="mt-0.5 text-sm text-white/50">{m.role}</p>}
          </li>
        ))}
      </ul>
    </Section>
  );
}
