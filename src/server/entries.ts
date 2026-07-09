import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeScores } from "@/lib/scoring";
import { mappedFields } from "@/config/questionnaire";
import { toDateKey } from "@/lib/utils";

/** Parse a YYYY-MM-DD (or Date) into a UTC-midnight Date for @db.Date columns. */
function dateOnly(input: Date | string): Date {
  const key = typeof input === "string" ? input : toDateKey(input);
  return new Date(`${key}T00:00:00.000Z`);
}

export async function getRecentEntries(userId: string, days = 30) {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - days);
  return prisma.dailyEntry.findMany({
    where: { userId, date: { gte: since } },
    orderBy: { date: "asc" },
  });
}

export async function getEntriesBetween(
  userId: string,
  start: Date | string,
  end: Date | string,
) {
  return prisma.dailyEntry.findMany({
    where: { userId, date: { gte: dateOnly(start), lte: dateOnly(end) } },
    orderBy: { date: "asc" },
  });
}

export async function getEntryForDate(userId: string, date: Date | string) {
  return prisma.dailyEntry.findUnique({
    where: { userId_date: { userId, date: dateOnly(date) } },
  });
}

export type EntryValues = Record<string, string | number | boolean | null | undefined>;

/** Split submitted answers into mapped columns and the `extra` JSON blob. */
function partitionValues(values: EntryValues) {
  const mapped: Record<string, unknown> = {};
  const extra: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(values)) {
    if (v === undefined || v === "") continue;
    if (mappedFields.has(k)) mapped[k] = v;
    else extra[k] = v;
  }
  return { mapped, extra };
}

/**
 * Create/update the entry for a given date, recompute scores, and refresh the
 * user's daily streak. Returns the saved entry.
 */
export async function saveEntry(
  userId: string,
  date: Date | string,
  values: EntryValues,
) {
  const d = dateOnly(date);
  const { mapped, extra } = partitionValues(values);

  const scores = computeScores({
    sleepQuality: mapped.sleepQuality as number,
    sleepHours: mapped.sleepHours as number,
    energy: mapped.energy as number,
    mood: mapped.mood as number,
    stress: mapped.stress as number,
    anxiety: mapped.anxiety as number,
    pain: mapped.pain as number,
    fatigue: mapped.fatigue as number,
    hydrationGlasses: mapped.hydrationGlasses as number,
    activityMinutes: mapped.activityMinutes as number,
    nutritionQuality: mapped.nutritionQuality as number,
  });

  const data = {
    ...mapped,
    extra: Object.keys(extra).length ? (extra as Prisma.InputJsonValue) : undefined,
    sleepScore: scores.sleep,
    stressScore: scores.stress,
    activityScore: scores.activity,
    nutritionScore: scores.nutrition,
    hydrationScore: scores.hydration,
    wellbeingScore: scores.wellbeing,
  } as Prisma.DailyEntryUncheckedUpdateInput;

  const entry = await prisma.dailyEntry.upsert({
    where: { userId_date: { userId, date: d } },
    update: data,
    create: {
      ...(data as Prisma.DailyEntryUncheckedCreateInput),
      userId,
      date: d,
    },
  });

  await updateStreak(userId, d);
  return entry;
}

/** Advance the streak if the entry continues (or starts) a daily run. */
async function updateStreak(userId: string, entryDate: Date) {
  const streak = await prisma.streak.findUnique({ where: { userId } });
  const today = new Date(entryDate);
  const yesterday = new Date(entryDate);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  if (!streak) {
    await prisma.streak.create({
      data: { userId, current: 1, longest: 1, lastEntryDate: today },
    });
    return;
  }

  const last = streak.lastEntryDate
    ? toDateKey(streak.lastEntryDate)
    : null;
  const todayKey = toDateKey(today);
  const yesterdayKey = toDateKey(yesterday);

  if (last === todayKey) return; // already counted today

  const current = last === yesterdayKey ? streak.current + 1 : 1;
  await prisma.streak.update({
    where: { userId },
    data: {
      current,
      longest: Math.max(current, streak.longest),
      lastEntryDate: today,
    },
  });
}
