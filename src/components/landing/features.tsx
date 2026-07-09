"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  LineChart,
  BellRing,
  FileText,
  Target,
  ShieldCheck,
  ArrowUpRight,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "./section-heading";
import { staggerContainer, staggerItem } from "./reveal";

interface Feature {
  icon: LucideIcon;
  title: string;
  text: string;
  color: string;
}

const FEATURES: Feature[] = [
  {
    icon: Brain,
    title: "Analyse par IA",
    text: "Un moteur qui observe vos tendances et explique vos données en langage clair et actionnable.",
    color: "#3B82F6",
  },
  {
    icon: LineChart,
    title: "Suivi quotidien",
    text: "Sommeil, stress, activité, nutrition, hydratation — tout visualisé d'un seul coup d'œil.",
    color: "#22D3EE",
  },
  {
    icon: BellRing,
    title: "Alertes intelligentes",
    text: "Soyez prévenu dès qu'un indicateur évolue de façon inhabituelle, avant que ça ne s'installe.",
    color: "#f59e0b",
  },
  {
    icon: FileText,
    title: "Rapports premium",
    text: "Rapports quotidiens, hebdomadaires et mensuels exportables en PDF, prêts à partager.",
    color: "#8b7cf6",
  },
  {
    icon: Target,
    title: "Objectifs & habitudes",
    text: "Fixez des objectifs, gardez votre streak et progressez un peu plus chaque jour.",
    color: "#34d399",
  },
  {
    icon: ShieldCheck,
    title: "Confidentialité totale",
    text: "Vos données de santé sont chiffrées, exportables et vous appartiennent, point.",
    color: "#38bdf8",
  },
];

export function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 sm:px-6">
      <SectionHeading
        eyebrow="Fonctionnalités"
        title="Tout ce qu'il faut pour prendre soin de vous"
        subtitle="Une expérience fluide inspirée d'Apple Health et Google Fit, pensée pour la prévention."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map((f) => (
          <motion.div
            key={f.title}
            variants={staggerItem}
            whileHover={{ y: -8, rotateX: 4, rotateY: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ transformPerspective: 1000 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
          >
            <div
              className="absolute inset-x-0 top-0 h-px opacity-0 transition-opacity group-hover:opacity-100"
              style={{
                background: `linear-gradient(90deg, transparent, ${f.color}, transparent)`,
              }}
            />
            <div
              className="absolute -right-10 -top-10 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25"
              style={{ background: f.color }}
            />
            <span
              className="grid size-12 place-items-center rounded-xl border border-white/10"
              style={{ backgroundColor: `${f.color}18`, color: f.color }}
            >
              <f.icon className="size-6" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-white">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{f.text}</p>
            <Link
              href="/signup"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              En savoir plus
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
