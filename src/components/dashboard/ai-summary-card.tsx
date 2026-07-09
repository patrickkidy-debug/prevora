import { Sparkles, TrendingUp, Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyInsight } from "@/lib/ai/health";

export function AiSummaryCard({ insight }: { insight: DailyInsight }) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          Résumé IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
