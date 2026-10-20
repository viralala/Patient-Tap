import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/site/legal-page";
import { CookieSettingsButton } from "@/components/site/cookie-settings-button";
import { CONSENT_KEY } from "@/lib/consent-keys";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "Patient-Tap sets no tracking cookies. Here is exactly what the site stores in your browser, and why.",
  alternates: { canonical: "/cookies" },
};

const sections: LegalSection[] = [
  {
    id: "summary",
    title: "Cookies in plain terms",
    body: (
      <p>
        Cookies and similar technologies (such as browser &ldquo;local storage&rdquo;) let a website
        remember things on your device. Patient-Tap <strong>sets no cookies of its own</strong> and
        uses no advertising or cross-site tracking technology. We store only one small item, which
        records your consent choice.
      </p>
    ),
  },
  {
    id: "what",
    title: "What we store",
    body: (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Purpose</th>
            <th>Duration</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>{CONSENT_KEY}</code>
            </td>
            <td>Local storage</td>
            <td>Remembers your cookie choice so we don&apos;t ask again</td>
            <td>Until you clear it</td>
            <td>Strictly necessary</td>
          </tr>
          <tr>
            <td>Vercel Web Analytics</td>
            <td>No cookie. Counts are derived from the request and reset daily</td>
            <td>Aggregate page views (no query strings)</td>
            <td>Not stored on your device</td>
            <td>Analytics, only if you opt in</td>
          </tr>
        </tbody>
      </table>
    ),
  },
  {
    id: "demo",
    title: "The web demo",
    body: (
      <p>
        The demo at <Link href="/app">/app</Link> keeps its sample data in memory only. It disappears
        when you close or reload the tab.
      </p>
    ),
  },
  {
    id: "third-party",
    title: "Third-party sites",
    body: (
      <p>
        If you follow a link to another site, such as GitHub, e-RaktKosh or NOTTO, that site may
        set its own cookies under its own policy.
      </p>
    ),
  },
  {
    id: "control",
    title: "Changing your choice",
    body: (
      <>
        <p>
          You can change your choice at any time. Analytics stays off unless you turn it on.
        </p>
        <p>
          <CookieSettingsButton />
        </p>
        <p>
          You can also clear this site&apos;s storage in your browser settings, which resets your
          choice.
        </p>
      </>
    ),
  },
];

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie policy"
      intro={<p>Short, because there is very little to say: no trackers, no ads, no surprises.</p>}
      summary={[
        "No advertising or tracking cookies, ever.",
        "One local-storage item remembers your consent choice.",
        "Privacy-friendly, cookieless analytics runs only if you opt in.",
      ]}
      sections={sections}
    />
  );
}
