"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { flushQueue, getQueue } from "@/lib/offline";
import { submitEntryAction } from "@/app/(app)/questionnaire/actions";

/** Flushes offline questionnaire submissions when connectivity returns. */
export function OfflineSync() {
  useEffect(() => {
    const sync = async () => {
      if (getQueue().length === 0) return;
      const n = await flushQueue((values, dateKey) =>
        submitEntryAction(values, dateKey),
      );
      if (n > 0) toast.success(`${n} journée(s) synchronisée(s).`);
    };

    // Attempt on mount (in case we came back online while closed) and on reconnect.
    if (typeof navigator !== "undefined" && navigator.onLine) void sync();
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, []);

  return null;
}
