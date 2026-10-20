const STEPS = [
  {
    time: "12:41",
    title: "He collapses on a platform.",
    body: "Arjun faints at Pune Junction. He cannot tell anyone that he is allergic to penicillin, takes metformin or has a DNR wish.",
  },
  {
    time: "12:42",
    title: "A paramedic taps his wrist.",
    body: "Any NFC phone with the Patient-Tap app reads the band. The chip is powered by the phone itself, so there is no unlocking, pairing or signal involved.",
  },
  {
    time: "12:42",
    title: "The record opens on the phone.",
    body: "The record is decrypted and checked. If anyone has changed the bytes on the tag, it refuses to open instead of showing wrong data. DNR and allergies are shown first.",
  },
  {
    time: "12:43",
    title: "His family hears and care is logged.",
    body: "When there is signal, his emergency contact gets an SMS with his location. Each treatment is written back to the band, so the next hospital sees it too.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-16 pb-28 text-bone md:pb-40">
      <div className="shell">
        <h2 className="display text-[clamp(3rem,8vw,7rem)]">How a tap works</h2>
        <ol className="mt-12 border-t border-bone/15">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="grid gap-3 border-b border-bone/15 py-8 md:grid-cols-[9rem_1fr_1.1fr] md:gap-10 md:py-10"
            >
              <p className="label text-bone/50">
                {String(i + 1).padStart(2, "0")} / {s.time}
              </p>
              <h3 className="font-serif text-[clamp(1.6rem,2.6vw,2.25rem)] leading-tight">{s.title}</h3>
              <p className="max-w-xl text-[16px] leading-relaxed text-bone/65">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
