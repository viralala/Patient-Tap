import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminPass } from "@/components/admin/admin-pass";
import { isAdmin } from "@/lib/server/admin-auth";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "ID pass" };

export default async function AdminPassPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const issued = new Date();
  const validUntil = new Date(issued);
  validUntil.setFullYear(issued.getFullYear() + 1);

  return (
    <>
      <AdminHeader />
      <main id="main" className="shell pb-28 pt-12 md:pt-16">
        <p className="label no-print text-bone/50">Access credentials</p>
        <h1 className="display no-print mt-4 text-[clamp(3rem,8vw,6.5rem)]">ID pass</h1>
        <AdminPass
          name={process.env.ADMIN_NAME || site.contact.grievanceOfficer.name}
          issued={issued.toISOString()}
          validUntil={validUntil.toISOString()}
        />
      </main>
    </>
  );
}
