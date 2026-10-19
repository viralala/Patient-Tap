import type { Metadata } from "next";
import { Suspense } from "react";
import { Mail, ShieldAlert, Scale, PhoneCall } from "lucide-react";
import { SiteNav } from "@/components/redesign/site-nav";
import { SiteFooter } from "@/components/redesign/footer";
import { ContactForm } from "@/components/site/contact-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Patient-Tap team: partnerships, pilots, press, data requests and grievances.",
  alternates: { canonical: "/contact" },
};

const c = site.contact;

export default function ContactPage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="relative bg-void pb-24 pt-32 text-white md:pt-40">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(60%_80%_at_50%_0%,rgba(91,92,255,0.18),transparent_70%)]" />
        <div className="shell relative grid gap-14 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
              <span className="h-1.5 w-1.5 rounded-full bg-royal-400" />
              Contact
            </p>
            <h1 className="mt-5 font-sans text-[clamp(2.2rem,5.5vw,4rem)] font-bold leading-[1.02] tracking-tight">
              Let&apos;s{" "}
              <span className="font-serif font-normal italic text-white/80">talk.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/60 md:text-lg">
              Pilots with hospitals, schools, events or pharmacies; press; or questions about your
              data. We read everything.
            </p>

            <div className="mt-10 flex items-start gap-3 rounded-2xl border border-critical/25 bg-critical/[0.07] p-4 text-sm text-white/70">
              <PhoneCall className="mt-0.5 h-4 w-4 shrink-0 text-critical-soft" />
              <p>
                <strong className="text-white">This form is not monitored for emergencies.</strong>{" "}
                Call 112, or 108 for an ambulance.
              </p>
            </div>

            <ul className="mt-8 space-y-5">
              <ContactLine icon={Mail} title="General" email={c.email} />
              <ContactLine icon={ShieldAlert} title="Security" email={c.securityEmail} />
              <ContactLine icon={Scale} title="Privacy & data requests" email={c.privacyEmail} />
            </ul>

            <div className="mt-10 rounded-[22px] border border-white/10 bg-white/[0.035] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
                Grievance Officer
              </p>
              <p className="mt-3 font-medium">{c.grievanceOfficer.name}</p>
              <a
                href={`mailto:${c.grievanceOfficer.email}`}
                className="text-sm text-royal-300 underline underline-offset-2"
              >
                {c.grievanceOfficer.email}
              </a>
              <p className="mt-3 text-sm leading-relaxed text-white/50">
                Under the DPDP Act, 2023 and the IT Act, 2000. Complaints are acknowledged and
                resolved {c.grievanceOfficer.responseTime}.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6 md:p-9">
            <h2 className="text-xl font-semibold tracking-tight">Send us a message</h2>
            <p className="mt-1.5 text-sm text-white/50">All fields are required.</p>
            <div className="mt-7">
              <Suspense>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter cta={false} />
    </>
  );
}

function ContactLine({
  icon: Icon,
  title,
  email,
}: {
  icon: typeof Mail;
  title: string;
  email: string;
}) {
  return (
    <li className="flex items-center gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
        <Icon className="h-5 w-5 text-royal-300" strokeWidth={1.7} />
      </span>
      <span>
        <span className="block text-sm text-white/45">{title}</span>
        <a href={`mailto:${email}`} className="text-white underline-offset-4 hover:underline">
          {email}
        </a>
      </span>
    </li>
  );
}
