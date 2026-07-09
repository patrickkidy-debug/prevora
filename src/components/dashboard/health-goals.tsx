"use client";

import * as React from "react";
import { Moon, Droplet, Footprints, Activity, ClipboardCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function HealthGoals({
  todayEntry,
}: {
  todayEntry: {
    sleepHours?: number | null;
    hydrationGlasses?: number | null;
    activityMinutes?: number | null;
    stress?: number | null;
  } | null;
}) {
  const sleep = todayEntry?.sleepHours ?? 0;
  const hydration = todayEntry?.hydrationGlasses ?? 0;
  const activity = todayEntry?.activityMinutes ?? 0;
  const stress = todayEntry?.stress ?? null;
  const quizDone = todayEntry !== null;

  // Calculate percentages
  const sleepPct = Math.min(100, Math.round((sleep / 8) * 100));
  const hydrationPct = Math.min(100, Math.round((hydration / 8) * 100));
  const activityPct = Math.min(100, Math.round((activity / 30) * 100));
  const stressPct = stress !== null ? Math.round(((10 - stress) / 6) * 100) : 0; // Stress <= 4 is 100%
  const quizPct = quizDone ? 100 : 0;

  const goals = [
    {
      id: "quiz",
      label: "Questionnaire quotidien",
      desc: "Remplir le questionnaire aujourd'hui",
      pct: quizPct,
      valueText: quizDone ? "Complété" : "À faire",
      icon: ClipboardCheck,
      color: "bg-emerald-500",
    },
    {
      id: "sleep",
      label: "Sommeil réparateur",
      desc: "Viser 8 heures de sommeil",
      pct: sleepPct,
      valueText: `${sleep.toFixed(1)}h / 8h`,
      icon: Moon,
      color: "bg-blue-500",
    },
    {
      id: "hydration",
      label: "Hydratation optimale",
      desc: "Boire 8 verres d'eau",
      pct: hydrationPct,
      valueText: `${hydration} / 8 verres`,
      icon: Droplet,
      color: "bg-cyan-500",
    },
    {
      id: "activity",
      label: "Activité physique",
      desc: "Bouger 30 minutes minimum",
      pct: activityPct,
      valueText: `${activity} / 30 min`,
      icon: Footprints,
      color: "bg-orange-500",
    },
    {
      id: "stress",
      label: "Gestion du stress",
      desc: "Maintenir le stress à 4/10 ou moins",
      pct: stress !== null && stress <= 4 ? 100 : stress !== null ? Math.max(0, 100 - (stress - 4) * 16) : 0,
      valueText: stress !== null ? `Niveau : ${stress}/10` : "Non évalué",
      icon: Activity,
      color: "bg-indigo-500",
    },
  ];

  const completedCount = goals.filter((g) => g.pct >= 100).length;

  return (
    <Card className="border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary animate-pulse" />
            Objectifs quotidiens de score
          </span>
          {completedCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-3.5" />
              {completedCount} / 5 complétés
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Améliorez ces habitudes pour augmenter directement votre Score Santé.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((g) => {
          const GoalIcon = g.icon;
          const isDone = g.pct >= 100;

          return (
            <div key={g.id} className="space-y-1.5 p-3 rounded-lg border border-border/40 bg-secondary/20 hover:bg-secondary/40 transition-colors">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`grid size-7 place-items-center rounded bg-background text-foreground border shadow-sm`}>
                    <GoalIcon className={`size-4 ${isDone ? "text-emerald-500 animate-bounce" : "text-muted-foreground"}`} />
                  </span>
                  <div>
                    <p className={`font-semibold ${isDone ? "text-emerald-600 dark:text-emerald-400 line-through opacity-80" : "text-foreground"}`}>
                      {g.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{g.desc}</p>
                  </div>
                </div>
                <span className="font-mono font-bold">{g.valueText}</span>
              </div>
              <Progress value={g.pct} className="h-1.5" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
