import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/site/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms that apply when you use the Patient-Tap website, MedVerify, the web demo and the Android app.",
  alternates: { canonical: "/terms" },
};

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "Agreeing to these terms",
    body: (
      <>
        <p>
          These terms are an agreement between you and {site.operator.name} (&ldquo;we&rdquo;,
          &ldquo;us&rdquo;), which operates {site.name}. They apply to this website, MedVerify, the
          web demo, the donation tools, the Android app and any NFC tag used with them (together,
          the &ldquo;Service&rdquo;). By using the Service you agree to these terms and to our{" "}
          <Link href="/privacy">privacy policy</Link>. If you don&apos;t agree, please don&apos;t
          use the Service.
        </p>
        <p>
          These terms are an electronic record under the Information Technology Act, 2000 and do
          not need a physical or digital signature.
        </p>
      </>
    ),
  },
  {
    id: "prototype",
    title: "A prototype, provided as-is",
    body: (
      <>
        <p>
          {site.name} is a <strong>prototype</strong> built for {site.event}. Features may change,
          break or be removed without notice, and the Service may be unavailable at any time.
          MedVerify currently uses a <strong>demonstration registry</strong> of fictional brands —
          it is not yet connected to any manufacturer or regulator database.
        </p>
      </>
    ),
  },
  {
    id: "not-medical",
    title: "Not medical advice, not an emergency service",
    body: (
      <>
        <p>
          The Service is an information tool. It is <strong>not a medical device</strong>, does
          not diagnose or treat anything, and does not replace a doctor, pharmacist or emergency
          service. <strong>In an emergency, call 112 (or 108 for an ambulance).</strong> Please read
          the full <Link href="/disclaimer">medical disclaimer</Link>, which forms part of these
          terms.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Who can use the Service",
    body: (
      <p>
        You must be at least 18 years old and able to enter into a binding contract under Indian
        law. A parent or lawful guardian may set up and manage a profile for a child or for a person
        in their care, and is responsible for that profile.
      </p>
    ),
  },
  {
    id: "your-record",
    title: "Your record and your tag",
    body: (
      <>
        <ul>
          <li>
            You are responsible for keeping the information on your tag <strong>accurate and up to
            date</strong>. Responders may act on it.
          </li>
          <li>
            Only write information about yourself, or about someone you are legally allowed to act
            for, with their consent.
          </li>
          <li>
            Anyone with the Patient-Tap responder app can read your tag. Choose what you put on it
            accordingly, and keep the tag safe. If you lose it, rewrite a new tag and stop using the
            old one.
          </li>
          <li>
            A DNR preference or donor status on your tag is <strong>information, not a legal
            document</strong> — see the <Link href="/disclaimer">medical disclaimer</Link>.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "responders",
    title: "If you read someone else's tag",
    body: (
      <p>
        You may read another person&apos;s tag only to give them care or help in an emergency, or
        with their permission. Don&apos;t copy, keep, publish or misuse what you read. Misuse of
        someone&apos;s personal data can be an offence under Indian law.
      </p>
    ),
  },
  {
    id: "medverify",
    title: "Using MedVerify",
    body: (
      <>
        <ul>
          <li>
            A MedVerify result is an aid, <strong>not a guarantee</strong>. A &ldquo;genuine&rdquo;
            result means the code matched a record — not that the medicine is safe or right for
            you. A warning means you should check with a pharmacist, not that a crime has occurred.
          </li>
          <li>Always buy medicines from licensed pharmacies and keep your bill.</li>
          <li>
            Reports you submit must be honest. Don&apos;t submit false or malicious reports about a
            product, pharmacy or company.
          </li>
          <li>
            To report a suspected spurious or substandard drug officially, contact your State Drug
            Controller or the Central Drugs Standard Control Organisation (CDSCO).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <>
        <p>You agree not to:</p>
        <ul>
          <li>break the law, or help anyone else to;</li>
          <li>
            scrape, bulk-query or automate requests to the Service (including MedVerify) beyond
            normal personal use;
          </li>
          <li>
            probe, scan or test our security except under our{" "}
            <Link href="/security">responsible-disclosure policy</Link>;
          </li>
          <li>interfere with, overload or disrupt the Service;</li>
          <li>upload malware, or impersonate anyone;</li>
          <li>clone, forge or tamper with another person&apos;s tag or a medicine code.</li>
        </ul>
      </>
    ),
  },
  {
    id: "payments",
    title: "Prices and payments",
    body: (
      <p>
        Prices on the website are <strong>indicative prototype prices</strong> in Indian rupees.
        Payments are not live yet, and nothing you do on the website charges you. When paid plans
        launch, the price, taxes and billing terms will be shown before you pay, payments will be
        processed by Razorpay, and our <Link href="/refunds">refund &amp; cancellation
        policy</Link> and <Link href="/shipping">shipping policy</Link> will apply.
      </p>
    ),
  },
  {
    id: "ip",
    title: "Content and open source",
    body: (
      <p>
        The {site.name} name, logo and website content belong to us. Our source code is published on{" "}
        <a href={site.links.github} target="_blank" rel="noopener noreferrer">
          GitHub
        </a>{" "}
        under the licence stated in the repository. Third-party components are used under their own
        licences — see <Link href="/licenses">open-source licences</Link>. Health information from
        public sources is summarised for convenience; it remains the work of its original authors.
      </p>
    ),
  },
  {
    id: "third-party",
    title: "Third-party services and links",
    body: (
      <p>
        We link to services we don&apos;t control, such as e-RaktKosh, NOTTO and payment providers.
        We aren&apos;t responsible for their content, availability or privacy practices.
      </p>
    ),
  },
  {
    id: "warranty",
    title: "No warranty",
    body: (
      <p>
        To the fullest extent permitted by law, the Service is provided &ldquo;as is&rdquo; and
        &ldquo;as available&rdquo;, without warranties of any kind, express or implied — including
        accuracy, fitness for a particular purpose, uninterrupted availability, or that an NFC tag
        will always be readable. Phones, tags and networks can fail; keep a written copy of
        critical information as well.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <>
        <p>
          To the fullest extent permitted by law, we are not liable for any indirect, incidental,
          special or consequential loss, or for loss arising from: information that was inaccurate
          or out of date; a tag that was lost, damaged or unreadable; a decision taken by a
          responder, pharmacist or clinician; or a MedVerify result.
        </p>
        <p>
          Our total liability for any claim relating to the Service is limited to the amount you
          paid us in the 12 months before the claim, or ₹1,000 if you paid nothing. Nothing in these
          terms excludes liability that cannot be excluded under Indian law, including for fraud.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "Indemnity",
    body: (
      <p>
        You agree to compensate us for reasonable losses and costs arising from your breach of these
        terms or your misuse of the Service, including misuse of someone else&apos;s data.
      </p>
    ),
  },
  {
    id: "termination",
    title: "Suspension and ending",
    body: (
      <p>
        You can stop using the Service at any time, and ask us to delete your data under our privacy
        policy. We may suspend or end access for anyone who breaks these terms or puts others at
        risk. Sections that by their nature should survive — such as liability and governing law —
        continue after termination.
      </p>
    ),
  },
  {
    id: "law",
    title: "Governing law and disputes",
    body: (
      <p>
        These terms are governed by the laws of India. Before going to court, please contact us so
        we can try to resolve the issue informally within 30 days. Subject to that, the courts at{" "}
        {site.operator.jurisdiction} have exclusive jurisdiction. Nothing here limits any right you
        have as a consumer under the Consumer Protection Act, 2019.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes and contact",
    body: (
      <>
        <p>
          We may update these terms. We will post the new version here with a new date, and give
          notice of material changes. If a provision is found unenforceable, the rest still applies.
        </p>
        <p>
          Questions? <Link href="/contact">Contact us</Link> or email{" "}
          <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of use"
      intro={<p>The ground rules for using Patient-Tap — written to be read, not just agreed to.</p>}
      summary={[
        "Patient-Tap is a prototype information tool, not a medical device or an emergency service. In an emergency, call 112.",
        "You keep your tag accurate. Responders may rely on it.",
        "Read someone else's tag only to help them.",
        "MedVerify results are an aid, not a guarantee. It currently uses a demo registry.",
        "Prices are indicative. Payments are not live yet.",
      ]}
      sections={sections}
    />
  );
}
