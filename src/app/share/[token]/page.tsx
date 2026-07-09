import { notFound } from "next/navigation";
import { Logo } from "@/components/logo";
import { prisma } from "@/lib/prisma";
import { toDateKey } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  METRIC_LABELS,
  REPORT_TYPE_LABEL,
  type ReportData,
} from "@/lib/report-types";
import { MEDICAL_DISCLAIMER } from "@/config/site";

export const metadata = { title: "Rapport partagé" };

export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const report = await prisma.report.findUnique({
    where: { shareToken: token },
  });
  if (!report) notFound();

  const data = report.data as unknown as ReportData;
  const averages = Object.entries(data?.averages ?? {}).filter(
    ([, v]) => v != null,
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-10">
      <Logo />
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            Rapport {REPORT_TYPE_LABEL[report.type] ?? report.type}
            <Badge variant="secondary">
              {toDateKey(report.periodStart)} → {toDateKey(report.periodEnd)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">{data?.summary}</p>

          {averages.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {averages.map(([k, v]) => (
                <div key={k} className="rounded-lg bg-muted/60 p-2.5">
                  <p className="text-xs text-muted-foreground">
                    {METRIC_LABELS[k] ?? k}
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    {Math.round((v as number) * 10) / 10}
                  </p>
                </div>
              ))}
            </div>
          )}

          {data?.recommendations?.length > 0 && (
            <ul className="list-inside list-disc space-y-1 text-sm">
              {data.recommendations.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        {MEDICAL_DISCLAIMER}
      </p>
    </div>
  );
}
