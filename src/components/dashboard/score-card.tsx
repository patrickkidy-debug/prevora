import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/icon";
import { ScoreRing } from "./score-ring";
import { scoreLabel } from "@/lib/scoring";
import { cn } from "@/lib/utils";

export function ScoreCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number | null;
  icon: string;
  color: string;
}) {
  const has = value != null;
  const { label: qualitative, tone } = scoreLabel(value ?? 0);

  return (
    <Card className="py-4">
      <CardContent className="flex items-center gap-4 px-4">
        <ScoreRing value={value ?? 0} size={64} color={color} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
            <Icon name={icon} className="size-4" />
            {label}
          </div>
          <p className="mt-1 text-2xl font-semibold">
            {has ? Math.round(value) : "—"}
            {has && <span className="text-sm text-muted-foreground">/100</span>}
          </p>
          {has && (
            <p className={cn("text-xs font-medium", tone)}>{qualitative}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
