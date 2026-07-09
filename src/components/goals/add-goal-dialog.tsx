"use client";

import * as React from "react";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubmitButton } from "@/components/submit-button";
import { createGoal } from "@/app/(app)/goals/actions";

const METRICS = [
  { value: "sleepHours", label: "Sommeil", unit: "h" },
  { value: "activityMinutes", label: "Activité", unit: "min" },
  { value: "hydrationGlasses", label: "Hydratation", unit: "verres" },
  { value: "nutritionQuality", label: "Nutrition", unit: "/10" },
  { value: "weightKg", label: "Poids", unit: "kg" },
];

export function AddGoalDialog() {
  const [open, setOpen] = React.useState(false);
  const [metric, setMetric] = React.useState(METRICS[0]);
  const [state, action] = useActionState(createGoal, null);

  React.useEffect(() => {
    if (state && "ok" in state && state.ok) {
      toast.success("Objectif ajouté");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" /> Nouvel objectif
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvel objectif</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="metric" value={metric.value} />
          <input type="hidden" name="unit" value={metric.unit} />
          <div className="space-y-2">
            <Label>Indicateur</Label>
            <Select
              defaultValue={metric.value}
              onValueChange={(v) =>
                setMetric(METRICS.find((m) => m.value === v) ?? METRICS[0])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METRICS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="label">Nom de l&apos;objectif</Label>
            <Input
              id="label"
              name="label"
              defaultValue={`Objectif ${metric.label.toLowerCase()}`}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="target">Cible ({metric.unit})</Label>
              <Input id="target" name="target" type="number" step="0.1" required />
            </div>
            <div className="space-y-2">
              <Label>Période</Label>
              <Select name="period" defaultValue="DAILY">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Par jour</SelectItem>
                  <SelectItem value="WEEKLY">Par semaine</SelectItem>
                  <SelectItem value="MONTHLY">Par mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {state && "error" in state && state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <SubmitButton className="w-full">Ajouter</SubmitButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}
