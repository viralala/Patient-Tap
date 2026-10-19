import Link from "next/link";
import { SiteNav } from "@/components/redesign/site-nav";
import { SiteFooter } from "@/components/redesign/footer";
import { formatLegalDate } from "@/lib/site";

export interface LegalSection {
  id: string;
  title: string;
  body: React.ReactNode;
}

const RELATED = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
  { href: "/disclaimer", label: "Medical disclaimer" },
  { href: "/refunds", label: "Refunds" },
  { href: "/shipping", label: "Shipping" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/security", label: "Security" },
];

/** Shared shell for every policy page: header, plain-language summary, TOC, sections. */
export function LegalPage({
  eyebrow = "Legal",
  title,
  intro,
  summary,
  sections,
  updated,
}: {
  eyebrow?: string;
  title: string;
  intro: React.ReactNode;
  summary?: string[];
  sections: LegalSection[];
  updated?: string;
}) {
  return (
    <>
      <SiteNav />
      <main id="main" className="relative bg-void pb-24 pt-32 text-white md:pt-40">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_80%_at_50%_0%,rgba(91,92,255,0.18),transparent_70%)]" />
        <div className="shell relative">
          <header className="max-w-3xl">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-royal-400" />
              {eyebrow}
            </p>
            <h1 className="mt-5 font-sans text-[clamp(2.2rem,5.5vw,4rem)] font-bold leading-[1.02] tracking-tight">
              {title}
            </h1>
            <div className="mt-5 max-w-2xl text-base leading-relaxed text-white/60 md:text-lg">{intro}</div>
            <p className="mt-5 font-mono text-xs text-white/40">
              Last updated {formatLegalDate(updated)}
            </p>
          </header>

          {summary && summary.length > 0 && (
            <aside
              aria-label="Summary"
              className="mt-10 max-w-3xl rounded-[22px] border border-white/10 bg-white/[0.035] p-6"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-signal-soft">
                The short version
              </p>
              <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-white/75">
                {summary.map((s) => (
                  <li key={s} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-white/40">
                This summary is for convenience. The full text below is what applies.
              </p>
            </aside>
          )}

          <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
            <nav aria-label="On this page" className="hidden lg:block">
              <div className="sticky top-28">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
                  On this page
                </p>
                <ol className="mt-4 space-y-2 border-l border-white/10 text-sm">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="-ml-px block border-l border-transparent pl-4 text-white/50 transition-colors hover:border-white/60 hover:text-white"
                      >
                        {i + 1}. {s.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </nav>

            <article className="prose-legal min-w-0 max-w-3xl">
              {sections.map((s, i) => (
                <section key={s.id} aria-labelledby={s.id}>
                  <h2 id={s.id}>
                    {i + 1}. {s.title}
                  </h2>
                  {s.body}
                </section>
              ))}

              <div className="mt-16 flex flex-wrap gap-2 border-t border-white/10 pt-8">
                {RELATED.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="rounded-full border border-white/12 px-4 py-1.5 text-xs text-white/60 no-underline transition-colors hover:border-white/40 hover:text-white"
                  >
                    {r.label}
                  </Link>
                ))}
              </div>
            </article>
          </div>
        </div>
      </main>
      <SiteFooter cta={false} />
    </>
  );
}
