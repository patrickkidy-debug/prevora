import { WifiOff } from "lucide-react";
import { Logo } from "@/components/logo";

export const metadata = { title: "Hors ligne" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <Logo />
      <span className="grid size-14 place-items-center rounded-2xl bg-secondary text-accent">
        <WifiOff className="size-7" />
      </span>
      <h1 className="text-xl font-semibold">Vous êtes hors ligne</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Certaines pages restent accessibles. Vos questionnaires seront
        synchronisés dès le retour de la connexion.
      </p>
    </div>
  );
}
