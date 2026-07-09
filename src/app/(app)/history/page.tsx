import { requireUser } from "@/lib/auth";
import { getRecentEntries } from "@/server/entries";
import { toDateKey } from "@/lib/utils";
import { HistoryView } from "@/components/history/history-view";
import { getUserPremiumStatus } from "@/lib/premium";
import { redirect } from "next/navigation";

export const metadata = { title: "Historique" };

export default async function HistoryPage() {
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

  const limit = premiumStatus.tier === "ESSENTIAL" ? 7 : 365;
  const entries = await getRecentEntries(user.id, limit);

  const data = entries.map((e) => ({
    date: toDateKey(e.date),
    wellbeingScore: e.wellbeingScore,
    sleepHours: e.sleepHours,
    activityMinutes: e.activityMinutes,
    hydrationGlasses: e.hydrationGlasses,
    newSymptoms: e.newSymptoms,
    comments: e.comments,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Historique</h1>
        <p className="text-sm text-muted-foreground">
          Vos journées, semaine après semaine.
        </p>
      </div>
      <HistoryView entries={data} />
    </div>
  );
}
