"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAndSaveReport } from "@/server/reports";

export async function generateReportAction(type: "WEEKLY" | "MONTHLY") {
  const user = await requireUser();
  await generateAndSaveReport(user.id, type);
  revalidatePath("/reports");
  return { ok: true };
}

export async function deleteReportAction(reportId: string) {
  const user = await requireUser();
  await prisma.report.deleteMany({ where: { id: reportId, userId: user.id } });
  revalidatePath("/reports");
}
