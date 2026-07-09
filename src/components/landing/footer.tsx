"use client";

import * as React from "react";
import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { toast } from "sonner";

type IconProps = { className?: string };

const XIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-7.3L6 22H2.9l7.5-8.6L2 2h6.6l4.5 6.7L18.9 2Zm-1.1 18h1.8L7.3 3.9H5.4L17.8 20Z" />
  </svg>
);
const IgIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const InIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M6.94 5a1.94 1.94 0 1 1-3.88 0 1.94 1.94 0 0 1 3.88 0ZM3.3 8.4h3.27V21H3.3V8.4Zm5.36 0h3.14v1.72h.05c.44-.83 1.5-1.7 3.1-1.7 3.32 0 3.93 2.18 3.93 5.02V21h-3.27v-5.6c0-1.34-.02-3.06-1.86-3.06-1.87 0-2.15 1.46-2.15 2.96V21H8.66V8.4Z" />
  </svg>
);
const GhIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
  </svg>
);

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "#features" },
      { label: "Tarifs", href: "#pricing" },
      { label: "Aperçu", href: "#product" },
      { label: "Application", href: "/signup" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "FAQ", href: "#faq" },
      { label: "Blog", href: "#" },
      { label: "Guides santé", href: "#" },
      { label: "Statut", href: "#" },
    ],
  },
  {
    title: "Entreprise",
    links: [
      { label: "À propos", href: "#" },
      { label: "Carrières", href: "#" },
      { label: "Presse", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Centre d'aide", href: "#" },
      { label: "Confidentialité", href: "#" },
      { label: "Conditions", href: "#" },
      { label: "Sécurité", href: "#" },
    ],
  },
];

const SOCIALS = [
  { icon: XIcon, label: "X" },
  { icon: IgIcon, label: "Instagram" },
  { icon: InIcon, label: "LinkedIn" },
  { icon: GhIcon, label: "GitHub" },
];

export function Footer() {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Merci ! Vous êtes inscrit à la newsletter.");
  };

  return (
    <footer className="border-t border-white/10 bg-[#0B0F14]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          {/* brand + newsletter */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400">
                <HeartPulse className="size-4.5 text-white" />
              </span>
              <span className="text-lg font-semibold text-white">Prevora</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/50">
              Votre allié prévention santé, propulsé par l&apos;IA. Ne remplace
              pas un professionnel de santé.
            </p>

            <form onSubmit={onSubmit} className="mt-6 flex max-w-sm gap-2">
              <input
                type="email"
                required
                placeholder="Votre email"
                aria-label="Email newsletter"
                className="min-w-0 flex-1 rounded-full border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-blue-400/60"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#0B0F14] transition-transform hover:scale-[1.03]"
              >
                S&apos;inscrire
              </button>
            </form>

            <div className="mt-6 flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  className="grid size-9 place-items-center rounded-lg border border-white/10 text-white/50 transition-colors hover:border-white/20 hover:text-white"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-sm font-semibold text-white">{col.title}</p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-white/50 transition-colors hover:text-white"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row">
          <p>© {new Date().getFullYear()} Prevora. Tous droits réservés.</p>
          <p>Fait avec soin pour votre bien-être.</p>
        </div>
      </div>
    </footer>
  );
}
