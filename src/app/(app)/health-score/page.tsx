import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserPremiumStatus } from "@/lib/premium";
import { format, subDays, startOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, Sparkles, Award, Star, CheckCircle2, ChevronRight, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ScoreHistoryCharts, type ScoreDataPoint } from "@/components/health-score/score-history-charts";

export const metadata = { title: "Détails Score Santé Prevora" };

export default async function HealthScorePage() {
  const user = await requireUser();
  const premiumStatus = getUserPremiumStatus(user);
  const isPremium = premiumStatus.isPremium;

  // Retrieve user entries
  const entries = await prisma.dailyEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" },
  });

  // Calculate KPIs
  const scores = entries.map((e) => e.wellbeingScore).filter((s) => s !== null) as number[];
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const totalEntries = entries.length;

  // 1. Weekly Data (last 7 entries)
  const last7 = entries.slice(-7);
  const weeklyData: ScoreDataPoint[] = last7.map((e) => ({
    label: format(new Date(e.date), "dd/MM"),
    value: e.wellbeingScore ?? 0,
  }));

  // 2. Monthly Data (last 30 entries)
  const last30 = entries.slice(-30);
  const monthlyData: ScoreDataPoint[] = last30.map((e) => ({
    label: format(new Date(e.date), "dd/MM"),
    value: e.wellbeingScore ?? 0,
  }));

  // 3. Annual Data (grouped by month)
  // Let's group scores by month name
  const monthlyAverages: Record<string, { sum: number; count: number }> = {};
  entries.forEach((e) => {
    const monthKey = format(new Date(e.date), "MMM yyyy", { locale: fr });
    if (!monthlyAverages[monthKey]) {
      monthlyAverages[monthKey] = { sum: 0, count: 0 };
    }
    if (e.wellbeingScore !== null) {
      monthlyAverages[monthKey].sum += e.wellbeingScore;
      monthlyAverages[monthKey].count += 1;
    }
  });

  const annualData: ScoreDataPoint[] = Object.entries(monthlyAverages).map(([label, data]) => ({
    label,
    value: data.count > 0 ? Math.round(data.sum / data.count) : 0,
  })).slice(-12); // Last 12 months

  // 4. Future Predictions (7 days projection)
  const latestScore = scores.length > 0 ? scores[scores.length - 1] : 70;
  const predictions: ScoreDataPoint[] = Array.from({ length: 7 }).map((_, i) => {
    const projDate = format(subDays(new Date(), -i - 1), "dd/MM");
    // Mock a slight progress trend
    const variations = [0, 1, 1, 2, 1, 2, 2];
    return {
      label: projDate,
      value: Math.min(100, latestScore + variations[i]),
    };
  });

  // 5. Badges achievements check
  const streakCount = user.streak?.current ?? 0;
  const maxStreak = user.streak?.longest ?? 0;

  const badges = [
    {
      code: "first_quiz",
      name: "Pionnier Santé",
      desc: "Remplir son premier questionnaire",
      unlocked: totalEntries >= 1,
      icon: "🌱",
    },
    {
      code: "streak_7",
      name: "Régularité de Bronze",
      desc: "7 jours de questionnaire consécutifs",
      unlocked: maxStreak >= 7,
      icon: "🥉",
    },
    {
      code: "score_80",
      name: "Super Forme",
      desc: "Atteindre un score supérieur à 80",
      unlocked: bestScore >= 80,
      icon: "⚡",
    },
    {
      code: "premium_member",
      name: "Membre Protect",
      desc: "S'abonner à Prevora Premium",
      unlocked: isPremium,
      icon: "👑",
    },
  ];

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique & Tendances</h1>
          <p className="text-muted-foreground">
            Suivez l&apos;évolution de votre Score Santé Prevora au fil du temps.
          </p>
        </div>
        {!isPremium && (
          <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1">
            <Link href="/subscription">
              <Lock className="size-3.5" /> Débloquer les analyses Premium
            </Link>
          </Button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-muted-foreground">
              Score moyen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-mono text-primary">
              {avgScore > 0 ? avgScore : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Sur l&apos;ensemble de vos saisies</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-muted-foreground">
              Meilleur score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {bestScore > 0 ? bestScore : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Votre record historique</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-semibold text-muted-foreground">
              Saisies totales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black font-mono">
              {totalEntries}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Jours de suivi complétés</p>
          </CardContent>
        </Card>
      </div>

      {/* History curves & predictions */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px] items-start">
        <div className="space-y-6">
          <ScoreHistoryCharts
            weeklyData={weeklyData}
            monthlyData={monthlyData}
            annualData={annualData}
            isPremium={isPremium}
            predictions={predictions}
          />
        </div>

        {/* Gamification / Badges Panel */}
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Award className="size-4 text-amber-500" />
                Récompenses & Badges
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {unlockedCount} / {badges.length}
              </span>
            </CardTitle>
            <CardDescription>Vos accomplissements santé Prevora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {badges.map((b) => (
              <div
                key={b.code}
                className={`flex gap-3 items-center p-3 rounded-lg border border-border/40 ${
                  b.unlocked
                    ? "bg-emerald-500/5 border-emerald-500/10 text-foreground"
                    : "bg-secondary/20 text-muted-foreground opacity-60"
                }`}
              >
                <span className="text-2xl shrink-0">{b.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold leading-tight">{b.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{b.desc}</p>
                </div>
                {b.unlocked && (
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 animate-bounce" />
                )}
              </div>
            ))}

            {/* Quick motivators */}
            <div className="rounded-lg bg-primary/5 p-4 border border-primary/10 space-y-2 mt-4">
              <p className="text-xs font-bold text-primary flex items-center gap-1">
                <Star className="size-3 text-primary animate-spin" style={{ animationDuration: "8s" }} />
                Conseil motivation :
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Maintenez votre suivi quotidien actif ! Remplir votre questionnaire aujourd&apos;hui préserve votre série de <strong>{streakCount} jours consécutifs</strong>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
