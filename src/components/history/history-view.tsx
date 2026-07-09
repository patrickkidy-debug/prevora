"use client";

import * as React from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getMonth,
  isSameDay,
  startOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  wellbeingScore: number | null;
  sleepHours: number | null;
  activityMinutes: number | null;
  hydrationGlasses: number | null;
  newSymptoms: string | null;
  comments: string | null;
}

function scoreColor(v: number | null): string {
  if (v == null) return "bg-muted text-muted-foreground";
  if (v >= 80) return "bg-success/20 text-success";
  if (v >= 60) return "bg-primary/20 text-primary";
  if (v >= 40) return "bg-warning/20 text-warning";
  return "bg-destructive/20 text-destructive";
}

export function HistoryView({ entries }: { entries: HistoryEntry[] }) {
  const [month, setMonth] = React.useState(() => startOfMonth(new Date()));
  const [query, setQuery] = React.useState("");

  const byDate = React.useMemo(() => {
    const m = new Map<string, HistoryEntry>();
    for (const e of entries) m.set(e.date, e);
    return m;
  }, [entries]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.date.includes(q) ||
        e.newSymptoms?.toLowerCase().includes(q) ||
        e.comments?.toLowerCase().includes(q),
    );
  }, [entries, query]);

  // Month grid days (padded to full weeks).
  const gridDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  // Year: average wellbeing per month.
  const yearAvg = React.useMemo(() => {
    const buckets: { sum: number; n: number }[] = Array.from(
      { length: 12 },
      () => ({ sum: 0, n: 0 }),
    );
    for (const e of entries) {
      if (e.wellbeingScore == null) continue;
      const m = getMonth(new Date(`${e.date}T00:00:00`));
      buckets[m].sum += e.wellbeingScore;
      buckets[m].n += 1;
    }
    return buckets.map((b) => (b.n ? Math.round(b.sum / b.n) : null));
  }, [entries]);

  const week = entries.slice(-7).reverse();

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher (date, symptôme, note)…"
          className="pl-9"
        />
      </div>

      {query ? (
        <EntryList entries={filtered} emptyLabel="Aucun résultat" />
      ) : (
        <Tabs defaultValue="month">
          <TabsList className="w-full">
            <TabsTrigger value="week">Semaine</TabsTrigger>
            <TabsTrigger value="month">Mois</TabsTrigger>
            <TabsTrigger value="year">Année</TabsTrigger>
          </TabsList>

          <TabsContent value="week">
            <EntryList entries={week} emptyLabel="Aucune donnée cette semaine" />
          </TabsContent>

          <TabsContent value="month">
            <Card>
              <CardContent className="space-y-3 py-5">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMonth((m) => addMonths(m, -1))}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="font-medium capitalize">
                    {format(month, "MMMM yyyy", { locale: fr })}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMonth((m) => addMonths(m, 1))}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                  {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                    <span key={i}>{d}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {gridDays.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const entry = byDate.get(key);
                    const inMonth = getMonth(day) === getMonth(month);
                    const today = isSameDay(day, new Date());
                    return (
                      <div
                        key={key}
                        className={cn(
                          "flex aspect-square flex-col items-center justify-center rounded-lg text-xs",
                          inMonth ? scoreColor(entry?.wellbeingScore ?? null) : "opacity-30",
                          today && "ring-2 ring-primary",
                        )}
                        title={
                          entry?.wellbeingScore != null
                            ? `${entry.wellbeingScore}/100`
                            : undefined
                        }
                      >
                        <span>{format(day, "d")}</span>
                        {entry?.wellbeingScore != null && (
                          <span className="text-[0.6rem] font-semibold">
                            {entry.wellbeingScore}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="year">
            <Card>
              <CardContent className="py-5">
                <div className="flex h-48 items-end gap-2">
                  {yearAvg.map((v, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-1">
                      <div className="flex w-full flex-1 items-end">
                        <div
                          className="w-full rounded-t bg-primary/70"
                          style={{ height: `${v ?? 0}%` }}
                        />
                      </div>
                      <span className="text-[0.6rem] text-muted-foreground">
                        {format(new Date(2024, i, 1), "MMM", { locale: fr })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

function EntryList({
  entries,
  emptyLabel,
}: {
  entries: HistoryEntry[];
  emptyLabel: string;
}) {
  if (entries.length === 0)
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    );

  return (
    <div className="space-y-2">
      {[...entries].reverse().map((e) => (
        <Card key={e.date}>
          <CardContent className="flex items-center justify-between gap-3 py-3">
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-11 place-items-center rounded-xl text-sm font-semibold",
                  scoreColor(e.wellbeingScore),
                )}
              >
                {e.wellbeingScore ?? "—"}
              </span>
              <div>
                <p className="text-sm font-medium capitalize">
                  {format(new Date(`${e.date}T00:00:00`), "EEEE d MMM", {
                    locale: fr,
                  })}
                </p>
                {e.newSymptoms && (
                  <p className="text-xs text-muted-foreground">
                    {e.newSymptoms}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-1">
              {e.sleepHours != null && (
                <Badge variant="secondary">{e.sleepHours} h</Badge>
              )}
              {e.activityMinutes != null && (
                <Badge variant="secondary">{e.activityMinutes} min</Badge>
              )}
              {e.hydrationGlasses != null && (
                <Badge variant="secondary">{e.hydrationGlasses} 💧</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
