export const siteConfig = {
  name: "Prevora",
  tagline: "Votre santé, jour après jour.",
  description:
    "Prevora est une plateforme de prévention santé propulsée par l'IA : suivez vos habitudes, détectez les tendances et recevez des conseils personnalisés. Ce n'est pas un outil de diagnostic médical.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};

export const MEDICAL_DISCLAIMER =
  "Prevora ne fournit pas de diagnostic médical et ne remplace pas un professionnel de santé. Consultez un médecin si vos symptômes persistent, s'aggravent ou vous inquiètent.";

export interface NavItem {
  href: string;
  label: string;
  icon: string; // lucide icon name
}

export const dashboardNav: NavItem[] = [
  { href: "/dashboard", label: "Accueil", icon: "layout-dashboard" },
  { href: "/questionnaire", label: "Questionnaire", icon: "clipboard-list" },
  { href: "/history", label: "Historique", icon: "calendar-days" },
  { href: "/reports", label: "Rapports", icon: "file-text" },
  { href: "/alerts", label: "Alertes", icon: "bell-ring" },
  { href: "/goals", label: "Objectifs", icon: "target" },
  { href: "/achievements", label: "Récompenses", icon: "award" },
  { href: "/profile", label: "Profil", icon: "user" },
  { href: "/settings", label: "Paramètres", icon: "settings" },
];
