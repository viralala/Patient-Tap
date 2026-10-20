import { cn } from "@/lib/utils";

/** Opening block for inner pages: mono label, condensed title, serif intro. */
export function PageHeader({
  label,
  title,
  children,
  className,
}: {
  label: string;
  title: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("max-w-4xl", className)}>
      <p className="label text-bone/50">{label}</p>
      <h1 className="display mt-5 text-[clamp(3rem,9vw,7.5rem)]">{title}</h1>
      {children && (
        <div className="mt-6 max-w-2xl font-serif text-[clamp(1.1rem,1.5vw,1.35rem)] leading-snug text-bone/65">
          {children}
        </div>
      )}
    </header>
  );
}
