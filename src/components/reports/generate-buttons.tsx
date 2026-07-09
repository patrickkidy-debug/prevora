"use client";

import * as React from "react";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { generateReportAction } from "@/app/(app)/reports/actions";

export function GenerateButtons() {
  const [pending, start] = React.useTransition();
  const [busy, setBusy] = React.useState<string | null>(null);

  const run = (type: "WEEKLY" | "MONTHLY") => {
    setBusy(type);
    start(async () => {
      const res = await generateReportAction(type);
      if (res.ok) toast.success("Rapport généré");
      setBusy(null);
    });
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        disabled={pending}
        onClick={() => run("WEEKLY")}
      >
        {busy === "WEEKLY" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileText className="size-4" />
        )}
        Rapport hebdo
      </Button>
      <Button disabled={pending} onClick={() => run("MONTHLY")}>
        {busy === "MONTHLY" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileText className="size-4" />
        )}
        Rapport mensuel
      </Button>
    </div>
  );
}
