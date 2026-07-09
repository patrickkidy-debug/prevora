"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Sparkles, TrendingUp, HelpCircle } from "lucide-react";
import Link from "next/link";

export interface ScoreDataPoint {
  label: string;
  value: number;
}

export function ScoreHistoryCharts({
  weeklyData,
  monthlyData,
  annualData,
  isPremium,
  predictions,
}: {
  weeklyData: ScoreDataPoint[];
  monthlyData: ScoreDataPoint[];
  annualData: ScoreDataPoint[];
  isPremium: boolean;
  predictions: ScoreDataPoint[];
}) {
  const [activeTab, setActiveTab] = React.useState("weekly");

  const getDataForTab = () => {
    switch (activeTab) {
      case "monthly":
        return monthlyData;
      case "annual":
        return annualData;
      default:
        return weeklyData;
    }
  };

  const chartData = getDataForTab();
  const isAnnualLocked = activeTab === "annual" && !isPremium;

  return (
    <div className="space-y-6">
      {/* Interactive Tabs curves selection */}
      <Tabs defaultValue="weekly" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card border rounded-xl p-2.5">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="weekly">Hebdomadaire</TabsTrigger>
            <TabsTrigger value="monthly">Mensuel</TabsTrigger>
            <TabsTrigger value="annual" className="relative">
              Annuel
              {!isPremium && <Lock className="ml-1 size-3 text-muted-foreground" />}
            </TabsTrigger>
          </TabsList>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Cliquez sur les onglets pour changer la période
          </span>
        </div>

        {/* Charts rendering zone */}
        <Card className="mt-4 relative overflow-hidden">
          {isAnnualLocked && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/70 backdrop-blur-md p-6 text-center animate-in fade-in duration-300">
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary mb-2">
                <Lock className="size-5" />
              </span>
              <h3 className="font-bold text-sm">Comparaison annuelle verrouillée</h3>
              <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
                Débloquez l&apos;historique annuel complet et comparez vos scores sur de longues périodes avec Prevora Premium.
              </p>
              <Button asChild size="sm">
                <Link href="/subscription">Passer à Premium</Link>
              </Button>
            </div>
          )}

          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Évolution du Score Santé</span>
              <span className="text-xs font-normal text-muted-foreground">Indice /100</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className={`h-64 pl-0 pr-3 ${isAnnualLocked ? "filter blur-sm select-none pointer-events-none" : ""}`}>
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Pas assez de données pour afficher le graphique.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2f6fd0" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#2f6fd0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={false}
                    width={32}
                    tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 12,
                      fontSize: 12,
                      color: "var(--color-popover-foreground)",
                    }}
                    formatter={(v) => [`Score : ${v}/100`]}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2f6fd0"
                    strokeWidth={3}
                    fill="url(#scoreGrad)"
                    connectNulls
                    dot={{ r: 3, strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </Tabs>

      {/* Predictions Module */}
      <Card className="relative overflow-hidden">
        {!isPremium && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/70 backdrop-blur-md p-6 text-center animate-in fade-in duration-300">
            <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary mb-2">
              <Sparkles className="size-5" />
            </span>
            <h3 className="font-bold text-sm">Prévisions de score Premium</h3>
            <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
              Laissez notre IA analyser vos tendances pour anticiper vos scores de bien-être sur les 7 prochains jours.
            </p>
            <Button asChild size="sm">
              <Link href="/subscription">Passer à Premium</Link>
            </Button>
          </div>
        )}

        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="size-4 text-primary animate-pulse" />
            Prévisions à 7 jours
          </CardTitle>
          <CardDescription>Projection de l&apos;évolution de votre Score Santé</CardDescription>
        </CardHeader>
        <CardContent className={`h-48 pl-0 pr-3 ${!isPremium ? "filter blur-sm select-none pointer-events-none" : ""}`}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={predictions} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" strokeDashoffset={2} vertical={false} stroke="var(--color-border)" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                width={30}
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                  fontSize: 11,
                }}
                formatter={(v) => [`Score projeté : ${v}/100`]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground flex justify-between">
          <span>* Basé sur vos tendances des 30 derniers jours.</span>
          <span className="text-emerald-500 font-semibold flex items-center gap-1">
            <TrendingUp className="size-3" /> Tendance stable
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
