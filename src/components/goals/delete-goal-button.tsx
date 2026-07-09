"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteGoal } from "@/app/(app)/goals/actions";

export function DeleteGoalButton({ goalId }: { goalId: string }) {
  const [pending, startTransition] = React.useTransition();
  return (
    <Button
      size="icon"
      variant="ghost"
      aria-label="Supprimer l'objectif"
      disabled={pending}
      onClick={() => startTransition(() => deleteGoal(goalId))}
    >
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
