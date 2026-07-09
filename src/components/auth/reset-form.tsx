"use client";

import { useActionState } from "react";
import { resetPasswordAction, type AuthState } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";

const initial: AuthState = {};

export function ResetForm() {
  const [state, action] = useActionState(resetPasswordAction, initial);

  if (state.success) {
    return (
      <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm">
        {state.success}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
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
      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <SubmitButton className="w-full" pendingText="Envoi…">
        Envoyer le lien
      </SubmitButton>
    </form>
  );
}
