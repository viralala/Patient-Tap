import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminDashboard } from "@/components/admin/dashboard";
import { isAdmin } from "@/lib/server/admin-auth";
import { getRegistry } from "@/lib/server/admin-registry";

export const metadata: Metadata = { title: "Registry" };

export default async function AdminPage() {
  // The registry is only read after the session check, so it never reaches a signed-out browser.
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <>
      <AdminHeader />
      <main id="main">
        <AdminDashboard data={getRegistry()} />
      </main>
    </>
  );
}
