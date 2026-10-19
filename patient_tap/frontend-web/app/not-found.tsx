import Link from "next/link";
import type { Metadata } from "next";
import { SiteNav } from "@/components/redesign/site-nav";
import { SiteFooter } from "@/components/redesign/footer";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main id="main" className="relative flex min-h-[80vh] items-center bg-void pt-32 text-white">
        <div className="shell text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">Error 404</p>
          <h1 className="mt-5 font-sans text-[clamp(2.4rem,7vw,5rem)] font-bold uppercase leading-[0.95] tracking-tight">
            No record{" "}
            <span className="font-serif font-normal normal-case italic text-white/75">on this tag.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-white/55">
            The page you tapped doesn&apos;t exist or has moved.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black">
              Back to home
            </Link>
            <Link href="/verify" className="rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white">
              Verify a medicine
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter cta={false} />
    </>
  );
}
