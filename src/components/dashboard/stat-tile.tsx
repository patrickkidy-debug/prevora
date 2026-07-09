import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/icon";

export function StatTile({
  label,
  value,
  unit,
  icon,
  color = "var(--color-primary)",
}: {
  label: string;
  value: string | number;
  unit?: string;
  icon: string;
  color?: string;
}) {
  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-2 px-4">
        <span
          className="grid size-9 place-items-center rounded-lg"
          style={{ backgroundColor: `color-mix(in oklch, ${color} 15%, transparent)`, color }}
        >
          <Icon name={icon} className="size-4.5" />
        </span>
        <p className="text-2xl font-semibold tabular-nums">
          {value}
          {unit && (
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              {unit}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
