"use client";

import * as React from "react";
import { Download, Share2, Trash2, TrendingUp, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteReportAction } from "@/app/(app)/reports/actions";
import {
  METRIC_LABELS,
  REPORT_TYPE_LABEL,
  type ReportData,
} from "@/lib/report-types";
import { exportReportPdf } from "@/lib/pdf";

export interface ReportVM {
  id: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  shareToken: string | null;
  data: ReportData;
}

export function ReportCard({ report }: { report: ReportVM }) {
  const [pending, start] = React.useTransition();
  const { data } = report;

  const share = async () => {
    if (!report.shareToken) return;
    const url = `${window.location.origin}/share/${report.shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien de partage copié");
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const averages = Object.entries(data.averages ?? {}).filter(
    ([, v]) => v != null,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            Rapport {REPORT_TYPE_LABEL[report.type] ?? report.type}
            <Badge variant="secondary">
              {report.periodStart} → {report.periodEnd}
            </Badge>
          </CardTitle>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => exportReportPdf(report)} aria-label="Exporter en PDF">
              <Download className="size-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={share} aria-label="Partager">
              <Share2 className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              disabled={pending}
              aria-label="Supprimer"
              onClick={() => start(() => deleteReportAction(report.id))}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">{data.summary}</p>

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

        {data.highlights?.length > 0 && (
          <div className="space-y-1.5">
            {data.highlights.map((h, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <TrendingUp className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{h}</span>
              </div>
            ))}
          </div>
        )}

        {data.recommendations?.length > 0 && (
          <div className="space-y-1.5 rounded-lg bg-secondary/60 p-3">
            {data.recommendations.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>{r}</span>
              </div>
            ))}
          </div>
        )}

        <p className="text-[0.7rem] leading-tight text-muted-foreground">
          {data.disclaimer}
        </p>
      </CardContent>
    </Card>
  );
}
