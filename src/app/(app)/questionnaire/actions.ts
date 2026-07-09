"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { saveEntry, type EntryValues } from "@/server/entries";
import { refreshAlerts } from "@/server/alerts";
import { entryFormSchema } from "@/lib/validations/entry";
import { rateLimit } from "@/lib/rate-limit";
import { toDateKey } from "@/lib/utils";

export interface SubmitResult {
  ok: boolean;
  error?: string;
}

/**
 * Persist a daily questionnaire submission. `dateKey` (YYYY-MM-DD) lets the
 * user backfill a past day; defaults to today.
 */
export async function submitEntryAction(
  values: Record<string, unknown>,
  dateKey?: string,
): Promise<SubmitResult> {
  const user = await requireUser();

  if (!rateLimit(`entry:${user.id}`, 30, 60_000).success) {
    return { ok: false, error: "Trop de requêtes. Réessayez dans un instant." };
  }

  const parsed = entryFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: "Certaines réponses sont invalides." };
  }

  const clean: EntryValues = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v === null || v === undefined || v === "") continue;
    clean[k] = v as EntryValues[string];
  }

  const date = dateKey ?? toDateKey(new Date());

  try {
    await saveEntry(user.id, date, clean);
    await refreshAlerts(user.id);
  } catch {
    return { ok: false, error: "Enregistrement impossible. Réessayez." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/history");
  revalidatePath("/alerts");
  return { ok: true };
}
