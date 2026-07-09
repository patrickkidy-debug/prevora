import Link from "next/link";
import { ArrowRight, HeartPulse } from "lucide-react";
import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-white/10 px-6 py-16 text-center sm:py-20">
          {/* gradient bg */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500 opacity-90"
          />
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(120%_120%_at_50%_-10%,rgba(255,255,255,0.25),transparent)]"
          />

          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/15 backdrop-blur-md">
            <HeartPulse className="size-6 text-white" />
          </span>
          <h2 className="mx-auto mt-6 max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Prenez une longueur d&apos;avance sur votre santé
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Rejoignez Prevora aujourd&apos;hui. Gratuit pour commencer, sans
            carte bancaire.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-blue-700 shadow-xl transition-transform hover:scale-[1.03] active:scale-95"
            >
              Créer mon compte gratuit
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
