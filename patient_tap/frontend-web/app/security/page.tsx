import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/site/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Security & responsible disclosure",
  description: "How Patient-Tap protects data, and how to report a security vulnerability safely.",
  alternates: { canonical: "/security" },
};

const sections: LegalSection[] = [
  {
    id: "approach",
    title: "Our approach",
    body: (
      <p>
        The safest health data is data that isn&apos;t sitting in a central database. Patient-Tap
        keeps your record encrypted on your tag and phone, so there is no store of medical records
        to breach. Everything else is built on least privilege and defence in depth.
      </p>
    ),
  },
  {
    id: "measures",
    title: "What protects you",
    body: (
      <table>
        <thead>
          <tr>
            <th>Layer</th>
            <th>Protection</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>The record</td>
            <td>AES-256-GCM authenticated encryption on the tag — tampering is detected, not just hidden</td>
          </tr>
          <tr>
            <td>Transport</td>
            <td>HTTPS only, HSTS with preload, TLS terminated by our host</td>
          </tr>
          <tr>
            <td>Browser</td>
            <td>
              A strict, per-request nonce Content-Security-Policy; frame, MIME-sniffing and referrer
              protections; and a permissions policy that allows only the camera, only on our origin
            </td>
          </tr>
          <tr>
            <td>API</td>
            <td>
              Same-origin checks, JSON-only size-capped bodies, schema validation, honeypots and
              per-IP rate limits
            </td>
          </tr>
          <tr>
            <td>Database</td>
            <td>
              Row-Level Security on every table and no direct table access. Every call goes through
              audited functions gated by a server-only secret. Hosted in India.
            </td>
          </tr>
          <tr>
            <td>Privacy</td>
            <td>IP addresses salted and hashed before use; camera frames never leave the browser</td>
          </tr>
          <tr>
            <td>Supply chain</td>
            <td>
              <code>npm audit</code> on every change, CodeQL static analysis, and Dependabot updates
            </td>
          </tr>
        </tbody>
      </table>
    ),
  },
  {
    id: "report",
    title: "Reporting a vulnerability",
    body: (
      <>
        <p>
          If you find a security issue, please email{" "}
          <a href={`mailto:${site.contact.securityEmail}`}>{site.contact.securityEmail}</a> (or use
          the <Link href="/contact">contact form</Link>, topic &ldquo;Security issue&rdquo;) with:
        </p>
        <ul>
          <li>a description of the issue and its impact;</li>
          <li>steps to reproduce it, or a proof of concept;</li>
          <li>the affected URL, app version or component.</li>
        </ul>
        <p>
          We&apos;ll acknowledge your report within 3 business days and keep you updated until
          it&apos;s fixed. Our machine-readable contact details are in{" "}
          <a href="/.well-known/security.txt">/.well-known/security.txt</a>.
        </p>
      </>
    ),
  },
  {
    id: "rules",
    title: "Rules of engagement",
    body: (
      <>
        <p>Please:</p>
        <ul>
          <li>test only against your own accounts, tags and data;</li>
          <li>stop as soon as you have shown the issue, and don&apos;t view, keep or change other people&apos;s data;</li>
          <li>don&apos;t run denial-of-service, spam or social-engineering attacks, and don&apos;t test physically;</li>
          <li>give us reasonable time to fix the issue before telling anyone else.</li>
        </ul>
        <p>
          If you follow these rules in good faith, we won&apos;t pursue or support legal action
          against you for your research, and we&apos;ll credit you if you&apos;d like.
        </p>
      </>
    ),
  },
  {
    id: "incidents",
    title: "If something goes wrong",
    body: (
      <p>
        If a personal data breach affects you, we will tell you and the Data Protection Board of
        India as the DPDP Act requires, and report cyber-security incidents to CERT-In under its
        directions of 28 April 2022.
      </p>
    ),
  },
];

export default function SecurityPage() {
  return (
    <LegalPage
      eyebrow="Security"
      title="Security & responsible disclosure"
      intro={<p>How we protect Patient-Tap, and how you can help us keep it safe.</p>}
      sections={sections}
    />
  );
}
