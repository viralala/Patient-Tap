import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";

export function Stats() {
  return (
    <section className="relative bg-paper py-24 md:py-32">
      <div className="shell">
        <Reveal className="grid grid-cols-2 divide-paper-line border-y border-paper-line md:grid-cols-4 md:divide-x">
          <StatCell
            value={<CountUp to={256} />}
            suffix="-bit"
            label="Encryption"
            note="AES-256-GCM"
          />
          <StatCell
            value={<CountUp to={504} />}
            suffix=" B"
            label="On-tag capacity"
            note="NTAG215"
          />
          <StatCell value="0" label="Servers to read" note="fully offline" />
          <StatCell value="<2s" label="Tap to record" note="one gesture" />
        </Reveal>
      </div>
    </section>
  );
}

function StatCell({
  value,
  suffix,
  label,
  note,
}: {
  value: React.ReactNode;
  suffix?: string;
  label: string;
  note: string;
}) {
  return (
    <div className="px-2 py-8 md:px-8">
      <p className="font-display text-[clamp(2.6rem,5vw,4rem)] font-semibold leading-none tracking-tight text-ink tnum">
        {value}
        {suffix && <span className="text-ink/40">{suffix}</span>}
      </p>
      <p className="mt-4 text-sm font-medium text-ink">{label}</p>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-ink/40">{note}</p>
    </div>
  );
}
