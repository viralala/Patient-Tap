import type { Metadata } from "next";
import { SiteNav } from "@/components/redesign/site-nav";
import { SiteFooter } from "@/components/redesign/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main id="main" className="flex min-h-[80vh] items-center bg-canvas pb-20 pt-32 text-bone">
        <div className="shell text-center">
          <p className="label text-bone/50">Error 404</p>
          <h1 className="display mt-5 text-[clamp(3.5rem,11vw,10rem)]">No record here</h1>
          <p className="mx-auto mt-6 max-w-md font-serif text-xl text-bone/65">
            This page doesn&apos;t exist or has moved.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/">Back to home</Button>
            <Button href="/verify" variant="line">
              Check a medicine
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
