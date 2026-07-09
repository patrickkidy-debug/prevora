"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Bell, Activity } from "lucide-react";
import { DashboardMock } from "./dashboard-mock";

const easing = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40">
      {/* background glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,0.18),transparent)]" />
        <div className="absolute right-0 top-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(34,211,238,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,#0B0F14)]" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
        {/* left */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easing }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md">
              <Sparkles className="size-3.5 text-cyan-300" />
              Prévention santé propulsée par l&apos;IA
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easing, delay: 0.08 }}
            className="mt-6 text-balance text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]"
          >
            Votre santé,
            <br />
            comprise{" "}
            <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
              jour après jour
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easing, delay: 0.16 }}
            className="mt-6 max-w-lg text-pretty text-lg leading-relaxed text-white/60"
          >
            Prevora suit vos habitudes, détecte les tendances et vous propose des
            conseils de prévention personnalisés. Pas un outil de diagnostic —
            votre allié bien-être au quotidien.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easing, delay: 0.24 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-xl shadow-blue-500/25 transition-transform hover:scale-[1.03] active:scale-95"
            >
              Créer mon compte gratuit
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/[0.08]"
            >
              J&apos;ai déjà un compte
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex items-center gap-2 text-xs text-white/40"
          >
            <ShieldCheck className="size-4 text-emerald-400/80" />
            Données chiffrées · Sans diagnostic médical · Annulable à tout moment
          </motion.div>
        </div>

        {/* right — dashboard + floating cards */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: easing, delay: 0.2 }}
          className="relative"
        >
          <div className="relative mx-auto max-w-md">
            <DashboardMock />

            {/* floating: AI notification */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-6 -top-6 hidden w-52 rounded-xl border border-white/12 bg-[#111827]/90 p-3 shadow-2xl backdrop-blur-xl sm:block"
            >
              <div className="flex items-start gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-cyan-400/15 text-cyan-300">
                  <Bell className="size-4" />
                </span>
                <div>
                  <p className="text-[0.7rem] font-semibold text-white">
                    Conseil IA
                  </p>
                  <p className="text-[0.65rem] leading-snug text-white/50">
                    Pensez à boire de l&apos;eau — hydratation en baisse.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* floating: KPI */}
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-6 -right-5 hidden w-44 rounded-xl border border-white/12 bg-[#111827]/90 p-3 shadow-2xl backdrop-blur-xl sm:block"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-400/15 text-emerald-300">
                  <Activity className="size-4" />
                </span>
                <div>
                  <p className="text-lg font-bold leading-none text-white">
                    +6 %
                  </p>
                  <p className="text-[0.65rem] text-white/50">bien-être / semaine</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
