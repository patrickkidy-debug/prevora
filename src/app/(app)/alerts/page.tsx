import { BellRing } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AlertCard } from "@/components/alerts/alert-card";
import { Card, CardContent } from "@/components/ui/card";
import { MEDICAL_DISCLAIMER } from "@/config/site";

export const metadata = { title: "Alertes" };

export default async function AlertsPage() {
  const user = await requireUser();
  const alerts = await prisma.alert.findMany({
    where: { userId: user.id, status: { in: ["ACTIVE", "READ"] } },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alertes intelligentes</h1>
        <p className="text-sm text-muted-foreground">
          Détectées à partir de vos tendances récentes.
        </p>
      </div>

      {alerts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-accent">
              <BellRing className="size-6" />
            </span>
            <p className="font-medium">Aucune alerte pour le moment</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Continuez votre suivi quotidien. Nous vous préviendrons si un
              indicateur évolue de façon inhabituelle.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <AlertCard
              key={a.id}
              alert={{
                id: a.id,
                severity: a.severity,
                title: a.title,
                message: a.message,
                recommendation: a.recommendation,
                consultAdvised: a.consultAdvised,
                status: a.status,
                createdAt: a.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">{MEDICAL_DISCLAIMER}</p>
    </div>
  );
}
