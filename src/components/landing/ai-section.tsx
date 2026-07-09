"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Wand2,
  Bell,
  CalendarCheck,
  LineChart,
  ArrowRight,
} from "lucide-react";
import { Reveal } from "./reveal";

const CAPABILITIES = [
  { icon: Wand2, title: "Recommandations personnalisées", text: "Des conseils adaptés à vos données réelles." },
  { icon: LineChart, title: "Analyses automatiques", text: "Vos tendances expliquées en langage simple." },
  { icon: Bell, title: "Alertes préventives", text: "Un signal dès qu'un indicateur dérive." },
  { icon: CalendarCheck, title: "Suivi quotidien", text: "Un rituel d'une minute, sans effort." },
];

export function AiSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 sm:px-6">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        {/* left */}
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-medium uppercase tracking-wider text-cyan-300/90">
              Intelligence artificielle
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Votre assistant santé{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                alimenté par l&apos;IA
              </span>
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-white/55">
              Prevora analyse vos journées, repère les signaux faibles et vous
              guide — toujours sans poser de diagnostic.
            </p>
          </Reveal>

          <div className="mt-8 space-y-4">
            {CAPABILITIES.map((c, i) => (
              <Reveal key={c.title} delay={i * 0.08}>
                <div className="flex items-start gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-blue-500/10 text-blue-300">
                    <c.icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{c.title}</p>
                    <p className="text-sm text-white/50">{c.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3}>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 transition-transform hover:scale-[1.03]"
            >
              Essayer l&apos;assistant IA <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>

        {/* right — AI illustration */}
        <Reveal delay={0.15}>
          <div className="relative mx-auto max-w-sm">
            <motion.div
              aria-hidden
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.35),transparent)] blur-2xl"
            />
            <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0d1420]/90 p-5 shadow-2xl backdrop-blur-xl">
              <div className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-tr-sm bg-white/10 px-4 py-2.5 text-sm text-white">
                Pourquoi je me sens fatigué en ce moment ?
              </div>
              <div className="flex items-start gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
                  <Sparkles className="size-4" />
                </span>
                <div className="max-w-[85%] space-y-2 rounded-2xl rounded-tl-sm bg-blue-500/12 px-4 py-3 text-sm leading-relaxed text-white/85">
                  <p>
                    Sur 5 jours, votre sommeil a baissé de{" "}
                    <b className="text-white">1 h 20</b> et votre activité a
                    reculé. Ces deux facteurs expliquent souvent une fatigue
                    passagère.
                  </p>
                  <p className="text-white/70">
                    💡 Essayez de vous coucher 30 min plus tôt cette semaine. Si
                    la fatigue persiste, parlez-en à un professionnel de santé.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 pl-10 text-xs text-white/40">
                <span className="size-1.5 animate-pulse rounded-full bg-cyan-400" />
                Prevora analyse vos données…
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
