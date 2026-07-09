import { Sparkles, TrendingUp, Lightbulb, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { DailyInsight } from "@/lib/ai/health";

export function AiSummaryCard({
  insight,
  isLocked = false,
}: {
  insight: DailyInsight;
  isLocked?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-transparent h-full min-h-[220px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          Résumé IA
        </CardTitle>
      </CardHeader>
      
      {/* Blurred premium locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 p-6 backdrop-blur-md animate-in fade-in duration-300">
          <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lock className="size-5" />
          </div>
          <h3 className="font-semibold text-foreground text-sm">Conseils IA verrouillés</h3>
          <p className="text-xs text-muted-foreground text-center max-w-[280px] mt-1 mb-4">
            Abonnez-vous ou activez votre essai gratuit pour recevoir des analyses personnalisées de vos scores de santé.
          </p>
          <Button asChild size="sm" className="bg-primary text-white">
            <Link href="/subscription">
              Débloquer Premium
            </Link>
          </Button>
        </div>
      )}

      <CardContent className={`space-y-4 ${isLocked ? "filter blur-sm select-none pointer-events-none" : ""}`}>
        <p className="text-sm leading-relaxed">{insight.summary}</p>

        {insight.trends.length > 0 && (
          <div className="space-y-1.5">
            {insight.trends.slice(0, 3).map((t, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <TrendingUp className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        )}

        {insight.advice.length > 0 && (
          <div className="space-y-1.5 rounded-lg bg-secondary/60 p-3">
            {insight.advice.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{a}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-[0.7rem] leading-tight text-muted-foreground">
          {insight.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
}
