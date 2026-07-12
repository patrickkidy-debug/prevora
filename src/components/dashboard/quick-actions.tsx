import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Icon } from "@/components/icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = [
  {
    icon: "clipboard-list",
    label: "Remplir le questionnaire",
    sub: "2 min",
    href: "/questionnaire",
  },
  { icon: "file-text", label: "Voir mes rapports", sub: "Analyses IA", href: "/reports" },
  { icon: "target", label: "Mes objectifs", sub: "Progression", href: "/goals" },
  {
    icon: "calendar-days",
    label: "Historique",
    sub: "Semaine · mois · année",
    href: "/history",
  },
];

export function QuickActions() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {actions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-accent">
              <Icon name={a.icon} className="size-4.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{a.label}</span>
              <span className="block text-xs text-muted-foreground">{a.sub}</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
