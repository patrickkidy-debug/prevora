"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function setAlertStatus(
  alertId: string,
  status: "READ" | "DISMISSED",
) {
  const user = await requireUser();
  await prisma.alert.updateMany({
    where: { id: alertId, userId: user.id },
    data: { status },
  });
  revalidatePath("/alerts");
}
