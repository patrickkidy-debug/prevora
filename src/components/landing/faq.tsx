"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { Reveal } from "./reveal";

const FAQS = [
  {
    q: "Prevora pose-t-il un diagnostic médical ?",
    a: "Non. Prevora est un outil de prévention et de suivi. Il n'établit aucun diagnostic et ne remplace pas un professionnel de santé. En cas de symptômes persistants ou préoccupants, consultez un médecin.",
  },
  {
    q: "Mes données de santé sont-elles protégées ?",
    a: "Oui. Vos données sont chiffrées, ne sont jamais revendues, et vous pouvez les exporter ou supprimer votre compte à tout moment depuis les paramètres.",
  },
  {
    q: "Comment fonctionne l'analyse par IA ?",
    a: "L'IA observe vos saisies quotidiennes, calcule des scores et repère les tendances inhabituelles. Elle traduit ensuite ces observations en conseils simples et personnalisés.",
  },
  {
    q: "Puis-je utiliser Prevora hors ligne ?",
    a: "Oui. Prevora est une application installable (PWA) : vos questionnaires récents fonctionnent hors ligne et se synchronisent dès le retour de la connexion.",
  },
  {
    q: "Puis-je changer de formule ou annuler ?",
    a: "À tout moment, sans engagement. Vous pouvez passer d'un plan à l'autre ou annuler directement depuis votre espace.",
  },
  {
    q: "Prevora se connecte-t-il aux montres connectées ?",
    a: "L'intégration avec Apple Health, Google Fit, Fitbit, Garmin et Samsung Health est prévue et disponible progressivement selon votre formule.",
  },
];

function Item({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Reveal delay={index * 0.05}>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-4 p-5 text-left"
        >
          <span className="text-sm font-medium text-white sm:text-base">{q}</span>
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="grid size-7 shrink-0 place-items-center rounded-full border border-white/10 text-white/60"
          >
            <Plus className="size-4" />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="px-5 pb-5 text-sm leading-relaxed text-white/55">
                {a}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-4 sm:px-6">
      <SectionHeading eyebrow="FAQ" title="Questions fréquentes" />
      <div className="mt-12 space-y-3">
        {FAQS.map((f, i) => (
          <Item key={f.q} q={f.q} a={f.a} index={i} />
        ))}
      </div>
    </section>
  );
}
