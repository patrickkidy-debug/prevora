import { Flame, Star, Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  BADGES,
  CHALLENGES,
  computeProgress,
  type UserStats,
} from "@/config/gamification";
import { cn } from "@/lib/utils";

import { getUserPremiumStatus } from "@/lib/premium";
import { redirect } from "next/navigation";

export const metadata = { title: "Récompenses" };

export default async function AchievementsPage() {
  const user = await requireUser();

  const premiumStatus = getUserPremiumStatus({
    suspended: user.suspended,
    isPremium: user.isPremium,
    premiumExpiresAt: user.premiumExpiresAt,
    trialExpiresAt: user.trialExpiresAt,
    subscriptionTier: user.subscriptionTier,
  });

  if (premiumStatus.tier === "FREE" && premiumStatus.reason === "expired") {
    redirect("/subscription");
  }

  const [totalEntries, reportsCount, streak] = await Promise.all([
    prisma.dailyEntry.count({ where: { userId: user.id } }),
    prisma.report.count({ where: { userId: user.id } }),
    prisma.streak.findUnique({ where: { userId: user.id } }),
  ]);

  const stats: UserStats = {
    totalEntries,
    reportsCount,
    currentStreak: streak?.current ?? 0,
    longestStreak: streak?.longest ?? 0,
  };
  const { level, xp, xpIntoLevel } = computeProgress(stats);
  const earned = BADGES.filter((b) => b.unlocked(stats));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Récompenses</h1>
        <p className="text-sm text-muted-foreground">
          Vos progrès, badges et défis.
        </p>
      </div>

      {/* Level + streak */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <span className="grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
              <Star className="size-6" />
            </span>
            <div>
              <p className="text-2xl font-bold">Niveau {level}</p>
              <p className="text-xs text-muted-foreground">{xp} XP</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <span className="grid size-12 place-items-center rounded-2xl bg-warning/15 text-warning">
              <Flame className="size-6" />
            </span>
            <div>
              <p className="text-2xl font-bold">{stats.currentStreak} j</p>
              <p className="text-xs text-muted-foreground">
                Record : {stats.longestStreak} j
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <span className="grid size-12 place-items-center rounded-2xl bg-success/15 text-success">
              <Trophy className="size-6" />
            </span>
            <div>
              <p className="text-2xl font-bold">
                {earned.length}/{BADGES.length}
              </p>
              <p className="text-xs text-muted-foreground">Badges</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progression niveau {level}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Progress value={xpIntoLevel} />
          <p className="text-xs text-muted-foreground">
            {xpIntoLevel}/100 XP vers le niveau {level + 1}
          </p>
        </CardContent>
      </Card>

      {/* Badges */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Badges</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {BADGES.map((b) => {
            const unlocked = b.unlocked(stats);
            return (
              <Card key={b.code} className={cn(!unlocked && "opacity-45")}>
                <CardContent className="flex flex-col items-center gap-1.5 py-5 text-center">
                  <span className="text-3xl grayscale-0" style={{ filter: unlocked ? "none" : "grayscale(1)" }}>
                    {b.icon}
                  </span>
                  <p className="text-sm font-medium">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.description}</p>
                  <Badge
                    variant={unlocked ? "success" : "outline"}
                    className="mt-1 capitalize"
                  >
                    {unlocked ? "Débloqué" : b.tier}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Challenges */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Défis</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {CHALLENGES.map((c) => (
            <Card key={c.code}>
              <CardContent className="flex flex-col gap-1.5 py-5">
                <span className="text-2xl">{c.icon}</span>
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-muted-foreground">{c.description}</p>
                <Badge variant="secondary" className="mt-1 w-fit">
                  +{c.reward} XP
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
