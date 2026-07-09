import "server-only";
import { randomUUID } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getEntriesBetween } from "@/server/entries";
import { generatePeriodReport } from "@/lib/ai/health";
import { toDateKey } from "@/lib/utils";

export async function generateAndSaveReport(
  userId: string,
  type: "WEEKLY" | "MONTHLY",
) {
  const end = new Date();
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - (type === "WEEKLY" ? 6 : 29));

  const entries = await getEntriesBetween(userId, start, end);
  const report = await generatePeriodReport(
    entries,
    type === "WEEKLY" ? "weekly" : "monthly",
  );

  const periodStart = new Date(`${toDateKey(start)}T00:00:00.000Z`);
  const periodEnd = new Date(`${toDateKey(end)}T00:00:00.000Z`);

  const data = {
    summary: report.summary,
    highlights: report.highlights,
    recommendations: report.recommendations,
    averages: report.analysis.averages,
    disclaimer: report.disclaimer,
  } as unknown as Prisma.InputJsonValue;

  return prisma.report.upsert({
    where: { userId_type_periodStart: { userId, type, periodStart } },
    update: { summary: report.summary, data, periodEnd },
    create: {
      userId,
      type,
      periodStart,
      periodEnd,
      summary: report.summary,
      data,
      shareToken: randomUUID(),
    },
  });
}
