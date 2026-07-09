"use client";

/**
 * Minimal offline queue for questionnaire submissions. When the device is
 * offline, entries are stored in localStorage and flushed on reconnect.
 */

const KEY = "prevora:pending-entries";

export interface PendingEntry {
  dateKey: string;
  values: Record<string, unknown>;
  queuedAt: number;
}

export function queueEntry(entry: Omit<PendingEntry, "queuedAt">) {
  if (typeof window === "undefined") return;
  const list = getQueue();
  const full: PendingEntry = { ...entry, queuedAt: Date.now() };
  // Replace any pending entry for the same day.
  const next = [...list.filter((e) => e.dateKey !== entry.dateKey), full];
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getQueue(): PendingEntry[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as PendingEntry[];
  } catch {
    return [];
  }
}

export function clearQueue() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}

/** Flush queued entries through the provided submit function. */
export async function flushQueue(
  submit: (values: Record<string, unknown>, dateKey: string) => Promise<{ ok: boolean }>,
) {
  const list = getQueue();
  if (list.length === 0) return 0;

  const remaining: PendingEntry[] = [];
  let flushed = 0;
  for (const item of list) {
    try {
      const res = await submit(item.values, item.dateKey);
      if (res.ok) flushed++;
      else remaining.push(item);
    } catch {
      remaining.push(item);
    }
  }

  if (remaining.length) localStorage.setItem(KEY, JSON.stringify(remaining));
  else clearQueue();
  return flushed;
}
