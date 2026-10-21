import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { adminConfigured, isAdmin } from "@/lib/server/admin-auth";

export const metadata: Metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <main id="main" className="shell grid min-h-dvh place-items-center py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="display text-[28px] leading-none">
          Patient-Tap
        </Link>
        <p className="label mt-12 text-bone/50">Restricted · owner only</p>
        <h1 className="display mt-4 text-[clamp(3rem,10vw,5rem)]">Admin console</h1>
        <p className="mt-4 font-serif text-lg leading-snug text-bone/65">
          Patient registry, tag verification and access passes.
        </p>
        <div className="mt-10">
          <LoginForm configured={adminConfigured()} />
        </div>
      </div>
    </main>
  );
}
