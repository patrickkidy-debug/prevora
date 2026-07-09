"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  name: z.string().max(80).optional().nullable(),
  birthDate: z.string().optional().nullable(),
  sex: z.enum(["MALE", "FEMALE", "OTHER", "UNDISCLOSED"]).optional().nullable(),
  heightCm: z.coerce.number().min(50).max(260).optional().nullable(),
  weightKg: z.coerce.number().min(20).max(400).optional().nullable(),
  timezone: z.string().max(64).optional(),
  language: z.string().max(8).optional(),
});

export interface ProfileState {
  ok?: boolean;
  error?: string;
}

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await requireUser();
  const raw = {
    name: formData.get("name") || null,
    birthDate: formData.get("birthDate") || null,
    sex: formData.get("sex") || null,
    heightCm: formData.get("heightCm") || null,
    weightKg: formData.get("weightKg") || null,
    timezone: formData.get("timezone") || undefined,
    language: formData.get("language") || undefined,
  };
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { error: "Données invalides" };

  const d = parsed.data;
  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: d.name,
      birthDate: d.birthDate ? new Date(d.birthDate) : null,
      sex: d.sex ?? null,
      heightCm: d.heightCm ?? null,
      weightKg: d.weightKg ?? null,
      timezone: d.timezone,
      language: d.language,
      onboarded: true,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}
