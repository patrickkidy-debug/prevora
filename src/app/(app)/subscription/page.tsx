import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserPremiumStatus } from "@/lib/premium";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Sparkles, CreditCard, CheckCircle2, History, AlertCircle, ShieldAlert, Award, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { startCheckoutAction } from "./actions";

export const metadata = { title: "Tarifs & Abonnement Prevora" };

export default async function SubscriptionPage() {
  const user = await requireUser();
  
  // Resolve current active tier
  const premiumStatus = getUserPremiumStatus({
    suspended: user.suspended,
    isPremium: user.isPremium,
    premiumExpiresAt: user.premiumExpiresAt,
    trialExpiresAt: user.trialExpiresAt,
    subscriptionTier: user.subscriptionTier,
  });

  const activeTier = premiumStatus.tier;

  // Retrieve user payments
  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const plans = [
    {
      id: "ESSENTIAL",
      name: "Offre Essential",
      price: "1 500",
      desc: "L'essentiel pour démarrer votre suivi de santé.",
      features: [
        "Questionnaire quotidien intelligent",
        "Score Santé Prevora de base",
        "Tableau de bord personnel",
        "Historique des 7 derniers jours",
        "Conseils de prévention de base",
        "Notifications quotidiennes",
        "Suivi sommeil, activité, eau et humeur",
      ],
      popular: false,
      buttonColor: "outline",
      buttonText: "Sélectionner Essential",
    },
    {
      id: "STANDARD",
      name: "Offre Standard",
      price: "3 500",
      desc: "L'expérience recommandée pour maximiser votre bien-être.",
      features: [
        "Toutes les fonctionnalités Essential",
        "Analyses IA avancées et conseils personnalisés",
        "Historique illimité des scores",
        "Rapports de santé hebdomadaires & mensuels",
        "Export complet de rapports en PDF",
        "Analyses détaillées des tendances",
        "Objectifs intelligents et adaptatifs",
        "Comparaison des progrès graphiques",
        "Notifications push intelligentes",
      ],
      popular: true,
      buttonColor: "bg-primary hover:bg-primary/95 text-white shadow-md border-primary-foreground/10",
      buttonText: "Passer à Standard",
    },
    {
      id: "PREMIUM",
      name: "Offre Premium",
      price: "5 000",
      desc: "L'accès exclusif et anticipé pour un suivi santé total.",
      features: [
        "Toutes les fonctionnalités Standard",
        "Prévisions de l'évolution du Score Santé",
        "Analyses approfondies des habitudes de vie",
        "Rapports Premium enrichis",
        "Intégration d'appareils de santé (ready)",
        "Accès prioritaire aux nouveautés",
        "Tableau de bord Premium exclusif",
      ],
      popular: false,
      buttonColor: "outline",
      buttonText: "Passer à Premium",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Nos Offres d&apos;Abonnement</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
          Choisissez l&apos;offre Prevora qui correspond le mieux à vos objectifs de prévention santé.
        </p>
      </div>

      {/* Current Subscription Status Info */}
      <Card className="border-border bg-gradient-to-br from-card to-secondary/30 shadow-sm max-w-3xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between gap-4 p-4 sm:p-6">
          <div>
            <CardTitle className="text-lg">Statut actuel</CardTitle>
            <CardDescription className="text-xs">Votre niveau d&apos;accès actif</CardDescription>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              activeTier === "PREMIUM"
                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                : activeTier === "STANDARD"
                  ? "bg-primary/15 text-primary"
                  : activeTier === "ESSENTIAL"
                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                    : "bg-slate-500/15 text-slate-600"
            }`}
          >
            {activeTier === "FREE" && premiumStatus.reason === "expired" ? (
              <>
                <AlertCircle className="size-3.5" /> Essai expiré (Standard)
              </>
            ) : activeTier === "FREE" ? (
              <>Standard (Gratuit)</>
            ) : (
              <>
                <Award className="size-3.5" /> Offre {activeTier}
              </>
            )}
          </span>
        </CardHeader>
        <CardContent className="text-sm p-4 pt-0 sm:p-6 sm:pt-0 space-y-1">
          {premiumStatus.reason === "trial" && (
            <p>
              Période d&apos;essai active. Accès complet débloqué jusqu&apos;au{" "}
              <strong>
                {format(premiumStatus.expiresAt!, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </strong>.
            </p>
          )}
          {premiumStatus.reason === "subscription" && (
            <p>
              Abonnement actif. Prochaine échéance de renouvellement le{" "}
              <strong>
                {premiumStatus.expiresAt
                  ? format(premiumStatus.expiresAt, "d MMMM yyyy", { locale: fr })
                  : "N/A"}
              </strong>.
            </p>
          )}
          {premiumStatus.reason === "expired" && (
            <p className="text-destructive font-medium">
              Votre essai gratuit de 1h30 est expiré. Veuillez vous abonner ci-dessous pour débloquer votre accès.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Annual Billing Block */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-center max-w-sm mx-auto shadow-sm animate-pulse">
        <p className="text-xs text-primary font-bold flex items-center justify-center gap-1.5">
          <Star className="size-3.5 text-primary" />
          Option annuelle (bientôt disponible) : Économisez 20% !
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3 items-stretch">
        {plans.map((p) => {
          const isCurrent = activeTier === p.id && premiumStatus.reason !== "expired";
          return (
            <Card
              key={p.id}
              className={`flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
                p.popular
                  ? "border-2 border-primary scale-[1.03] shadow-lg bg-gradient-to-b from-primary/5 via-card to-card"
                  : "border-border/60 shadow-sm hover:shadow-md"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary-foreground shadow">
                  Le plus populaire
                </span>
              )}

              <CardHeader>
                <CardTitle className="text-xl font-bold">{p.name}</CardTitle>
                <CardDescription className="text-xs mt-1 min-h-[32px]">{p.desc}</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-black">{p.price}</span>
                  <span className="text-sm font-semibold text-muted-foreground">FCFA / mois</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-3 pt-0">
                <div className="border-t border-border/60 my-2" />
                {p.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs leading-normal">
                    <CheckCircle2 className={`size-4 shrink-0 mt-0.5 ${p.popular ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                    <span>{feat}</span>
                  </div>
                ))}
              </CardContent>

              <CardFooter className="pt-4">
                {isCurrent ? (
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled>
                    Abonnement Actif
                  </Button>
                ) : (
                  <form action={startCheckoutAction} className="w-full">
                    <input type="hidden" name="tier" value={p.id} />
                    <Button
                      type="submit"
                      className="w-full gap-1.5"
                      variant={p.popular ? "default" : "outline"}
                    >
                      <CreditCard className="size-4" /> {p.buttonText}
                    </Button>
                  </form>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Payment History */}
      <Card className="max-w-3xl mx-auto shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="size-4 text-muted-foreground" />
            Historique des transactions
          </CardTitle>
          <CardDescription className="text-xs">Vos paiements récents en FCFA (XOF)</CardDescription>
        </CardHeader>
        <CardContent className="p-0 border-t">
          {payments.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Aucun paiement enregistré pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">Prevora {p.tier} — 1 Mois</p>
                    <p className="text-muted-foreground">
                      {format(new Date(p.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground font-mono">
                      {p.amount.toLocaleString()} FCFA
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 font-semibold text-[10px] ${
                        p.status === "SUCCESS"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : p.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {p.status === "SUCCESS" ? "Réussi" : p.status === "PENDING" ? "En attente" : "Échoué"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
