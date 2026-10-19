import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/site/legal-page";
import { LICENSES } from "@/lib/licenses.generated";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Open-source licences",
  description: "The open-source software and fonts that Patient-Tap is built with, and their licences.",
  alternates: { canonical: "/licenses" },
};

const FONTS = [
  { name: "Geist & Geist Mono", by: "Vercel", license: "SIL Open Font License 1.1" },
  { name: "Space Grotesk", by: "Florian Karsten", license: "SIL Open Font License 1.1" },
  { name: "Instrument Serif", by: "Instrument", license: "SIL Open Font License 1.1" },
];

const sections: LegalSection[] = [
  {
    id: "ours",
    title: "Our code",
    body: (
      <p>
        Patient-Tap&apos;s source is published on{" "}
        <a href={site.links.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>{" "}
        under the licence stated in the repository.
      </p>
    ),
  },
  {
    id: "software",
    title: "Software we use",
    body: (
      <table>
        <thead>
          <tr>
            <th>Package</th>
            <th>Version</th>
            <th>Licence</th>
          </tr>
        </thead>
        <tbody>
          {LICENSES.map((l) => (
            <tr key={l.name}>
              <td>
                <a href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.name}
                </a>
              </td>
              <td>{l.version}</td>
              <td>{l.license.startsWith("SEE LICENSE") || l.license.startsWith("Standard") ? "GSAP Standard License" : l.license}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },
  {
    id: "fonts",
    title: "Fonts",
    body: (
      <table>
        <thead>
          <tr>
            <th>Font</th>
            <th>Designer</th>
            <th>Licence</th>
          </tr>
        </thead>
        <tbody>
          {FONTS.map((f) => (
            <tr key={f.name}>
              <td>{f.name}</td>
              <td>{f.by}</td>
              <td>{f.license}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },
  {
    id: "thanks",
    title: "Thank you",
    body: (
      <p>
        Patient-Tap would not exist without the people who maintain these projects. Licence texts
        are included with each package&apos;s source.
      </p>
    ),
  },
];

export default function LicensesPage() {
  return (
    <LegalPage
      eyebrow="Credits"
      title="Open-source licences"
      intro={<p>Patient-Tap stands on the shoulders of open-source software.</p>}
      sections={sections}
    />
  );
}
