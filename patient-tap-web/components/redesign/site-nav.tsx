import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";

const LEFT = [
  { label: "The card", href: "#card" },
  { label: "For responders", href: "#responders" },
];
const RIGHT = [
  { label: "Pricing", href: "#pricing" },
  { label: "Updates", href: "#updates" },
];

/** Minimal near-black nav: left links · centered logo · right links + pill. */
export function RedesignNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="shell grid grid-cols-2 items-center py-5 md:grid-cols-3">
        {/* left */}
        <nav className="hidden items-center gap-6 justify-self-start md:flex">
          {LEFT.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-white/55 transition-colors duration-300 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* center logo */}
        <Link
          href="/"
          aria-label="Patient-Tap home"
          className="flex items-center gap-2 justify-self-start md:justify-self-center"
        >
          <LogoMark className="h-6 w-6" />
          <span className="font-sans text-[15px] font-semibold tracking-tight text-white">
            Patient<span className="text-royal-400">·</span>Tap
          </span>
        </Link>

        {/* right */}
        <div className="flex items-center gap-6 justify-self-end">
          {RIGHT.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="hidden text-sm text-white/55 transition-colors duration-300 hover:text-white md:inline"
            >
              {l.label}
            </a>
          ))}
          <Link
            href="/app"
            data-cursor="open"
            className="rounded-full bg-white px-5 py-2 text-sm font-medium text-black transition-transform duration-300 hover:scale-[1.04]"
          >
            Launch app
          </Link>
        </div>
      </div>
    </header>
  );
}
