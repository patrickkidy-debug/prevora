"use client";

import * as React from "react";
import { Download, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteAccountAction } from "@/app/(app)/settings/actions";

export function DataExportButton() {
  return (
    <Button asChild variant="outline">
      <a href="/api/export" download>
        <Download className="size-4" /> Télécharger mes données
      </a>
    </Button>
  );
}

export function DeleteAccountButton() {
  const [pending, start] = React.useTransition();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="size-4" /> Supprimer mon compte
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer définitivement le compte ?</DialogTitle>
          <DialogDescription>
            Cette action est irréversible. Toutes vos données (journées,
            rapports, objectifs) seront supprimées définitivement.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => start(() => deleteAccountAction())}
          >
            {pending && <Loader2 className="size-4 animate-spin" />}
            Supprimer définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
