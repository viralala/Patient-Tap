import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/site/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Accessibility statement",
  description: "Our commitment to making Patient-Tap usable by everyone, including people with disabilities.",
  alternates: { canonical: "/accessibility" },
};

const sections: LegalSection[] = [
  {
    id: "commitment",
    title: "Our commitment",
    body: (
      <p>
        A medical-safety tool has to work for everyone. We aim to meet the{" "}
        <strong>Web Content Accessibility Guidelines (WCAG) 2.2, level AA</strong>, in line with the
        spirit of the Rights of Persons with Disabilities Act, 2016.
      </p>
    ),
  },
  {
    id: "features",
    title: "What we've built in",
    body: (
      <ul>
        <li>
          Full keyboard navigation, with a visible focus outline and a &ldquo;Skip to content&rdquo;
          link.
        </li>
        <li>
          Respect for your system&apos;s <em>reduce motion</em> setting: smooth scrolling, the 3D
          scene, parallax and animated reveals are switched off.
        </li>
        <li>The custom cursor turns itself off on touch screens and with reduced motion.</li>
        <li>Semantic headings and landmarks, labelled form fields and error messages, and alt text.</li>
        <li>
          Life-safety information (DNR, allergies) is shown with text and icons, never by colour
          alone.
        </li>
        <li>MedVerify works without a camera: you can type the code instead.</li>
      </ul>
    ),
  },
  {
    id: "limits",
    title: "Known limitations",
    body: (
      <ul>
        <li>The 3D wristband in the hero is decorative and has no text alternative beyond its caption.</li>
        <li>Some decorative gradient text may fall below AA contrast. Key content does not.</li>
        <li>The web demo app is a phone-sized prototype and hasn&apos;t been fully screen-reader tested.</li>
      </ul>
    ),
  },
  {
    id: "feedback",
    title: "Tell us about a barrier",
    body: (
      <p>
        If something on the site is hard to use, please <Link href="/contact">contact us</Link> or
        email <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>. We aim to reply
        within 5 business days and to fix accessibility barriers as a priority.
      </p>
    ),
  },
];

export default function AccessibilityPage() {
  return (
    <LegalPage
      eyebrow="Accessibility"
      title="Accessibility statement"
      intro={<p>Emergencies don&apos;t check your abilities first. Neither should we.</p>}
      sections={sections}
    />
  );
}
