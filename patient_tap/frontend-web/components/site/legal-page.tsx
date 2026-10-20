import Link from "next/link";
import { SiteNav } from "@/components/redesign/site-nav";
import { SiteFooter } from "@/components/redesign/footer";
import { PageHeader } from "@/components/site/page-header";
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

/** Shared shell for every policy page: header, plain-language summary, contents, sections. */
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
      <main id="main" className="bg-canvas pb-28 pt-32 text-bone md:pt-40">
        <div className="shell">
          <PageHeader label={eyebrow} title={title}>
            {intro}
          </PageHeader>
          <p className="label mt-6 text-bone/45">Last updated {formatLegalDate(updated)}</p>

          {summary && summary.length > 0 && (
            <aside aria-label="Summary" className="mt-12 max-w-3xl rounded-[18px] bg-pine p-7 md:p-9">
              <p className="label text-bone/75">The short version</p>
              <ul className="mt-5 space-y-3 font-serif text-lg leading-snug">
                {summary.map((s) => (
                  <li key={s} className="flex gap-3">
                    <span aria-hidden className="font-mono text-base text-bone/70">+</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 font-mono text-xs text-bone/70">
                This summary is for convenience. The full text below is what applies.
              </p>
            </aside>
          )}

          <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
            <nav aria-label="On this page" className="hidden lg:block">
              <div className="sticky top-28">
                <p className="label text-bone/45">On this page</p>
                <ol className="mt-4 space-y-2 border-l border-bone/15 text-sm">
                  {sections.map((s, i) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="-ml-px block border-l border-transparent pl-4 text-bone/55 transition-colors hover:border-bone hover:text-bone"
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

              <div className="mt-16 flex flex-wrap gap-x-6 gap-y-3 border-t border-bone/15 pt-8">
                {RELATED.map((r) => (
                  <Link
                    key={r.href}
                    href={r.href}
                    className="label text-bone/60 no-underline hover:text-bone"
                  >
                    {r.label}
                  </Link>
                ))}
              </div>
            </article>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
