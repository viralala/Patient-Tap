import Link from "next/link";
import { Logo } from "@/components/brand/logo";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how" },
      { label: "Security", href: "#security" },
      { label: "For responders", href: "#responders" },
    ],
  },
  {
    title: "App",
    links: [
      { label: "Patient mode", href: "/app?role=patient" },
      { label: "Responder mode", href: "/app?role=responder" },
      { label: "Treatment log", href: "/app?role=responder&screen=log" },
    ],
  },
  {
    title: "Build",
    links: [
      { label: "GitHub", href: "https://github.com/viralala/Patient-Tap" },
      { label: "Flutter app", href: "https://github.com/viralala/Patient-Tap" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="on-ink relative overflow-hidden bg-ink pt-20 text-white">
      <div className="grain absolute inset-0" />
      <div className="shell relative z-10">
        <div className="grid gap-12 pb-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo tone="white" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              An encrypted medical record that lives on the wristband — not in a
              database. Readable by any phone, with zero network dependency.
            </p>
          </div>
          {COLS.map((col) => (
            <div key={col.title}>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
                {col.title}
              </p>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 py-8 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Patient-Tap. Built at Codeamble.</p>
          <p className="font-mono">
            Frontend demo · backend touchpoints stubbed in{" "}
            <span className="text-white/60">lib/services</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
