"use client";

import { Check, X, Sparkles } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const ROWS = [
  "Analyse automatique des tendances",
  "Conseils personnalisés par IA",
  "Alertes préventives intelligentes",
  "Rapports PDF & partage sécurisé",
  "Score de bien-être global",
  "Fonctionne hors ligne (PWA)",
  "Orienté prévention, sans diagnostic",
];

export function Comparison() {
  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6">
      <SectionHeading
        eyebrow="Pourquoi Prevora"
        title="Bien plus qu'un simple carnet de santé"
        subtitle="La différence entre noter ses données… et vraiment les comprendre."
      />

      <Reveal delay={0.1} className="mt-12">
        <div className="overflow-hidden rounded-2xl border border-white/10">
          {/* header */}
          <div className="grid grid-cols-[1.6fr_1fr_1fr] bg-white/[0.02]">
            <div className="p-4 text-sm font-medium text-white/50">
              Fonctionnalité
            </div>
            <div className="border-l border-white/10 p-4 text-center text-sm font-medium text-white/50">
              App classique
            </div>
            <div className="relative border-l border-white/10 bg-gradient-to-b from-blue-500/15 to-transparent p-4 text-center">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                <Sparkles className="size-4 text-cyan-300" /> Prevora IA
              </span>
            </div>
          </div>

          {/* rows */}
          {ROWS.map((row, i) => (
            <div
              key={row}
              className={`grid grid-cols-[1.6fr_1fr_1fr] ${
                i % 2 ? "bg-white/[0.015]" : ""
              }`}
            >
              <div className="p-4 text-sm text-white/75">{row}</div>
              <div className="flex items-center justify-center border-l border-white/10 p-4">
                {i < 2 ? (
                  <X className="size-5 text-white/25" />
                ) : i < 4 ? (
                  <span className="text-xs text-white/35">Limité</span>
                ) : (
                  <X className="size-5 text-white/25" />
                )}
              </div>
              <div className="flex items-center justify-center border-l border-white/10 bg-blue-500/[0.06] p-4">
                <span className="grid size-6 place-items-center rounded-full bg-emerald-400/15">
                  <Check className="size-4 text-emerald-400" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
