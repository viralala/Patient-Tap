import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Medical disclaimer",
  description:
    "Patient-Tap is an information tool, not a medical device. What responders, patients and MedVerify users should know.",
  alternates: { canonical: "/disclaimer" },
};

const sections: LegalSection[] = [
  {
    id: "emergency",
    title: "Emergencies come first",
    body: (
      <p>
        <strong>In an emergency, call 112 (all emergencies) or 108 (ambulance) immediately.</strong>{" "}
        Patient-Tap does not contact emergency services, and an alert to your family is not a
        substitute for professional help.
      </p>
    ),
  },
  {
    id: "not-a-device",
    title: "Not a medical device",
    body: (
      <p>
        Patient-Tap is a prototype information tool. It is not a medical device, is not registered
        as one with the Central Drugs Standard Control Organisation (CDSCO) under the Medical Devices
        Rules, 2017, and is not intended to diagnose, treat, cure, monitor or prevent any disease.
        Nothing on this website or in the app is medical advice.
      </p>
    ),
  },
  {
    id: "record",
    title: "Information on a tag",
    body: (
      <>
        <ul>
          <li>
            Everything on a tag is entered by the patient or their guardian. We do not verify it,
            and it may be incomplete, wrong or out of date.
          </li>
          <li>
            Responders and clinicians must use their own professional judgement and standard
            protocols, and should confirm critical facts where they can. The absence of an allergy
            or condition on a tag does not mean the patient doesn&apos;t have it.
          </li>
          <li>A tag can be lost, damaged, swapped or unreadable. Never rely on it alone.</li>
        </ul>
      </>
    ),
  },
  {
    id: "dnr",
    title: "DNR preferences are not advance directives",
    body: (
      <>
        <p>
          A &ldquo;Do Not Resuscitate&rdquo; flag on Patient-Tap records a wish. It is{" "}
          <strong>not, by itself, a legally valid advance medical directive in India</strong>. A
          valid advance directive must follow the procedure laid down by the Supreme Court of India
          in <em>Common Cause v. Union of India</em> (2018), as modified by the Court in 2023.
        </p>
        <p>
          Responders should follow their own protocols and applicable law. If you want your wishes
          to be legally binding, make a formal advance directive and keep it with your doctor and
          family.
        </p>
      </>
    ),
  },
  {
    id: "medverify",
    title: "MedVerify",
    body: (
      <>
        <ul>
          <li>
            MedVerify currently uses a <strong>demonstration registry</strong>. Its brands,
            manufacturers, batches and codes are fictional, so results for real medicines are not
            meaningful yet.
          </li>
          <li>
            A &ldquo;genuine&rdquo; result means a code matched a record. It doesn&apos;t mean a
            medicine is safe, stored correctly, or right for you. Counterfeiters can copy real codes.
          </li>
          <li>
            The drug information shown (uses, side effects, warnings, interactions) is general and
            not exhaustive. Always read the leaflet and ask your doctor or pharmacist.
          </li>
          <li>
            Never stop, start or change a medicine because of a MedVerify result without asking a
            doctor or pharmacist.
          </li>
          <li>
            Report suspected spurious, adulterated or substandard drugs to your State Drug
            Controller or to CDSCO. Report side effects through the Pharmacovigilance Programme of
            India (PvPI).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "interactions",
    title: "Drug-conflict and allergy warnings",
    body: (
      <p>
        The app can warn when a medicine may conflict with an allergy or another medicine on your
        profile. The checks are limited and can miss interactions or raise false alarms. They
        support — never replace — a pharmacist&apos;s or doctor&apos;s review.
      </p>
    ),
  },
  {
    id: "donation",
    title: "Blood and organ donation",
    body: (
      <>
        <ul>
          <li>
            The blood-donation eligibility check is a rough guide based on publicly available
            national guidelines. Only staff at a licensed blood centre can decide whether you can
            donate, after their own screening.
          </li>
          <li>
            Recording organ-donor status on Patient-Tap is <strong>not a legal registration</strong>.
            To pledge, register through the National Organ and Tissue Transplant Organisation
            (NOTTO). Under Indian law and practice your family&apos;s consent is also sought, so tell
            them about your decision.
          </li>
          <li>
            Donor status shown to a responder is for information only. It never affects the care
            anyone receives in an emergency.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "contact",
    title: "Questions",
    body: (
      <p>
        If something on the website looks medically wrong, please tell us through the{" "}
        <Link href="/contact">contact form</Link> so we can correct it.
      </p>
    ),
  },
];

export default function DisclaimerPage() {
  return (
    <LegalPage
      title="Medical disclaimer"
      intro={
        <p>
          Patient-Tap helps the right information reach the right person faster. It doesn&apos;t
          replace a doctor, a pharmacist or the emergency services.
        </p>
      }
      summary={[
        "In an emergency, call 112 or 108 first.",
        "Patient-Tap is not a medical device and gives no medical advice.",
        "Tag data comes from the patient and may be wrong or out of date. Responders use their own judgement.",
        "A DNR flag or donor status on a tag is not a legal document.",
        "MedVerify uses a demo registry today, and a 'genuine' result is not a safety guarantee.",
      ]}
      sections={sections}
    />
  );
}
