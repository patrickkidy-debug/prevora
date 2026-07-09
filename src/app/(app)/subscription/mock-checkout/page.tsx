import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CreditCard, ShieldCheck, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { simulatePaymentAction } from "../actions";

export const metadata = { title: "Simulateur de Paiement Moneroo" };

export default async function MockCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string }>;
}) {
  const user = await requireUser();
  const { paymentId } = await searchParams;

  if (!paymentId) {
    redirect("/subscription");
  }

  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, userId: user.id },
  });

  if (!payment || payment.status !== "PENDING") {
    redirect("/subscription");
  }

  // Define server action handlers for client trigger
  const handleSuccess = async () => {
    "use server";
    await simulatePaymentAction(paymentId, "SUCCESS");
    redirect("/subscription/callback?paymentId=" + paymentId + "&status=success");
  };

  const handleFailure = async () => {
    "use server";
    await simulatePaymentAction(paymentId, "FAILED");
    redirect("/subscription/callback?paymentId=" + paymentId + "&status=failure");
  };

  return (
    <div className="mx-auto max-w-md pt-8">
      <Card className="border-warning/50 bg-warning/5 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-warning/20 text-warning">
            <AlertTriangle className="size-6 animate-bounce" />
          </div>
          <CardTitle className="text-xl text-amber-700 dark:text-amber-500">
            Simulateur de Paiement Moneroo
          </CardTitle>
          <CardDescription className="text-amber-600/80">
            Ce mode est activé car aucune clé API Moneroo n&apos;est définie.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="rounded-lg bg-card p-4 border border-border/60 text-foreground">
            <div className="flex justify-between py-1">
              <span>Montant :</span>
              <strong className="font-semibold">{payment.amount.toLocaleString()} FCFA</strong>
            </div>
            <div className="flex justify-between py-1">
              <span>Description :</span>
              <span>Prevora {payment.tier} - 1 Mois</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Identifiant temporaire :</span>
              <span className="font-mono text-xs">{payment.monerooId}</span>
            </div>
          </div>
          <p className="text-center text-xs">
            Choisissez l&apos;issue du paiement que vous souhaitez simuler pour votre compte.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <form action={handleSuccess} className="w-full">
            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              <ShieldCheck className="size-4" /> Simuler un Paiement Réussi
            </Button>
          </form>
          <form action={handleFailure} className="w-full">
            <Button type="submit" variant="outline" className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 gap-2">
              <XCircle className="size-4" /> Simuler un Échec
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
