"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  Target,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { DashboardMock } from "./dashboard-mock";
import { Reveal } from "./reveal";

const TABS = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "calendar", label: "Historique", icon: CalendarDays },
  { id: "ai", label: "Analyse IA", icon: Sparkles },
  { id: "goals", label: "Objectifs", icon: Target },
] as const;

type TabId = (typeof TABS)[number]["id"];

function CalendarPanel() {
  const scores = [78, 82, 65, 90, 45, 88, 73, 92, 60, 85, 79, 95, 70, 83, 88, 62, 91, 77, 84, 68, 89, 74, 93, 66, 81, 87, 72, 94];
  const tone = (v: number) =>
    v >= 80 ? "#34d399" : v >= 60 ? "#3B82F6" : v >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1420]/90 p-5 backdrop-blur-xl">
      <p className="mb-4 text-sm font-semibold text-white">Juillet 2026</p>
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-[0.6rem] text-white/40">
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {scores.map((v, i) => (
          <div
            key={i}
            className="flex aspect-square flex-col items-center justify-center rounded-md text-[0.6rem] font-medium text-white"
            style={{ backgroundColor: `${tone(v)}2a`, color: tone(v) }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

function AiPanel() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1420]/90 p-5 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 text-white">
          <Sparkles className="size-4" />
        </span>
        <p className="text-sm font-semibold text-white">Résumé IA du jour</p>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-white/70">
        Votre bien-être moyen est de <b className="text-white">82/100</b> cette
        semaine. Votre sommeil s&apos;améliore (+6 %), continuez sur cette
        lancée. Pensez à augmenter légèrement votre hydratation.
      </p>
      <div className="mt-4 space-y-2">
        {[
          "Sommeil en hausse de 6 % sur 7 jours",
          "Activité au-dessus de votre objectif",
        ].map((t) => (
          <div key={t} className="flex items-center gap-2 text-xs text-white/60">
            <TrendingUp className="size-3.5 text-blue-400" /> {t}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-cyan-400/10 p-3">
        <div className="flex items-start gap-2 text-xs text-white/80">
          <Lightbulb className="mt-0.5 size-4 shrink-0 text-cyan-300" />
          Ajoutez un verre d&apos;eau en matinée pour atteindre votre cible.
        </div>
      </div>
    </div>
  );
}

function GoalsPanel() {
  const goals = [
    { label: "Sommeil 8 h", pct: 92, color: "#8b7cf6" },
    { label: "Activité 30 min", pct: 100, color: "#34d399" },
    { label: "Hydratation 8 verres", pct: 65, color: "#38bdf8" },
    { label: "Nutrition équilibrée", pct: 78, color: "#f59e0b" },
  ];
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0d1420]/90 p-5 backdrop-blur-xl">
      <p className="text-sm font-semibold text-white">Vos objectifs</p>
      {goals.map((g) => (
        <div key={g.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-white/60">{g.label}</span>
            <span className="font-medium text-white/90">{g.pct}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full"
              style={{ width: `${g.pct}%`, background: g.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductPreview() {
  const [tab, setTab] = React.useState<TabId>("dashboard");

  return (
    <section id="product" className="mx-auto max-w-6xl scroll-mt-24 px-4 sm:px-6">
      <SectionHeading
        eyebrow="Le produit"
        title="Une interface pensée pour la clarté"
        subtitle="Chaque écran met en avant l'essentiel, sans surcharge. Explorez le produit."
      />

      <Reveal delay={0.1} className="mt-10">
        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  active
                    ? "border-white/15 bg-white/10 text-white"
                    : "border-white/8 text-white/50 hover:text-white/80"
                }`}
              >
                <t.icon className="size-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </Reveal>

      <div className="relative mx-auto max-w-xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-[radial-gradient(closest-side,rgba(59,130,246,0.15),transparent)] blur-2xl"
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === "dashboard" && <DashboardMock />}
            {tab === "calendar" && <CalendarPanel />}
            {tab === "ai" && <AiPanel />}
            {tab === "goals" && <GoalsPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
