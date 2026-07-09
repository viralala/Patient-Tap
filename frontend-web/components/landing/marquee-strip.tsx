import { Nfc, WifiOff, Lock, MapPin, DatabaseZap, Zap, GitBranch } from "lucide-react";
import { Marquee } from "@/components/ui/marquee";

const ITEMS = [
  { icon: WifiOff, label: "Zero network to read" },
  { icon: Lock, label: "AES-256-GCM" },
  { icon: Nfc, label: "NTAG215 · 504 bytes" },
  { icon: MapPin, label: "SMS + GPS fallback" },
  { icon: DatabaseZap, label: "No central database" },
  { icon: Zap, label: "Reads in under 2s" },
  { icon: GitBranch, label: "Append-only chain of custody" },
];

export function MarqueeStrip() {
  return (
    <div className="on-ink relative border-y border-white/10 bg-ink py-5 text-white">
      <Marquee>
        {ITEMS.map((it, i) => (
          <div key={i} className="flex items-center gap-3 px-8">
            <it.icon className="h-4 w-4 text-royal-400" strokeWidth={1.8} />
            <span className="whitespace-nowrap font-mono text-xs uppercase tracking-[0.18em] text-white/55">
              {it.label}
            </span>
            <span className="ml-4 h-1 w-1 rounded-full bg-white/20" />
          </div>
        ))}
      </Marquee>
    </div>
  );
}
