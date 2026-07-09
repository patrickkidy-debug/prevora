import "server-only";
import { prisma } from "@/lib/prisma";
import { analyzeEntries } from "@/lib/insights";
import { getRecentEntries } from "@/server/entries";

/**
 * Recompute prevention alerts for a user and sync them with the DB:
 * newly-detected alert types are inserted; previously-active ones no longer
 * detected are marked DISMISSED. Read/dismissed history is preserved.
 */
export async function refreshAlerts(userId: string) {
  const entries = await getRecentEntries(userId, 21);
  const { alerts } = analyzeEntries(entries);

  const active = await prisma.alert.findMany({
    where: { userId, status: "ACTIVE" },
  });
  const activeTypes = new Set(active.map((a) => a.type));
  const detectedTypes = new Set(alerts.map((a) => a.type));

  // Insert freshly detected alerts.
  const toCreate = alerts.filter((a) => !activeTypes.has(a.type));
  if (toCreate.length) {
    await prisma.alert.createMany({
      data: toCreate.map((a) => ({
        userId,
        type: a.type,
        severity: a.severity,
        title: a.title,
        message: a.message,
        recommendation: a.recommendation,
        consultAdvised: a.consultAdvised,
      })),
    });
  }

  // Resolve alerts that no longer apply.
  const stale = active.filter((a) => !detectedTypes.has(a.type));
  if (stale.length) {
    await prisma.alert.updateMany({
      where: { id: { in: stale.map((a) => a.id) } },
      data: { status: "DISMISSED" },
    });
  }

  return alerts;
}
