"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Registry", href: "/admin" },
  { label: "ID pass", href: "/admin/pass" },
];

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="no-print sticky top-0 z-40 border-b border-bone/10 bg-canvas/90 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="display whitespace-nowrap text-[22px] leading-none sm:text-[26px]">
            Patient-Tap
          </Link>
          <span className="label hidden rounded-[6px] bg-lemon px-2 py-1 text-canvas sm:inline">Admin</span>
        </div>
        <nav aria-label="Admin" className="flex items-center gap-4 whitespace-nowrap sm:gap-7">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={cn(
                "line-link text-[14px] sm:text-[15px]",
                pathname === l.href ? "text-bone" : "text-bone/60 hover:text-bone",
              )}
            >
              {l.label}
            </Link>
          ))}
          <button type="button" onClick={signOut} className="label text-bone/60 hover:text-lemon">
            Sign out
          </button>
        </nav>
      </div>
    </header>
  );
}
