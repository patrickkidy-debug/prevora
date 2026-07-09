import { Reveal } from "./reveal";

const PARTNERS = [
  "HealthLab",
  "VitaCare",
  "NordClinic",
  "PulseAI",
  "Wellnest",
  "MediTrust",
];

export function Logos() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <Reveal className="text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-white/35">
          Ils nous font confiance
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="mt-8 grid grid-cols-2 items-center gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
          {PARTNERS.map((name) => (
            <span
              key={name}
              className="text-center text-lg font-semibold tracking-tight text-white/30 transition-colors hover:text-white/60"
            >
              {name}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
