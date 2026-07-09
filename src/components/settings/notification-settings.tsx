"use client";

import * as React from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  updateNotifPrefs,
  type NotifPrefsInput,
} from "@/app/(app)/settings/actions";

export interface NotifPrefs {
  pushEnabled: boolean;
  questionnaire: boolean;
  hydration: boolean;
  activity: boolean;
  sleep: boolean;
  medication: boolean;
  questionnaireAt: string;
}

const TOGGLES: { key: keyof NotifPrefs; label: string; help: string }[] = [
  { key: "pushEnabled", label: "Notifications push", help: "Activer les rappels sur cet appareil" },
  { key: "questionnaire", label: "Rappel questionnaire", help: "Chaque jour, ne rien oublier" },
  { key: "hydration", label: "Rappel hydratation", help: "Pensez à boire de l'eau" },
  { key: "activity", label: "Rappel activité", help: "Bougez un peu chaque jour" },
  { key: "sleep", label: "Rappel sommeil", help: "L'heure de se coucher approche" },
  { key: "medication", label: "Rappel médicaments", help: "Prise de vos médicaments" },
];

export function NotificationSettings({ prefs }: { prefs: NotifPrefs }) {
  const [state, setState] = React.useState(prefs);
  const [, start] = React.useTransition();

  const save = (patch: NotifPrefsInput) => {
    setState((s) => ({ ...s, ...patch }));
    start(async () => {
      const res = await updateNotifPrefs(patch);
      if (res?.ok) toast.success("Préférences enregistrées");
    });
  };

  return (
    <div className="divide-y">
      {TOGGLES.map((t) => (
        <div key={t.key} className="flex items-center justify-between gap-4 py-3">
          <div>
            <Label className="text-sm">{t.label}</Label>
            <p className="text-xs text-muted-foreground">{t.help}</p>
          </div>
          <Switch
            checked={Boolean(state[t.key])}
            onCheckedChange={(v) => save({ [t.key]: v } as NotifPrefsInput)}
          />
        </div>
      ))}
      <div className="flex items-center justify-between gap-4 py-3">
        <div>
          <Label htmlFor="qat" className="text-sm">
            Heure du rappel quotidien
          </Label>
          <p className="text-xs text-muted-foreground">Rappel du questionnaire</p>
        </div>
        <Input
          id="qat"
          type="time"
          value={state.questionnaireAt}
          onChange={(e) => save({ questionnaireAt: e.target.value })}
          className="w-32"
        />
      </div>
    </div>
  );
}
