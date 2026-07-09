import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPush, isPushConfigured } from "@/lib/push";
import { toDateKey } from "@/lib/utils";

/**
 * Daily reminder job. Protect with a secret header and call from a scheduler
 * (Vercel Cron, GitHub Action, etc.):
 *   GET /api/cron/reminders  with header  x-cron-secret: $CRON_SECRET
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isPushConfigured()) {
    return NextResponse.json({ skipped: "push not configured" });
  }

  const today = new Date(`${toDateKey(new Date())}T00:00:00.000Z`);

  const users = await prisma.user.findMany({
    where: {
      notificationPrefs: { pushEnabled: true, questionnaire: true },
      pushSubscriptions: { some: {} },
    },
    include: { pushSubscriptions: true },
  });

  let sent = 0;
  for (const user of users) {
    const hasEntry = await prisma.dailyEntry.findUnique({
      where: { userId_date: { userId: user.id, date: today } },
      select: { id: true },
    });
    if (hasEntry) continue;

    for (const sub of user.pushSubscriptions) {
      const ok = await sendPush(sub, {
        title: "Prevora",
        body: "Comment s'est passée votre journée ? Complétez votre suivi.",
        url: "/questionnaire",
      });
      if (!ok) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } });
      } else {
        sent++;
      }
    }
  }

  return NextResponse.json({ ok: true, sent });
}
