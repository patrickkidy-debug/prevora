"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const goalSchema = z.object({
  metric: z.string().min(1),
  label: z.string().min(1).max(80),
  target: z.coerce.number().positive(),
  unit: z.string().max(16),
  period: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
});

export async function createGoal(_prev: unknown, formData: FormData) {
  const user = await requireUser();
  const parsed = goalSchema.safeParse({
    metric: formData.get("metric"),
    label: formData.get("label"),
    target: formData.get("target"),
    unit: formData.get("unit"),
    period: formData.get("period"),
  });
  if (!parsed.success) return { error: "Données invalides" };

  await prisma.goal.create({ data: { userId: user.id, ...parsed.data } });
  revalidatePath("/goals");
  return { ok: true };
}

export async function deleteGoal(goalId: string) {
  const user = await requireUser();
  await prisma.goal.deleteMany({ where: { id: goalId, userId: user.id } });
  revalidatePath("/goals");
}
