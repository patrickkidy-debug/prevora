import Link from "next/link";
import {
  Activity,
  BellRing,
  Brain,
  FileText,
  LineChart,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MEDICAL_DISCLAIMER, siteConfig } from "@/config/site";

const features = [
  {
    icon: Brain,
    title: "Analyse par IA",
    text: "Un moteur qui observe vos tendances et explique vos données en langage simple.",
  },
  {
    icon: LineChart,
    title: "Suivi quotidien",
    text: "Sommeil, stress, activité, nutrition, hydratation — visualisés en un coup d'œil.",
  },
  {
    icon: BellRing,
    title: "Alertes intelligentes",
    text: "Soyez prévenu quand un indicateur évolue de façon inhabituelle.",
  },
  {
    icon: FileText,
    title: "Rapports premium",
    text: "Rapports quotidiens, hebdomadaires et mensuels exportables en PDF.",
  },
  {
    icon: Target,
    title: "Objectifs & habitudes",
    text: "Fixez des objectifs, gardez votre streak et progressez chaque jour.",
  },
  {
    icon: ShieldCheck,
    title: "Confidentialité",
    text: "Vos données de santé sont chiffrées et vous appartiennent.",
  },
];

const scores = [
  { label: "Bien-être", value: 82 },
  { label: "Sommeil", value: 74 },
  { label: "Stress", value: 68 },
  { label: "Activité", value: 90 },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Commencer</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_-10%,var(--color-secondary)_0%,transparent_65%)]"
          />
          <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
            <span className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground shadow-sm">
              <Sparkles className="size-4 text-primary" />
              Prévention santé propulsée par l&apos;IA
            </span>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
              Votre santé, comprise{" "}
              <span className="text-primary">jour après jour</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground text-pretty">
              {siteConfig.name} suit vos habitudes, détecte les tendances et vous
              propose des conseils de prévention personnalisés. Ce n&apos;est pas
              un outil de diagnostic — c&apos;est votre allié bien-être.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup">Créer mon compte gratuit</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Link href="/login">J&apos;ai déjà un compte</Link>
              </Button>
            </div>

            {/* Score preview */}
            <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
              {scores.map((s) => (
                <Card key={s.label} className="py-5">
                  <CardContent className="flex flex-col items-center gap-3">
                    <div className="relative grid size-16 place-items-center">
                      <svg className="size-16 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          className="stroke-muted"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.5"
                          fill="none"
                          className="stroke-primary"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${(s.value / 100) * 97.4} 97.4`}
                        />
                      </svg>
                      <span className="absolute text-lg font-semibold">
                        {s.value}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {s.label}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Tout ce qu&apos;il faut pour prendre soin de vous
            </h2>
            <p className="mt-3 text-muted-foreground">
              Une expérience fluide inspirée d&apos;Apple Health et Google Fit.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-secondary text-accent">
                    <f.icon className="size-5" />
                  </span>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
          <Card className="overflow-hidden border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-center gap-5 py-12 text-center">
              <Activity className="size-10 text-primary" />
              <h2 className="max-w-xl text-2xl font-bold sm:text-3xl">
                Prenez une longueur d&apos;avance sur votre santé
              </h2>
              <Button asChild size="lg">
                <Link href="/signup">Démarrer maintenant</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 sm:px-6">
          <Logo />
          <p className="max-w-3xl text-xs text-muted-foreground">
            {MEDICAL_DISCLAIMER}
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
