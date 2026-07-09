"use server";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPush } from "@/lib/push";
import { revalidatePath } from "next/cache";

/** Helper to ensure the active user is the admin */
async function ensureAdmin() {
  const user = await requireUser();
  if (user.email !== "patrickkidy@gmail.com") {
    throw new Error("Accès refusé : Action réservée à l'administrateur.");
  }
  return user;
}

/** Suspend or reactivate a user account */
export async function toggleSuspendUserAction(targetUserId: string, suspend: boolean) {
  await ensureAdmin();

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!user) {
    return { ok: false, error: "Utilisateur introuvable" };
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { suspended: suspend },
  });

  revalidatePath("/admin");
  return { ok: true, success: true };
}

/** Manually toggle a user's Premium subscription status */
export async function togglePremiumUserAction(targetUserId: string, activate: boolean) {
  await ensureAdmin();

  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!user) {
    return { ok: false, error: "Utilisateur introuvable" };
  }

  const premiumExpiresAt = activate ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null; // 30 days or revoked

  await prisma.user.update({
    where: { id: targetUserId },
    data: {
      isPremium: activate,
      premiumExpiresAt,
      subscriptionTier: activate ? "STANDARD" : "FREE",
    },
  });

  revalidatePath("/admin");
  return { ok: true, success: true };
}

/** Dispatch a global web push notification to all subscribed users */
export async function sendGlobalNotificationAction(title: string, body: string) {
  await ensureAdmin();

  if (!title.trim() || !body.trim()) {
    return { ok: false, error: "Le titre et le message ne peuvent pas être vides." };
  }

  const subscriptions = await prisma.pushSubscription.findMany({});
  
  if (subscriptions.length === 0) {
    return { ok: true, count: 0, message: "Aucun appareil abonné aux notifications push." };
  }

  let successCount = 0;
  let staleCount = 0;

  for (const s of subscriptions) {
    try {
      const active = await sendPush(
        { endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth },
        { title, body, url: "/dashboard" }
      );

      if (active) {
        successCount++;
      } else {
        // Remove stale/expired subscription
        await prisma.pushSubscription.delete({
          where: { id: s.id },
        });
        staleCount++;
      }
    } catch (err) {
      console.error(`Failed to send push to subscription ${s.id}:`, err);
    }
  }

  revalidatePath("/admin");
  return {
    ok: true,
    count: successCount,
    message: `${successCount} notification(s) envoyée(s) avec succès.${
      staleCount > 0 ? ` ${staleCount} abonnement(s) obsolète(s) supprimé(s).` : ""
    }`,
  };
}
