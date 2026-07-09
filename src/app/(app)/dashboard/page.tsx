import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Flame, Plus, AlertTriangle, ArrowRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getRecentEntries, getEntryForDate } from "@/server/entries";
import { generateDailyInsight } from "@/lib/ai/health";
import { analyzeEntries } from "@/lib/insights";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreRing } from "@/components/dashboard/score-ring";
import { ScoreCard } from "@/components/dashboard/score-card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { AiSummaryCard } from "@/components/dashboard/ai-summary-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { scoreLabel } from "@/lib/scoring";

export const metadata = { title: "Tableau de bord" };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const [recent, today] = await Promise.all([
    getRecentEntries(user.id, 30),
    getEntryForDate(user.id, new Date()),
  ]);

  const insight = await generateDailyInsight(recent);
  const analysis = analyzeEntries(recent);

  const wb = today?.wellbeingScore ?? analysis.averages.wellbeingScore ?? null;
  const streak = user.streak?.current ?? 0;

  const last14 = recent.slice(-14);
  const wbData = last14.map((e) => ({
    label: format(e.date, "dd/MM"),
    value: e.wellbeingScore,
  }));
  const sleepData = last14.map((e) => ({
    label: format(e.date, "dd/MM"),
    value: e.sleepHours,
  }));

  const firstName = user.name?.split(" ")[0] ?? "";
  const criticalAlerts = analysis.alerts.filter((a) => a.consultAdvised);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm capitalize text-muted-foreground">
            {format(new Date(), "EEEE d MMMM", { locale: fr })}
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {greeting()} {firstName} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <Badge variant="warning" className="gap-1">
              <Flame className="size-3.5" /> {streak} jour{streak > 1 ? "s" : ""}
            </Badge>
          )}
          <Button asChild size="sm">
            <Link href="/questionnaire">
              <Plus className="size-4" />
              {today ? "Modifier aujourd'hui" : "Compléter aujourd'hui"}
            </Link>
          </Button>
        </div>
      </div>

      {recent.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Wellbeing hero + AI */}
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Score bien-être</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-2">
                <ScoreRing
                  value={wb ?? 0}
                  size={160}
                  strokeWidth={3}
                  color="var(--color-score-wellbeing)"
                  label={
                    <span className="flex flex-col items-center">
                      <span className="text-4xl font-bold">
                        {wb != null ? Math.round(wb) : "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </span>
                  }
                />
                {wb != null && (
                  <p className={`text-sm font-medium ${scoreLabel(wb).tone}`}>
                    {scoreLabel(wb).label}
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="lg:col-span-2">
              <AiSummaryCard insight={insight} />
            </div>
          </div>

          {/* Critical alerts */}
          {criticalAlerts.length > 0 && (
            <Card className="border-warning/40 bg-warning/5">
              <CardContent className="flex items-start gap-3 py-4">
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    {criticalAlerts[0].title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {criticalAlerts[0].message} {criticalAlerts[0].recommendation}
                  </p>
                  <Link
                    href="/alerts"
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Voir toutes les alertes <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Score cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ScoreCard
              label="Sommeil"
              value={today?.sleepScore ?? null}
              icon="moon"
              color="var(--color-score-sleep)"
            />
            <ScoreCard
              label="Stress"
              value={today?.stressScore ?? null}
              icon="activity"
              color="var(--color-score-stress)"
            />
            <ScoreCard
              label="Activité"
              value={today?.activityScore ?? null}
              icon="footprints"
              color="var(--color-score-activity)"
            />
            <ScoreCard
              label="Nutrition"
              value={today?.nutritionScore ?? null}
              icon="apple"
              color="var(--color-score-nutrition)"
            />
            <ScoreCard
              label="Hydratation"
              value={today?.hydrationScore ?? null}
              icon="droplet"
              color="var(--color-score-hydration)"
            />
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile
              label="Hydratation"
              value={today?.hydrationGlasses ?? "—"}
              unit="verres"
              icon="droplet"
              color="var(--color-score-hydration)"
            />
            <StatTile
              label="Activité"
              value={today?.activityMinutes ?? "—"}
              unit="min"
              icon="footprints"
              color="var(--color-score-activity)"
            />
            <StatTile
              label="Sommeil"
              value={today?.sleepHours ?? "—"}
              unit="h"
              icon="moon"
              color="var(--color-score-sleep)"
            />
            <StatTile
              label="Poids"
              value={today?.weightKg ?? "—"}
              unit="kg"
              icon="scale"
              color="var(--color-primary)"
            />
          </div>

          {/* Charts */}
          <div className="grid gap-4 lg:grid-cols-2">
            <TrendChart
              title="Bien-être (14 j)"
              data={wbData}
              color="var(--color-score-wellbeing)"
            />
            <TrendChart
              title="Sommeil (14 j)"
              data={sleepData}
              color="var(--color-score-sleep)"
              domain={[0, 12]}
              unit="h"
            />
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-accent">
          <Plus className="size-7" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">Commencez votre suivi</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Complétez votre premier questionnaire quotidien pour débloquer vos
            scores, tendances et conseils personnalisés.
          </p>
        </div>
        <Button asChild>
          <Link href="/questionnaire">
            <Plus className="size-4" /> Compléter le questionnaire
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
