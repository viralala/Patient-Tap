import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "solid" | "line" | "dark";

const variants: Record<Variant, string> = {
  solid: "btn-solid",
  line: "btn-line",
  dark: "btn-dark",
};

const isExternal = (href: string) => /^https?:\/\//.test(href);

/**
 * Marketing button. Soft corners (never a pill) and an optional text glyph in
 * its own cell, e.g. `glyph="→"` or `glyph="↗"`.
 */
export function Button({
  children,
  href,
  variant = "solid",
  glyph = "→",
  className,
  type = "button",
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  glyph?: string | null;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const cls = cn("btn", variants[variant], disabled && "pointer-events-none opacity-50", className);
  const inner = (
    <>
      <span>{children}</span>
      {glyph && (
        <span aria-hidden>
          <span className="btn-glyph">{glyph}</span>
        </span>
      )}
    </>
  );

  if (href && isExternal(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}
