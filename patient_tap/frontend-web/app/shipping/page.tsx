import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/site/legal-page";

export const metadata: Metadata = {
  title: "Shipping & delivery policy",
  description: "Where and how Patient-Tap wristbands, cards and keychains will ship.",
  alternates: { canonical: "/shipping" },
};

const sections: LegalSection[] = [
  {
    id: "status",
    title: "Current status",
    body: (
      <p>
        <strong>We are not shipping yet.</strong> You can register interest through the{" "}
        <Link href="/#waitlist">waitlist</Link>. No payment is taken. The terms below are what we
        plan to offer at launch, and the final terms will be shown at checkout.
      </p>
    ),
  },
  {
    id: "where",
    title: "Where we deliver",
    body: <p>Within India, to any serviceable PIN code of our courier partners.</p>,
  },
  {
    id: "timing",
    title: "Dispatch and delivery times",
    body: (
      <ul>
        <li>Orders are dispatched within 3 business days.</li>
        <li>Delivery usually takes 3–7 business days after dispatch, depending on your location.</li>
        <li>You will receive a tracking link by email or SMS once your order ships.</li>
      </ul>
    ),
  },
  {
    id: "cost",
    title: "Shipping charges",
    body: <p>Any shipping charge is shown at checkout before you pay.</p>,
  },
  {
    id: "blank",
    title: "Your tag arrives blank",
    body: (
      <p>
        Every wristband, card and keychain ships <strong>empty and unprinted</strong>, with no name or
        number on the outside. You write your own encrypted record with the app after it arrives,
        so your health data never travels through the post.
      </p>
    ),
  },
  {
    id: "problems",
    title: "Lost, late or damaged parcels",
    body: (
      <p>
        If your order hasn&apos;t arrived within 10 business days of dispatch, or arrives damaged,{" "}
        <Link href="/contact">contact us</Link> and we will trace it, replace it or refund you. See
        the <Link href="/refunds">refund policy</Link>.
      </p>
    ),
  },
];

export default function ShippingPage() {
  return (
    <LegalPage
      title="Shipping & delivery policy"
      intro={<p>How your wristband will get to you, and why it arrives blank.</p>}
      sections={sections}
    />
  );
}
