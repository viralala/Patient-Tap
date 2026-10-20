import Link from "next/link";
import { cn } from "@/lib/utils";

type Mark = "yes" | "no" | "partial";

const ROWS: { label: string; values: [Mark, Mark, Mark, Mark] }[] = [
  { label: "Readable when the patient can't speak", values: ["yes", "partial", "partial", "partial"] },
  { label: "Works with no network", values: ["yes", "yes", "yes", "no"] },
  { label: "Works if the patient's phone is dead or locked", values: ["yes", "yes", "partial", "yes"] },
  { label: "Encrypted and tamper-evident", values: ["yes", "no", "no", "partial"] },
  { label: "Updated in seconds, by the patient", values: ["yes", "no", "yes", "no"] },
  { label: "Logs who treated the patient", values: ["yes", "no", "no", "yes"] },
  { label: "No central database to breach", values: ["yes", "yes", "yes", "no"] },
];
const COLS = ["Patient-Tap", "Paper card", "Phone medical ID", "Hospital records"];

const MARK: Record<Mark, { text: string; cls: string }> = {
  yes: { text: "Yes", cls: "text-bone" },
  partial: { text: "Partly", cls: "text-bone/55" },
  no: { text: "No", cls: "text-bone/30" },
};

export function Compare() {
  return (
    <section id="compare" className="scroll-mt-16 pb-28 text-bone md:pb-40">
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="display text-[clamp(3rem,8vw,7rem)]">How it compares</h2>
          <Link href="/security" className="label text-bone underline-offset-4 hover:underline md:mb-3">
            Security overview <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="mt-12 overflow-x-auto rounded-[18px] border border-bone/15">
          <table className="w-full min-w-[640px] font-mono text-[13px]">
            <caption className="sr-only">
              How Patient-Tap compares with other ways of carrying medical information
            </caption>
            <thead>
              <tr className="border-b border-bone/15">
                <th className="p-4 text-left">
                  <span className="sr-only">Capability</span>
                </th>
                {COLS.map((c, i) => (
                  <th
                    key={c}
                    scope="col"
                    className={cn(
                      "p-4 text-left text-xs font-medium uppercase tracking-wide",
                      i === 0 ? "bg-lemon text-canvas" : "text-bone/55",
                    )}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label} className="border-b border-bone/10 last:border-0">
                  <th scope="row" className="p-4 text-left font-serif text-[17px] font-normal text-bone/85">
                    {r.label}
                  </th>
                  {r.values.map((v, i) => (
                    <td key={i} className={cn("p-4", MARK[v].cls, i === 0 && "bg-bone/[0.06]")}>
                      {MARK[v].text}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 max-w-3xl font-mono text-xs leading-relaxed text-bone/45">
          Phone medical ID means lock-screen emergency info. Many phones show it while locked, but not
          when the battery is dead. Hospital records need network access and staff log-ins, and can
          only be found once the patient is identified.
        </p>
      </div>
    </section>
  );
}
