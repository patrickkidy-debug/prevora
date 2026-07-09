import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Vérification du paiement" };

type Outcome = "success" | "failed" | "pending";

/**
 * PayTech confirms payments via IPN (webhook), which is the source of truth.
 * This page reflects the local payment status set by the IPN — it never
 * activates on the redirect query alone (which is spoofable).
 */
export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string; status?: string; token?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const paymentId = params.paymentId;
  const token = params.token;

  if (!paymentId && !token) redirect("/subscription");

  const payment =
    (paymentId
      ? await prisma.payment.findFirst({ where: { id: paymentId, userId: user.id } })
      : null) ??
    (token
      ? await prisma.payment.findFirst({ where: { providerRef: token, userId: user.id } })
      : null);

  let outcome: Outcome = "pending";
  let errorMsg = "";

  if (!payment) {
    outcome = "failed";
    errorMsg = "Aucune transaction correspondante n'a été trouvée.";
  } else if (payment.status === "SUCCESS") {
    outcome = "success";
  } else if (payment.status === "FAILED") {
    outcome = "failed";
    errorMsg = "Le paiement a échoué ou a été annulé.";
  }
  // else: still PENDING -> the IPN will finalize it shortly.

  if (outcome === "success") {
    return (
      <div className="mx-auto max-w-md pt-12">
        <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-xl text-center p-6 animate-in fade-in zoom-in-95 duration-500">
          <CardHeader>
            <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-10" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">
              Félicitations !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-foreground font-medium">
              Votre abonnement Prevora est maintenant activé.
            </p>
            <p className="text-sm text-muted-foreground">
              Vous avez accès à l&apos;intégralité des fonctionnalités de votre offre.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pt-4">
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href="/dashboard">Accéder au Tableau de bord</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (outcome === "pending") {
    return (
      <div className="mx-auto max-w-md pt-12">
        <Card className="border-amber-500/30 bg-amber-500/5 shadow-xl text-center p-6">
          <CardHeader>
            <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="size-10" />
            </div>
            <CardTitle className="text-2xl font-bold text-amber-700 dark:text-amber-500">
              Paiement en cours de confirmation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Nous finalisons la validation de votre paiement. Cela prend
              généralement quelques secondes. Rafraîchissez cette page dans un
              instant.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center gap-3 pt-4">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/subscription/callback?paymentId=${payment?.id ?? ""}`}>
                <RefreshCw className="size-4" /> Rafraîchir
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/dashboard">Tableau de bord</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md pt-12">
      <Card className="border-destructive/30 bg-destructive/5 shadow-xl text-center p-6 animate-in fade-in zoom-in-95 duration-500">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="size-10" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            Échec du paiement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-foreground font-medium">
            Nous n&apos;avons pas pu valider votre transaction.
          </p>
          {errorMsg && (
            <p className="text-xs font-mono bg-destructive/10 text-destructive p-2.5 rounded border border-destructive/20 text-left">
              {errorMsg}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pt-4 gap-3">
          <Button asChild variant="outline" className="flex-1">
            <Link href="/subscription">Réessayer</Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/dashboard">Retour</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
