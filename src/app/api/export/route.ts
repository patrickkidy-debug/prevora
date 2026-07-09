import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

/** Download all of the signed-in user's data as JSON (RGPD portability). */
export async function GET() {
  const user = await requireUser();

  if (!rateLimit(`export:${user.id}`, 5, 60_000).success) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const [entries, goals, alerts, reports, streak, prefs] = await Promise.all([
    prisma.dailyEntry.findMany({ where: { userId: user.id } }),
    prisma.goal.findMany({ where: { userId: user.id } }),
    prisma.alert.findMany({ where: { userId: user.id } }),
    prisma.report.findMany({ where: { userId: user.id } }),
    prisma.streak.findUnique({ where: { userId: user.id } }),
    prisma.notificationPreference.findUnique({ where: { userId: user.id } }),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    profile: {
      email: user.email,
      name: user.name,
      birthDate: user.birthDate,
      sex: user.sex,
      heightCm: user.heightCm,
      weightKg: user.weightKg,
      timezone: user.timezone,
      language: user.language,
    },
    entries,
    goals,
    alerts,
    reports,
    streak,
    notificationPreferences: prefs,
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="prevora-donnees-${Date.now()}.json"`,
    },
  });
}
