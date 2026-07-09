import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Vérification du paiement" };

// Server component to handle payment verification
export default async function CallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ paymentId?: string; status?: string; transaction_id?: string; id?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const paymentId = params.paymentId;
  const statusParam = params.status;
  const monerooTransactionId = params.transaction_id || params.id || params.paymentId;

  let isSuccess = false;
  let errorMsg = "";

  // 1. Handling Mock checkout callback
  if (paymentId && statusParam) {
    isSuccess = statusParam === "success";
    if (!isSuccess) {
      errorMsg = "La simulation de paiement a échoué ou a été annulée.";
    }
  } 
  // 2. Handling Real Moneroo checkout callback
  else if (monerooTransactionId) {
    // Look up pending payment record by Moneroo transaction ID
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { monerooId: monerooTransactionId },
          { id: paymentId }
        ],
        userId: user.id,
      },
    });

    if (payment) {
      if (payment.status === "SUCCESS") {
        isSuccess = true;
      } else {
        // Fetch transaction status from Moneroo API
        const secretKey = process.env.MONEROO_SECRET_KEY;
        if (secretKey) {
          try {
            const response = await fetch(`https://api.moneroo.io/v1/payments/${payment.monerooId}`, {
              headers: {
                "Authorization": `Bearer ${secretKey}`,
              },
            });
            if (response.ok) {
              const data = await response.json();
              // Check Moneroo's payment status, usually 'approved' or 'success'
              if (data.status === "approved" || data.status === "success") {
                // Update payment to SUCCESS
                await prisma.payment.update({
                  where: { id: payment.id },
                  data: { status: "SUCCESS" },
                });
                
                // Activate Premium
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);
                await prisma.user.update({
                  where: { id: user.id },
                  data: { isPremium: true, premiumExpiresAt: expiresAt },
                });

                isSuccess = true;
              } else {
                await prisma.payment.update({
                  where: { id: payment.id },
                  data: { status: "FAILED" },
                });
                errorMsg = `Le statut du paiement est : ${data.status}`;
              }
            } else {
              errorMsg = "Impossible de valider le paiement auprès de Moneroo.";
            }
          } catch (err) {
            console.error("Error verifying Moneroo payment:", err);
            errorMsg = "Une erreur s'est produite lors de la connexion à l'API Moneroo.";
          }
        } else {
          errorMsg = "Configuration Moneroo manquante sur le serveur.";
        }
      }
    } else {
      errorMsg = "Aucune transaction correspondante n'a été trouvée.";
    }
  } else {
    redirect("/subscription");
  }

  return (
    <div className="mx-auto max-w-md pt-12">
      {isSuccess ? (
        <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-xl text-center p-6 animate-in fade-in zoom-in-95 duration-500">
          <CardHeader>
            <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-10 animate-ping absolute opacity-30" />
              <CheckCircle2 className="size-10" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">
              Félicitations !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-foreground font-medium">
              Votre abonnement Prevora Premium est maintenant activé.
            </p>
            <p className="text-sm text-muted-foreground">
              Vous avez désormais accès à l&apos;intégralité des fonctionnalités : conseils santé IA, rapports détaillés et alertes en temps réel.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pt-4">
            <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              <Link href="/dashboard">
                Accéder au Tableau de bord
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
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
                Erreur : {errorMsg}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Veuillez réessayer ou contacter notre service client si le problème persiste.
            </p>
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
      )}
    </div>
  );
}
