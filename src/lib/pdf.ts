"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  METRIC_LABELS,
  REPORT_TYPE_LABEL,
  type ReportData,
} from "@/lib/report-types";

interface ReportLike {
  type: string;
  periodStart: string;
  periodEnd: string;
  data: ReportData;
}

const BLUE: [number, number, number] = [37, 99, 180];
const GRAY: [number, number, number] = [90, 100, 115];

/** Build and download a premium PDF for a report. */
export function exportReportPdf(report: ReportLike) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 0;

  // Header band
  doc.setFillColor(...BLUE);
  doc.rect(0, 0, pageW, 90, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Prevora", margin, 45);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(
    `Rapport ${REPORT_TYPE_LABEL[report.type] ?? report.type}`,
    margin,
    66,
  );
  doc.setFontSize(10);
  doc.text(
    `${report.periodStart}  ->  ${report.periodEnd}`,
    pageW - margin,
    66,
    { align: "right" },
  );

  y = 120;
  doc.setTextColor(30, 35, 45);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Résumé", margin, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...GRAY);
  const summaryLines = doc.splitTextToSize(
    report.data.summary,
    pageW - margin * 2,
  );
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 14 + 16;

  // Averages table
  const avg = Object.entries(report.data.averages ?? {}).filter(
    ([, v]) => v != null,
  );
  if (avg.length) {
    autoTable(doc, {
      startY: y,
      head: [["Indicateur", "Moyenne"]],
      body: avg.map(([k, v]) => [
        METRIC_LABELS[k] ?? k,
        String(Math.round((v as number) * 10) / 10),
      ]),
      theme: "grid",
      headStyles: { fillColor: BLUE, textColor: 255 },
      styles: { fontSize: 10, cellPadding: 6 },
      margin: { left: margin, right: margin },
    });
    // @ts-expect-error autotable augments doc at runtime
    y = doc.lastAutoTable.finalY + 24;
  }

  const bullets = (title: string, items: string[]) => {
    if (!items?.length) return;
    if (y > 720) {
      doc.addPage();
      y = 60;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(30, 35, 45);
    doc.text(title, margin, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...GRAY);
    for (const item of items) {
      const lines = doc.splitTextToSize(`•  ${item}`, pageW - margin * 2);
      doc.text(lines, margin, y);
      y += lines.length * 13 + 4;
    }
    y += 12;
  };

  bullets("Points clés", report.data.highlights ?? []);
  bullets("Recommandations", report.data.recommendations ?? []);

  // Disclaimer footer
  doc.setFontSize(8);
  doc.setTextColor(140, 148, 160);
  const disc = doc.splitTextToSize(report.data.disclaimer, pageW - margin * 2);
  doc.text(disc, margin, 800);

  doc.save(`prevora-rapport-${report.type.toLowerCase()}-${report.periodEnd}.pdf`);
}
