"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const prefsSchema = z.object({
  pushEnabled: z.boolean().optional(),
  questionnaire: z.boolean().optional(),
  hydration: z.boolean().optional(),
  activity: z.boolean().optional(),
  sleep: z.boolean().optional(),
  medication: z.boolean().optional(),
  questionnaireAt: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

export type NotifPrefsInput = z.infer<typeof prefsSchema>;

export async function updateNotifPrefs(input: NotifPrefsInput) {
  const user = await requireUser();
  const parsed = prefsSchema.safeParse(input);
  if (!parsed.success) return { error: "Données invalides" };

  await prisma.notificationPreference.upsert({
    where: { userId: user.id },
    update: parsed.data,
    create: { userId: user.id, ...parsed.data },
  });
  revalidatePath("/settings");
  return { ok: true };
}

export async function deleteAccountAction() {
  const user = await requireUser();

  // Remove app data (cascades to entries, alerts, reports, etc.).
  await prisma.user.delete({ where: { id: user.id } });

  // Remove the auth identity.
  try {
    const admin = createAdminClient();
    await admin.auth.admin.deleteUser(user.id);
  } catch {
    // Service role not configured — app data already deleted.
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
