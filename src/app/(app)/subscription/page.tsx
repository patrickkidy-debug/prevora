import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserPremiumStatus } from "@/lib/premium";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Sparkles, CreditCard, FileText, CheckCircle2, History, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { startCheckoutAction } from "./actions";

export const metadata = { title: "Abonnement Prevora" };

export default async function SubscriptionPage() {
  const user = await requireUser();
  
  // Get premium status
  const premiumStatus = getUserPremiumStatus({
    suspended: user.suspended,
    isPremium: user.isPremium,
    premiumExpiresAt: user.premiumExpiresAt,
    trialExpiresAt: user.trialExpiresAt,
  });

  // Get payment history
  const payments = await prisma.payment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Espace Premium</h1>
        <p className="text-muted-foreground">
          Gérez votre abonnement Prevora et accédez à vos fonctionnalités premium.
        </p>
      </div>

      {/* Current Status Card */}
      <Card className="border-border/60 bg-gradient-to-br from-card to-secondary/30 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Statut de votre compte</CardTitle>
            <CardDescription>Votre situation d&apos;accès actuelle</CardDescription>
          </div>
          {premiumStatus.isPremium ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
              Actif (Premium)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-sm font-medium text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-4" />
              Standard (Gratuit)
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {premiumStatus.reason === "trial" && (
            <p className="text-sm">
              Vous êtes actuellement dans votre période d&apos;essai gratuit. Elle expire le{" "}
              <strong className="font-semibold text-primary">
                {format(premiumStatus.expiresAt!, "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </strong>.
            </p>
          )}
          {premiumStatus.reason === "subscription" && (
            <p className="text-sm">
              Votre abonnement mensuel est actif. Prochain renouvellement le{" "}
              <strong className="font-semibold text-primary">
                {premiumStatus.expiresAt
                  ? format(premiumStatus.expiresAt, "d MMMM yyyy", { locale: fr })
                  : "N/A"}
              </strong>.
            </p>
          )}
          {premiumStatus.reason === "expired" && (
            <p className="text-sm text-destructive font-medium">
              Votre période d&apos;essai gratuit est expirée. Abonnez-vous pour débloquer l&apos;accès à vos outils.
            </p>
          )}
          {premiumStatus.reason === "none" && (
            <p className="text-sm">
              Vous utilisez la version gratuite limitée. Abonnez-vous pour profiter de Prevora sans limites.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Free details */}
        <Card className="flex flex-col justify-between border-border/40">
          <CardHeader>
            <CardTitle className="text-xl">Prevora Standard</CardTitle>
            <CardDescription>Gratuit pour toujours</CardDescription>
            <div className="mt-4 text-3xl font-bold">0 €<span className="text-sm font-normal text-muted-foreground">/mois</span></div>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              Questionnaire quotidien intelligent
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              Historique de base des scores
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
              PWA hors ligne locale
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>Plan Actuel</Button>
          </CardFooter>
        </Card>

        {/* Premium Plan Moneroo */}
        <Card className="relative flex flex-col justify-between border-primary/50 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground shadow">
            Recommandé
          </div>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="size-5 text-primary animate-pulse" />
              Prevora Premium
            </CardTitle>
            <CardDescription>Toutes les fonctionnalités débloquées</CardDescription>
            <div className="mt-4 text-3xl font-bold">9.99 €<span className="text-sm font-normal text-muted-foreground">/mois</span></div>
          </CardHeader>
          <CardContent className="flex-1 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 shrink-0 text-primary" />
              <span><strong>Conseils IA</strong> quotidiens personnalisés</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 shrink-0 text-primary" />
              <span><strong>Rapports de santé</strong> hebdomadaires/mensuels</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 shrink-0 text-primary" />
              <span>Export complet de rapports en <strong>PDF</strong></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 shrink-0 text-primary" />
              <span>Suivi avancé des constantes et alertes critiques</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 shrink-0 text-primary" />
              <span>Support prioritaire et nouveautés exclusives</span>
            </div>
          </CardContent>
          <CardFooter>
            {premiumStatus.reason === "subscription" ? (
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700" disabled>
                Abonnement Actif
              </Button>
            ) : (
              <form action={startCheckoutAction} className="w-full">
                <Button type="submit" className="w-full bg-primary hover:bg-primary/95 text-white">
                  <CreditCard className="size-4" /> Passer à Premium
                </Button>
              </form>
            )}
          </CardFooter>
        </Card>
      </div>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="size-4" />
            Historique des paiements
          </CardTitle>
          <CardDescription>Vos dernières factures et transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Aucun paiement enregistré pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium">Prevora Premium — 1 Mois</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(p.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{p.amount.toFixed(2)} €</span>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
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
