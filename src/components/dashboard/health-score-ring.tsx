"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight, ArrowDownRight, Minus, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const CIRCUMFERENCE = 2 * Math.PI * 70; // r=70 inside a 160x160 viewBox

export function HealthScoreRing({
  score,
  diffYesterday,
  diff7Days,
  diff30Days,
  explanations,
}: {
  score: number;
  diffYesterday: number | null;
  diff7Days: number | null;
  diff30Days: number | null;
  explanations: string[];
}) {
  // Determine color coding based on score
  let scoreColor = "#ef4444"; // Red
  let scoreLabel = "À surveiller";
  let scoreBg = "bg-destructive/10 text-destructive";

  if (score >= 80) {
    scoreColor = "#10b981"; // Green
    scoreLabel = "Excellent";
    scoreBg = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  } else if (score >= 60) {
    scoreColor = "#3b82f6"; // Blue
    scoreLabel = "Bon";
    scoreBg = "bg-blue-500/10 text-blue-600 dark:text-blue-400";
  } else if (score >= 40) {
    scoreColor = "#eab308"; // Yellow
    scoreLabel = "Moyen";
    scoreBg = "bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }

  // Animation values for dash offset
  const pct = Math.max(0, Math.min(100, score));
  const strokeDashoffset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  const renderTrendBadge = (diff: number | null, label: string) => {
    if (diff === null) return <span className="text-muted-foreground">— {label}</span>;
    if (diff > 0) {
      return (
        <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-semibold">
          <ArrowUpRight className="size-3.5" /> +{diff} {label}
        </span>
      );
    }
    if (diff < 0) {
      return (
        <span className="flex items-center gap-0.5 text-destructive font-semibold">
          <ArrowDownRight className="size-3.5" /> {diff} {label}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-0.5 text-muted-foreground">
        <Minus className="size-3.5" /> 0 {label}
      </span>
    );
  };

  return (
    <Card className="border-border bg-gradient-to-br from-card via-card to-secondary/20 shadow-md">
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-[200px_1fr] items-center">
          {/* Animated Circular SVG */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative size-40 flex items-center justify-center">
              <svg className="-rotate-90 size-40" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  className="stroke-muted/40"
                  strokeWidth="8"
                />
                {/* Progressive Animated Foreground Ring */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  initial={{ strokeDashoffset: CIRCUMFERENCE }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              {/* Inner score label text */}
              <div className="absolute flex flex-col items-center leading-none">
                <span className="text-4xl font-extrabold tracking-tight font-mono">
                  {score}
                </span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground mt-1">
                  /100
                </span>
              </div>
            </div>

            {/* Score Label Tag */}
            <span className={`mt-3 rounded-full px-3 py-0.5 text-xs font-semibold ${scoreBg} animate-pulse`}>
              {scoreLabel}
            </span>
          </div>

          {/* Details and Explanations */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold tracking-tight">Score Santé Prevora</h3>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <AlertCircle className="size-3.5" />
                Indicateur bien-être & prévention — Sans valeur de diagnostic médical.
              </p>
            </div>

            {/* Micro trends */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-medium border-y py-2.5">
              {renderTrendBadge(diffYesterday, "vs la veille")}
              {renderTrendBadge(diff7Days, "sur 7j")}
              {renderTrendBadge(diff30Days, "sur 30j")}
            </div>

            {/* Summaries list */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Sparkles className="size-3 text-primary animate-pulse" />
                Facteurs clés du jour :
              </p>
              <ul className="text-xs space-y-1.5 text-foreground leading-relaxed">
                {explanations.map((exp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-primary shrink-0" />
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* View history details buttons */}
            <div className="flex gap-2 pt-2">
              <Button asChild size="sm" variant="secondary" className="gap-1">
                <Link href="/health-score">
                  <TrendingUp className="size-4" /> Analyse historique
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
