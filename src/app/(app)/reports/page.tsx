import { FileText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toDateKey } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { GenerateButtons } from "@/components/reports/generate-buttons";
import { ReportCard } from "@/components/reports/report-card";
import type { ReportData } from "@/lib/report-types";
import { MEDICAL_DISCLAIMER } from "@/config/site";
import { getUserPremiumStatus } from "@/lib/premium";
import { redirect } from "next/navigation";

export const metadata = { title: "Rapports" };

export default async function ReportsPage() {
  const user = await requireUser();

  const premiumStatus = getUserPremiumStatus({
    suspended: user.suspended,
    isPremium: user.isPremium,
    premiumExpiresAt: user.premiumExpiresAt,
    trialExpiresAt: user.trialExpiresAt,
    subscriptionTier: user.subscriptionTier,
  });

  if (premiumStatus.tier !== "STANDARD" && premiumStatus.tier !== "PREMIUM") {
    redirect("/subscription");
  }
  const reports = await prisma.report.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rapports</h1>
          <p className="text-sm text-muted-foreground">
            Synthèses générées à partir de vos données, exportables en PDF.
          </p>
        </div>
        <GenerateButtons />
      </div>

      {reports.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-secondary text-accent">
              <FileText className="size-6" />
            </span>
            <p className="font-medium">Aucun rapport</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Générez votre premier rapport hebdomadaire ou mensuel.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <ReportCard
              key={r.id}
              report={{
                id: r.id,
                type: r.type,
                periodStart: toDateKey(r.periodStart),
                periodEnd: toDateKey(r.periodEnd),
                shareToken: r.shareToken,
                data: (r.data as unknown as ReportData) ?? {
                  summary: r.summary,
                  highlights: [],
                  recommendations: [],
                  averages: {},
                  disclaimer: MEDICAL_DISCLAIMER,
                },
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
