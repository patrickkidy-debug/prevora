"use client";

import { Controller, type Control } from "react-hook-form";
import type { Question } from "@/config/questionnaire";
import { Icon } from "@/components/icon";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

export function QuestionField({
  question,
  control,
}: {
  question: Question;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: Control<any>;
}) {
  const q = question;

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={q.id} className="text-sm">
          {q.icon && (
            <span className="grid size-7 place-items-center rounded-md bg-secondary text-accent">
              <Icon name={q.icon} className="size-4" />
            </span>
          )}
          <span className="flex flex-col">
            {q.label}
            {q.help && (
              <span className="text-xs font-normal text-muted-foreground">
                {q.help}
              </span>
            )}
          </span>
        </Label>
        {q.optional && (
          <span className="text-[0.65rem] text-muted-foreground">
            facultatif
          </span>
        )}
      </div>

      <Controller
        control={control}
        name={q.id}
        render={({ field, fieldState }) => (
          <div className="space-y-1.5">
            {q.type === "scale" && (
              <div className="flex items-center gap-4">
                <Slider
                  min={q.min ?? 0}
                  max={q.max ?? 10}
                  step={1}
                  value={[Number(field.value) || 0]}
                  onValueChange={(v) => field.onChange(v[0])}
                  className="flex-1"
                />
                <span className="w-8 text-right text-lg font-semibold tabular-nums">
                  {field.value === "" || field.value == null
                    ? "–"
                    : Number(field.value)}
                </span>
              </div>
            )}

            {q.type === "number" && (
              <div className="relative">
                <Input
                  id={q.id}
                  type="number"
                  inputMode="decimal"
                  min={q.min}
                  max={q.max}
                  step={q.step ?? 1}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? "" : e.target.valueAsNumber,
                    )
                  }
                  className="pr-14"
                />
                {q.unit && (
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                    {q.unit}
                  </span>
                )}
              </div>
            )}

            {q.type === "boolean" && (
              <div className="flex items-center gap-2">
                <Switch
                  id={q.id}
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
                <span className="text-sm text-muted-foreground">
                  {field.value ? "Oui" : "Non"}
                </span>
              </div>
            )}

            {q.type === "text" && (
              <Textarea
                id={q.id}
                value={field.value ?? ""}
                onChange={field.onChange}
                placeholder="Écrivez ici…"
                rows={3}
              />
            )}

            {fieldState.error && (
              <p className="text-xs text-destructive">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />
    </div>
  );
}
