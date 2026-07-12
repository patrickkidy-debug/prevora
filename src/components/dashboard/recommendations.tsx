import { Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/** Personalized recommendation cards (deterministic advice from the insights engine). */
export function Recommendations({ items }: { items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Recommandations personnalisées</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.slice(0, 4).map((t, i) => (
          <Card key={i} className="py-4 transition-shadow hover:shadow-md">
            <CardContent className="flex flex-col gap-2.5 px-4">
              <span className="grid size-9 place-items-center rounded-lg bg-secondary text-accent">
                <Lightbulb className="size-4.5" />
              </span>
              <p className="text-sm leading-snug text-muted-foreground">{t}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
