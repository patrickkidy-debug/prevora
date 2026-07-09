"use client";

import { useActionState } from "react";
import { signUpAction, type AuthState } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

const initial: AuthState = {};

export function SignUpForm() {
  const [state, action] = useActionState(signUpAction, initial);

  if (state.success) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-foreground">
        {state.success}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <Input id="name" name="name" autoComplete="name" placeholder="Alex Martin" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="vous@exemple.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="8 caractères minimum"
          required
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton className="w-full" pendingText="Création…">
        Créer mon compte
      </SubmitButton>
    </form>
  );
}
