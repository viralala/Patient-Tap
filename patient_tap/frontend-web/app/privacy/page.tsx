import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/site/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "How Patient-Tap collects, uses, protects and deletes personal data under India's Digital Personal Data Protection Act, 2023.",
  alternates: { canonical: "/privacy" },
};

const c = site.contact;

const sections: LegalSection[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          {site.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) is operated by {site.operator.name},{" "}
          {site.operator.descriptor}, based in {site.operator.jurisdiction}. For personal data
          processed through our services we act as the <strong>Data Fiduciary</strong> under the
          Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;).
        </p>
        <p>
          Patient-Tap is currently a <strong>prototype</strong> being demonstrated at {site.event}.
          Some features described here are still being built; this policy describes how they work
          or will work, and we will update it before anything changes materially.
        </p>
        <p>
          Contact for privacy questions:{" "}
          <a href={`mailto:${c.privacyEmail}`}>{c.privacyEmail}</a>. Our Grievance Officer is listed
          in <a href="#grievance">section 12</a>.
        </p>
      </>
    ),
  },
  {
    id: "scope",
    title: "What this policy covers",
    body: (
      <>
        <p>This policy covers:</p>
        <ul>
          <li>this website, including its forms (waitlist, contact, medicine reports);</li>
          <li>
            <strong>MedVerify</strong>, the medicine-verification tool at{" "}
            <Link href="/verify">/verify</Link>;
          </li>
          <li>
            the <strong>web demo</strong> at <Link href="/app">/app</Link> and the blood/organ
            donation tools at <Link href="/donate">/donate</Link>;
          </li>
          <li>
            the <strong>Patient-Tap Android app</strong> and the NFC tags (wristbands, cards,
            keychains) it writes to.
          </li>
        </ul>
        <p>
          Websites we link to, such as e-RaktKosh, NOTTO or a payment page, have their own
          policies, which we don&apos;t control.
        </p>
      </>
    ),
  },
  {
    id: "website-data",
    title: "Data we collect on this website",
    body: (
      <>
        <table>
          <thead>
            <tr>
              <th>What</th>
              <th>Why</th>
              <th>Kept for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Waitlist:</strong> email, optional name, what you&apos;re interested in, the
                version of this notice you agreed to
              </td>
              <td>To tell you when Patient-Tap launches (consent)</td>
              <td>Until you unsubscribe or ask us to delete it, or 24 months after launch</td>
            </tr>
            <tr>
              <td>
                <strong>Contact form:</strong> name, email, topic, your message
              </td>
              <td>To reply to you, and to handle data-rights requests and grievances</td>
              <td>12 months after the conversation ends (longer only if the law requires)</td>
            </tr>
            <tr>
              <td>
                <strong>Medicine reports:</strong> the code read from the pack, reason, optional
                details and city
              </td>
              <td>To spot counterfeit and substandard medicines</td>
              <td>24 months, then aggregated or deleted</td>
            </tr>
            <tr>
              <td>
                <strong>MedVerify checks:</strong> the product code, batch and serial looked up and
                the verdict
              </td>
              <td>To answer your check, detect copied codes, and find counterfeit hot spots</td>
              <td>90 days</td>
            </tr>
            <tr>
              <td>
                <strong>Hashed network address:</strong> a salted SHA-256 hash of your IP address
              </td>
              <td>Rate-limiting and abuse prevention</td>
              <td>24 hours for rate limits; up to 90 days alongside a MedVerify check</td>
            </tr>
            <tr>
              <td>
                <strong>Hosting logs</strong> kept by our host (Vercel): IP address, browser type,
                pages requested, time
              </td>
              <td>Security and keeping the site running</td>
              <td>As set by Vercel, typically a few days</td>
            </tr>
            <tr>
              <td>
                <strong>Analytics</strong>, only if you opt in: aggregate page views without cookies
              </td>
              <td>To learn which pages are useful</td>
              <td>Aggregated; no individual profile is built</td>
            </tr>
          </tbody>
        </table>
        <p>
          We never store your raw IP address in our database. We do not ask for, and you should not
          enter, health information in the website&apos;s forms.
        </p>
      </>
    ),
  },
  {
    id: "medverify",
    title: "MedVerify and your camera",
    body: (
      <>
        <p>
          When you scan a pack, your <strong>camera feed is processed only inside your
          browser</strong> to read the QR code or barcode. No image or video ever leaves your
          device. Only the decoded text (product code, batch, serial, expiry) is sent to our server
          to look it up. You can also type the code in instead.
        </p>
        <p>
          You can block camera access at any time in your browser settings. MedVerify still works
          with typed codes.
        </p>
      </>
    ),
  },
  {
    id: "demo",
    title: "The web demo and donation tools",
    body: (
      <>
        <p>
          The web demo at <Link href="/app">/app</Link> runs entirely in your browser with
          sample data. Nothing you type there is sent to us or stored after you close the tab.
          Please don&apos;t enter a real person&apos;s medical details into the demo.
        </p>
        <p>
          The blood-donation eligibility check and blood-type explorer on{" "}
          <Link href="/donate">/donate</Link> also run only in your browser. We never receive your
          answers.
        </p>
      </>
    ),
  },
  {
    id: "app",
    title: "The Android app and your health data",
    body: (
      <>
        <p>
          The app handles <strong>health data</strong>: allergies, medications, conditions, blood
          group, a do-not-resuscitate preference, donor status and emergency contacts. We treat it
          as the most sensitive data we hold. You decide what goes on your tag.
        </p>
        <h3>On your phone and on your tag (works offline)</h3>
        <ul>
          <li>
            Your profile is stored on your phone and written to your NFC tag encrypted with{" "}
            <strong>AES-256-GCM</strong>. Without a network, nothing is sent to us.
          </li>
          <li>
            <strong>Anyone who taps your tag with the Patient-Tap responder app can read the
            record</strong>. That is the point: a paramedic must be able to read it when you
            can&apos;t speak. Only put on the tag what you are comfortable with an emergency
            responder seeing.
          </li>
          <li>
            Document auto-fill uses on-device text recognition (Google ML Kit). Photos of your
            documents are processed on the phone and are not uploaded.
          </li>
          <li>
            Fingerprint and face unlock are handled by Android. We never receive or store biometric
            data.
          </li>
          <li>Medication reminders are scheduled locally on your phone.</li>
        </ul>
        <h3>Optional cloud features (only if you sign in)</h3>
        <ul>
          <li>
            <strong>Account:</strong> if you sign in with Google we receive your name, email and
            Google account ID.
          </li>
          <li>
            <strong>Backup and sync:</strong> your profile is encrypted on your phone before upload,
            so the copy on our servers is not readable by us.
          </li>
          <li>
            <strong>Emergency alerts:</strong> if you turn them on, a scan of your tag can send an
            SMS or email to your emergency contacts. That message includes your name and, with your
            location permission, your location at the time. Messages are delivered through Twilio
            (SMS) and Resend (email).
          </li>
          <li>
            <strong>Access log:</strong> scans of your tag can be recorded (the time, the
            responder ID and, where the scanning phone shares it, the location of the scan) so
            you can see who opened your record and where.
          </li>
          <li>
            <strong>Shareable links</strong> you create can be given an expiry date, and you can
            revoke them at any time.
          </li>
          <li>
            <strong>Payments:</strong> handled by Razorpay. We receive the payment status and an
            order reference. We never see or store your card, UPI or bank details.
          </li>
        </ul>
        <h3>Your emergency contacts</h3>
        <p>
          When you add someone as an emergency contact you are sharing their name and phone number
          with us. Please tell them and make sure they are happy to receive alerts.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use data, and what we never do",
    body: (
      <>
        <p>We use personal data only to:</p>
        <ul>
          <li>provide the features you ask for;</li>
          <li>keep the service secure and prevent abuse;</li>
          <li>reply to you and handle your requests;</li>
          <li>comply with the law.</li>
        </ul>
        <p>We will never:</p>
        <ul>
          <li>sell or rent your personal data;</li>
          <li>use your health data for advertising or profiling;</li>
          <li>share your health data with insurers or employers;</li>
          <li>track you across other websites.</li>
        </ul>
        <p>
          We process data on the basis of your <strong>consent</strong> (DPDP Act, section 6) or,
          where the Act allows it, for <strong>legitimate uses</strong> (section 7), for example
          responding to a medical emergency or complying with a legal obligation.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who processes data for us",
    body: (
      <>
        <p>
          We use a small number of service providers (&ldquo;Data Processors&rdquo;) bound by
          contracts to process data only on our instructions:
        </p>
        <table>
          <thead>
            <tr>
              <th>Provider</th>
              <th>Purpose</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vercel Inc.</td>
              <td>Website hosting, and analytics if you opt in</td>
              <td>Global edge network; our server functions run in Mumbai</td>
            </tr>
            <tr>
              <td>Supabase Inc.</td>
              <td>Database for website forms and MedVerify</td>
              <td>Mumbai, India (ap-south-1)</td>
            </tr>
            <tr>
              <td>Google LLC</td>
              <td>Sign-in (app only)</td>
              <td>Global</td>
            </tr>
            <tr>
              <td>Razorpay Software Pvt. Ltd.</td>
              <td>Payments (app only, once live)</td>
              <td>India</td>
            </tr>
            <tr>
              <td>Twilio Inc. / Resend</td>
              <td>Delivering emergency SMS and email alerts (app only)</td>
              <td>Global</td>
            </tr>
          </tbody>
        </table>
        <p>
          Some providers may process data outside India. The DPDP Act allows this except to
          countries the Government of India restricts, and we will follow any such restriction.
          We may also disclose data when Indian law requires it, for example a valid order from a
          court or authority.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "How we protect data",
    body: (
      <>
        <ul>
          <li>Records on tags and backups are encrypted with AES-256-GCM, which also detects tampering.</li>
          <li>HTTPS everywhere, with HSTS and a strict Content-Security-Policy on every page.</li>
          <li>
            The database is locked down: Row-Level Security on every table, with no direct access
            from the internet, and every request gated by a server-only secret.
          </li>
          <li>Network addresses are salted and hashed; forms are validated and rate-limited.</li>
          <li>Dependencies are audited for known vulnerabilities on every change.</li>
        </ul>
        <p>
          No system is perfectly secure. If a personal data breach happens we will inform the Data
          Protection Board of India and every affected person, as the DPDP Act requires, and report
          cyber incidents to CERT-In where required. See our <Link href="/security">security
          page</Link> to report a vulnerability.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <>
        <p>
          Our website forms are for people aged <strong>18 or over</strong>. A child&apos;s
          Patient-Tap profile, for example on a school wristband, must be created by a parent or
          lawful guardian, who gives consent on the child&apos;s behalf (DPDP Act, section 9). We do
          not track children or target advertising at them.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <p>Under the DPDP Act you have the right to:</p>
        <ul>
          <li>get a summary of the personal data we hold about you and how we use it;</li>
          <li>have inaccurate data corrected, completed or updated;</li>
          <li>have your data erased when it is no longer needed or you withdraw consent;</li>
          <li>
            withdraw consent at any time, as easily as you gave it. This does not affect anything
            done before you withdrew;
          </li>
          <li>nominate someone to exercise your rights if you die or become incapacitated;</li>
          <li>have your grievances addressed (see below).</li>
        </ul>
        <p>
          To use any of these rights, use our <Link href="/contact">contact form</Link> (topic
          &ldquo;My data&rdquo;) or email <a href={`mailto:${c.privacyEmail}`}>{c.privacyEmail}</a>.
          We may need to confirm your identity first. Data on an NFC tag you hold is under your
          control: you can rewrite or wipe it with the app at any time.
        </p>
      </>
    ),
  },
  {
    id: "grievance",
    title: "Grievance Officer",
    body: (
      <>
        <p>
          If you have a complaint about how we handle your data, contact our Grievance Officer:
        </p>
        <p>
          <strong>{c.grievanceOfficer.name}</strong>
          <br />
          Grievance Officer, {site.name}
          <br />
          Email: <a href={`mailto:${c.grievanceOfficer.email}`}>{c.grievanceOfficer.email}</a>
          <br />
          {site.operator.jurisdiction}
        </p>
        <p>
          Complaints are acknowledged and resolved {c.grievanceOfficer.responseTime}. If
          you&apos;re not satisfied with our response, you can complain to the Data Protection
          Board of India.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        We will post any change here and update the date at the top. If a change materially affects
        how we use data you have already given us, we will tell you (for example by email if
        you&apos;re on the waitlist) and ask for fresh consent where the law requires it.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro={
        <p>
          Patient-Tap exists to put your medical information in your hands, so our default is to
          collect as little as possible, keep it encrypted, and never sell it.
        </p>
      }
      summary={[
        "Your medical record lives encrypted on your tag and your phone, not in our database.",
        "The website collects only what you type into its forms, plus a hashed network address for abuse prevention.",
        "MedVerify reads codes with your camera inside your browser; images never leave your device.",
        "We never sell data, run ads, or track you across other websites.",
        `You can see, correct or delete your data at any time by emailing ${c.privacyEmail}.`,
      ]}
      sections={sections}
    />
  );
}
