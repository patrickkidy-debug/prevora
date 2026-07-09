"use client";

import * as React from "react";
import { AlertTriangle, Info, Stethoscope, X, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { setAlertStatus } from "@/app/(app)/alerts/actions";

interface AlertVM {
  id: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  recommendation: string | null;
  consultAdvised: boolean;
  status: string;
  createdAt: string;
}

const severityMap = {
  INFO: { icon: Info, variant: "secondary" as const, label: "Info" },
  WARNING: { icon: AlertTriangle, variant: "warning" as const, label: "Attention" },
  CRITICAL: { icon: AlertTriangle, variant: "destructive" as const, label: "Important" },
};

export function AlertCard({ alert }: { alert: AlertVM }) {
  const [pending, startTransition] = React.useTransition();
  const s = severityMap[alert.severity];
  const SIcon = s.icon;

  return (
    <Card className={alert.status === "READ" ? "opacity-70" : undefined}>
      <CardContent className="flex items-start gap-3 py-4">
        <span className="mt-0.5 text-warning">
          <SIcon className="size-5" />
        </span>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <p className="font-medium">{alert.title}</p>
            <Badge variant={s.variant}>{s.label}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{alert.message}</p>
          {alert.recommendation && (
            <p className="text-sm">{alert.recommendation}</p>
          )}
          {alert.consultAdvised && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <Stethoscope className="size-4" />
              Il est conseillé de consulter un professionnel de santé.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          {alert.status !== "READ" && (
            <Button
              size="icon"
              variant="ghost"
              aria-label="Marquer comme lu"
              disabled={pending}
              onClick={() =>
                startTransition(() => setAlertStatus(alert.id, "READ"))
              }
            >
              <Check className="size-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            aria-label="Ignorer"
            disabled={pending}
            onClick={() =>
              startTransition(() => setAlertStatus(alert.id, "DISMISSED"))
            }
          >
            <X className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
