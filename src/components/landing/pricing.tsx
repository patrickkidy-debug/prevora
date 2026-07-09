"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { staggerContainer, staggerItem } from "./reveal";

interface Plan {
  name: string;
  price: string;
  tagline: string;
  featured?: boolean;
  features: string[];
  cta: string;
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    price: "4 000",
    tagline: "Pour démarrer votre suivi santé.",
    features: [
      "Suivi quotidien complet",
      "Score de bien-être",
      "1 rapport hebdomadaire",
      "Historique 30 jours",
      "Support par email",
    ],
    cta: "Commencer",
  },
  {
    name: "Standard",
    price: "8 000",
    tagline: "Le meilleur équilibre, pour la plupart.",
    featured: true,
    features: [
      "Tout de Starter",
      "Analyses IA avancées",
      "Alertes intelligentes",
      "Rapports PDF illimités",
      "Objectifs & gamification",
      "Historique illimité",
    ],
    cta: "Choisir Standard",
  },
  {
    name: "Growth",
    price: "13 000",
    tagline: "Toute la puissance de Prevora.",
    features: [
      "Tout de Standard",
      "Assistant IA prioritaire",
      "Prédictions avancées",
      "Partage sécurisé & export",
      "Santé connectée (montres)",
      "Support prioritaire",
    ],
    cta: "Choisir Growth",
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-4 sm:px-6">
      <SectionHeading
        eyebrow="Tarifs"
        title="Un plan pour chaque objectif"
        subtitle="Sans engagement, annulable à tout moment. Prix en francs CFA, par mois."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-14 grid items-start gap-6 lg:grid-cols-3"
      >
        {PLANS.map((plan) => (
          <motion.div
            key={plan.name}
            variants={staggerItem}
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className={`relative flex flex-col rounded-2xl border p-7 backdrop-blur-sm ${
              plan.featured
                ? "border-blue-400/40 bg-gradient-to-b from-blue-500/[0.12] to-white/[0.02] shadow-2xl shadow-blue-500/10 lg:-mt-4 lg:pb-9"
                : "border-white/10 bg-white/[0.03]"
            }`}
          >
            {plan.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-3 py-1 text-[0.7rem] font-semibold text-white shadow-lg">
                Le plus populaire
              </span>
            )}

            <div className="flex items-center gap-2">
              {plan.featured && <Sparkles className="size-4 text-cyan-300" />}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
            </div>
            <p className="mt-1 text-sm text-white/50">{plan.tagline}</p>

            <div className="mt-5 flex items-baseline gap-1.5">
              <span className="text-4xl font-bold tracking-tight text-white">
                {plan.price}
              </span>
              <span className="text-sm text-white/50">FCFA / mois</span>
            </div>

            <ul className="mt-6 space-y-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                  <span className="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-full bg-emerald-400/15">
                    <Check className="size-3 text-emerald-400" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className={`mt-8 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-transform hover:scale-[1.03] active:scale-95 ${
                plan.featured
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-xl shadow-blue-500/25"
                  : "border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]"
              }`}
            >
              {plan.cta}
            </Link>
          </motion.div>
        ))}
      </motion.div>

      <p className="mt-8 text-center text-xs text-white/35">
        Prevora ne remplace pas un professionnel de santé et ne fournit pas de
        diagnostic médical.
      </p>
    </section>
  );
}
