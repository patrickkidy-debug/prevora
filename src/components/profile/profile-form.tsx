"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  updateProfileAction,
  type ProfileState,
} from "@/app/(app)/profile/actions";
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

export interface ProfileValues {
  name: string | null;
  birthDate: string | null;
  sex: string | null;
  heightCm: number | null;
  weightKg: number | null;
  timezone: string;
  language: string;
}

const initial: ProfileState = {};

export function ProfileForm({ values }: { values: ProfileValues }) {
  const [state, action] = useActionState(updateProfileAction, initial);

  useEffect(() => {
    if (state.ok) toast.success("Profil mis à jour");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input id="name" name="name" defaultValue={values.name ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="birthDate">Date de naissance</Label>
          <Input
            id="birthDate"
            name="birthDate"
            type="date"
            defaultValue={values.birthDate ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label>Sexe</Label>
          <Select name="sex" defaultValue={values.sex ?? "UNDISCLOSED"}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Homme</SelectItem>
              <SelectItem value="FEMALE">Femme</SelectItem>
              <SelectItem value="OTHER">Autre</SelectItem>
              <SelectItem value="UNDISCLOSED">Ne pas préciser</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="heightCm">Taille (cm)</Label>
          <Input
            id="heightCm"
            name="heightCm"
            type="number"
            defaultValue={values.heightCm ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weightKg">Poids (kg)</Label>
          <Input
            id="weightKg"
            name="weightKg"
            type="number"
            step="0.1"
            defaultValue={values.weightKg ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="timezone">Fuseau horaire</Label>
          <Input
            id="timezone"
            name="timezone"
            defaultValue={values.timezone}
            placeholder="Europe/Paris"
          />
        </div>
        <div className="space-y-2">
          <Label>Langue</Label>
          <Select name="language" defaultValue={values.language}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <SubmitButton>Enregistrer</SubmitButton>
    </form>
  );
}
