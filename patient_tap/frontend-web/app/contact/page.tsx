import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteNav } from "@/components/redesign/site-nav";
import { SiteFooter } from "@/components/redesign/footer";
import { ContactForm } from "@/components/site/contact-form";
import { PageHeader } from "@/components/site/page-header";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Patient-Tap team: partnerships, pilots, press, data requests and grievances.",
  alternates: { canonical: "/contact" },
};

const c = site.contact;

const LINES = [
  { title: "General", email: c.email },
  { title: "Security", email: c.securityEmail },
  { title: "Privacy and data requests", email: c.privacyEmail },
];

export default function ContactPage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="bg-canvas pb-28 pt-32 text-bone md:pt-40">
        <div className="shell grid gap-14 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <PageHeader label="Contact" title="Talk to us">
              Pilots with hospitals, schools, events or pharmacies, press, or questions about your
              data. We read everything.
            </PageHeader>

            <p className="mt-10 border-l-4 border-scarlet pl-4 font-serif text-lg leading-snug text-bone/80">
              <strong className="font-medium text-bone">This form is not monitored for emergencies.</strong>{" "}
              Call 112, or 108 for an ambulance.
            </p>

            <dl className="mt-10 border-t border-bone/15">
              {LINES.map((l) => (
                <div key={l.title} className="grid gap-1 border-b border-bone/15 py-4 sm:grid-cols-[13rem_1fr]">
                  <dt className="label text-bone/50">{l.title}</dt>
                  <dd>
                    <a href={`mailto:${l.email}`} className="font-mono text-sm underline-offset-4 hover:underline">
                      {l.email}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-10 rounded-[18px] border border-bone/15 p-7">
              <p className="label text-bone/50">Grievance Officer</p>
              <p className="mt-4 font-serif text-2xl">{c.grievanceOfficer.name}</p>
              <a
                href={`mailto:${c.grievanceOfficer.email}`}
                className="font-mono text-sm underline underline-offset-4"
              >
                {c.grievanceOfficer.email}
              </a>
              <p className="mt-4 text-[15px] leading-relaxed text-bone/60">
                Under the DPDP Act, 2023 and the IT Act, 2000. Complaints are acknowledged and
                resolved {c.grievanceOfficer.responseTime}.
              </p>
            </div>
          </div>

          <div className="h-fit rounded-[18px] bg-pine p-7 md:p-10">
            <h2 className="display text-[clamp(2.4rem,4vw,3.5rem)]">Send a message</h2>
            <div className="mt-8">
              <Suspense>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
