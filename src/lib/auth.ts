import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/** Current Supabase auth user (verified), memoized per request. */
export const getSupabaseUser = cache(async (): Promise<SupabaseUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/**
 * Resolve the app User row for the signed-in Supabase user, lazily creating
 * it (plus its streak + notification prefs) on first sign-in.
 */
export const getCurrentUser = cache(async () => {
  const authUser = await getSupabaseUser();
  if (!authUser?.email) return null;

  const existing = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: { streak: true, notificationPrefs: true },
  });

  const now = new Date();
  const trialDuration = 90 * 60 * 1000; // 1.5 hours in milliseconds

  if (existing) {
    const meta = authUser.user_metadata ?? {};
    const metaName = meta.full_name ?? meta.name ?? null;
    const metaAvatar = meta.avatar_url ?? meta.picture ?? null;

    let needsUpdate = false;
    const updateData: Record<string, any> = {};

    if (!existing.trialStartedAt) {
      updateData.trialStartedAt = now;
      updateData.trialExpiresAt = new Date(now.getTime() + trialDuration);
      needsUpdate = true;
    }

    if (metaName && existing.name !== metaName) {
      updateData.name = metaName;
      needsUpdate = true;
    }

    if (metaAvatar && existing.avatarUrl !== metaAvatar) {
      updateData.avatarUrl = metaAvatar;
      needsUpdate = true;
    }

    if (needsUpdate) {
      return prisma.user.update({
        where: { id: existing.id },
        data: updateData,
        include: { streak: true, notificationPrefs: true },
      });
    }
    return existing;
  }

  const meta = authUser.user_metadata ?? {};
  return prisma.user.create({
    data: {
      id: authUser.id,
      email: authUser.email,
      name: meta.full_name ?? meta.name ?? null,
      avatarUrl: meta.avatar_url ?? meta.picture ?? null,
      trialStartedAt: now,
      trialExpiresAt: new Date(now.getTime() + trialDuration),
      streak: { create: {} },
      notificationPrefs: { create: {} },
    },
    include: { streak: true, notificationPrefs: true },
  });
});

/** Require an authenticated user or redirect to login. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export type AppUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
