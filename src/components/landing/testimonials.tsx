"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { staggerContainer, staggerItem } from "./reveal";

interface Testimonial {
  name: string;
  role: string;
  initials: string;
  gradient: string;
  comment: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aïcha D.",
    role: "Enseignante",
    initials: "AD",
    gradient: "from-blue-500 to-cyan-400",
    comment:
      "En 3 semaines, j'ai compris pourquoi je dormais mal. Les conseils sont simples et vraiment adaptés à moi.",
  },
  {
    name: "Marc L.",
    role: "Développeur",
    initials: "ML",
    gradient: "from-violet-500 to-blue-500",
    comment:
      "Le résumé IA du matin est devenu un rituel. C'est clair, jamais culpabilisant, et ça motive.",
  },
  {
    name: "Fatou N.",
    role: "Infirmière",
    initials: "FN",
    gradient: "from-emerald-500 to-cyan-400",
    comment:
      "J'apprécie le rappel de consulter quand c'est nécessaire. Ça reste de la prévention, pas un diagnostic.",
  },
  {
    name: "Yann K.",
    role: "Coach sportif",
    initials: "YK",
    gradient: "from-amber-500 to-orange-500",
    comment:
      "Les tendances hebdo m'aident à ajuster mes séances. L'interface est superbe et rapide.",
  },
  {
    name: "Sophie R.",
    role: "Consultante",
    initials: "SR",
    gradient: "from-pink-500 to-rose-500",
    comment:
      "Enfin une app santé qui ne me noie pas sous les chiffres. Tout est lisible en un coup d'œil.",
  },
  {
    name: "Ibrahim S.",
    role: "Étudiant",
    initials: "IS",
    gradient: "from-cyan-500 to-teal-400",
    comment:
      "Le streak et les badges me font tenir sur la durée. Je remplis mon suivi tous les jours maintenant.",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <SectionHeading
        eyebrow="Témoignages"
        title="Ils prennent soin d'eux avec Prevora"
        subtitle="Des milliers d'utilisateurs suivent leur santé au quotidien."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-60px" }}
        className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {TESTIMONIALS.map((t) => (
          <motion.figure
            key={t.name}
            variants={staggerItem}
            className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
          >
            <div className="flex gap-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-white/70">
              “{t.comment}”
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span
                className={`grid size-10 place-items-center rounded-full bg-gradient-to-br ${t.gradient} text-sm font-semibold text-white`}
              >
                {t.initials}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="text-xs text-white/45">{t.role}</p>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </motion.div>
    </section>
  );
}
