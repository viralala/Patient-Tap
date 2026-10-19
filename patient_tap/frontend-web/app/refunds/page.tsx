import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/site/legal-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Refund & cancellation policy",
  description: "How cancellations and refunds work for Patient-Tap plans and wristbands.",
  alternates: { canonical: "/refunds" },
};

const sections: LegalSection[] = [
  {
    id: "status",
    title: "Current status",
    body: (
      <p>
        <strong>Payments are not live yet.</strong> Nothing on this website charges you, and
        joining the waitlist or pre-order list is free and binding on no one. The rules below will
        apply from the day paid plans and wristband sales launch. We will show them again before
        you pay.
      </p>
    ),
  },
  {
    id: "subscriptions",
    title: "Subscriptions (Premium & Family)",
    body: (
      <ul>
        <li>You can cancel at any time from the app or by contacting us. No questions asked.</li>
        <li>
          Cancelling stops the next renewal. You keep paid features until the end of the period
          you have already paid for.
        </li>
        <li>
          <strong>7-day refund:</strong> if you&apos;re not happy, ask within 7 days of your first
          payment for a plan and we will refund it in full.
        </li>
        <li>
          After 7 days, payments for the current period are not refundable except where the law
          requires, or if we fail to provide the service.
        </li>
        <li>
          Cancelling never deletes the record on your tag. Free features — reading and writing your
          own tag offline — keep working.
        </li>
      </ul>
    ),
  },
  {
    id: "hardware",
    title: "Wristbands, cards and keychains",
    body: (
      <ul>
        <li>
          <strong>Defective or damaged on arrival:</strong> tell us within 7 days of delivery and
          we will replace it or refund you in full, including shipping.
        </li>
        <li>
          <strong>Change of mind:</strong> unused items in original packaging can be returned within
          7 days of delivery for a refund of the item price.
        </li>
        <li>
          Tags that have been written with personal health data can&apos;t be resold, so for hygiene
          and privacy reasons we can only accept them back if they are defective.
        </li>
      </ul>
    ),
  },
  {
    id: "how",
    title: "How refunds are paid",
    body: (
      <p>
        Approved refunds go back to the original payment method through Razorpay. They are
        initiated within 5 business days of approval and usually reach you within 5–7 business days
        after that, depending on your bank.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Requesting a cancellation or refund",
    body: (
      <p>
        Use the <Link href="/contact">contact form</Link> or email{" "}
        <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a> with your order reference.
        Unresolved complaints can go to our Grievance Officer — see the{" "}
        <Link href="/privacy#grievance">privacy policy</Link>.
      </p>
    ),
  },
];

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund & cancellation policy"
      intro={<p>Fair and simple: cancel any time, and get a full refund within 7 days.</p>}
      summary={[
        "Payments aren't live yet. Nothing on the site charges you.",
        "Cancel a plan any time. It stays active until the end of the paid period.",
        "Full refund if you ask within 7 days of your first payment.",
        "Defective hardware is replaced or refunded.",
      ]}
      sections={sections}
    />
  );
}
