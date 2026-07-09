import { Target } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRecentEntries } from "@/server/entries";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { DeleteGoalButton } from "@/components/goals/delete-goal-button";

import { getUserPremiumStatus } from "@/lib/premium";
import { redirect } from "next/navigation";

export const metadata = { title: "Objectifs" };

const PERIOD_LABEL: Record<string, string> = {
  DAILY: "par jour",
  WEEKLY: "par semaine",
  MONTHLY: "par mois",
};

function currentValue(
  metric: string,
  period: string,
  entries: Record<string, unknown>[],
): number | null {
  const windowDays = period === "DAILY" ? 1 : period === "WEEKLY" ? 7 : 30;
  const slice = entries.slice(-windowDays);
  const vals = slice
    .map((e) => e[metric])
    .filter((v): v is number => typeof v === "number");
  if (vals.length === 0) return null;
  if (period === "DAILY") return vals[vals.length - 1];
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

export default async function GoalsPage() {
  const user = await requireUser();

  const premiumStatus = getUserPremiumStatus({
    suspended: user.suspended,
    isPremium: user.isPremium,
    premiumExpiresAt: user.premiumExpiresAt,
    trialExpiresAt: user.trialExpiresAt,
    subscriptionTier: user.subscriptionTier,
  });

  if (premiumStatus.tier === "FREE" && premiumStatus.reason === "expired") {
    redirect("/subscription");
  }

  const [goals, entries] = await Promise.all([
    prisma.goal.findMany({
      where: { userId: user.id, active: true },
      orderBy: { createdAt: "desc" },
    }),
    getRecentEntries(user.id, 30),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Objectifs</h1>
          <p className="text-sm text-muted-foreground">
            Fixez des cibles et suivez votre progression.
          </p>
        </div>
        <AddGoalDialog />
      </div>

      {goals.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-accent">
              <Target className="size-6" />
            </span>
            <p className="font-medium">Aucun objectif</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Ajoutez un premier objectif pour rester motivé au quotidien.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {goals.map((g) => {
            const cur = currentValue(
              g.metric,
              g.period,
              entries as unknown as Record<string, unknown>[],
            );
            const pct = cur != null ? Math.min(100, (cur / g.target) * 100) : 0;
            return (
              <Card key={g.id}>
                <CardContent className="space-y-3 py-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{g.label}</p>
                      <Badge variant="secondary" className="mt-1">
                        {PERIOD_LABEL[g.period]}
                      </Badge>
                    </div>
                    <DeleteGoalButton goalId={g.id} />
                  </div>
                  <Progress value={pct} />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>
                      {cur != null ? cur.toFixed(1) : "—"} {g.unit}
                    </span>
                    <span>
                      Cible : {g.target} {g.unit}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
