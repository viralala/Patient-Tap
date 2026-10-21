"use client";

import { Button } from "@/components/ui/button";
import { IdPass } from "@/components/admin/id-pass";
import { fmtDate } from "@/components/admin/format";
import { site } from "@/lib/site";

const PASS_ID = "PT-ADM-0001";

export function AdminPass({ name, issued, validUntil }: { name: string; issued: string; validUntil: string }) {
  return (
    <div className="mt-12 grid items-start gap-12 lg:grid-cols-[auto_1fr]">
      <IdPass
        band="Administrator · All access"
        bandClass="bg-lemon text-canvas"
        name={name}
        subtitle={`Founder · ${site.operator.name}`}
        passId={PASS_ID}
        fields={[
          { label: "Role", value: "Owner" },
          { label: "Clearance", value: "Level 3" },
          { label: "Issued", value: fmtDate(issued) },
          { label: "Valid until", value: fmtDate(validUntil) },
        ]}
        qr={`PT1:ADM:${PASS_ID}`}
      />

      <div className="no-print max-w-md">
        <h2 className="font-serif text-2xl leading-tight">What this pass covers</h2>
        <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-bone/65">
          <li>Full read access to the patient registry and tag records.</li>
          <li>Tag verification and re-issue at enrolment desks.</li>
          <li>Responder audit logs and alert history.</li>
        </ul>
        <p className="mt-6 text-[15px] leading-relaxed text-bone/65">
          Print at 100% on card stock, or show it on screen. The code identifies the pass only and
          carries no access secret.
        </p>
        <div className="mt-8">
          <Button onClick={() => window.print()} glyph="↓">
            Print pass
          </Button>
        </div>
      </div>
    </div>
  );
}
