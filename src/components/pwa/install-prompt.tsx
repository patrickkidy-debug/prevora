"use client";

import * as React from "react";
import { Download, X, Share, PlusSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "prevora:install-dismissed";

export function InstallPrompt() {
  const [deferred, setDeferred] =
    React.useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = React.useState(false);
  const [isIOS, setIsIOS] = React.useState(false);

  React.useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;

    // Check if running in standalone PWA mode
    const isStandalone = 
      (window.navigator as any).standalone || 
      window.matchMedia("(display-mode: standalone)").matches;

    if (isStandalone) return;

    // Check user agent for iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIOS(ios);

    if (ios) {
      // Show custom prompt for iOS Safari
      setVisible(true);
      return;
    }

    // Android/Chrome beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISS_KEY, "1");
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setVisible(false);
    setDeferred(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-sm rounded-2xl border bg-card p-4 shadow-xl lg:bottom-6 lg:left-auto lg:right-6 lg:mx-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start gap-3">
        <Logo showText={false} />
        <div className="flex-1">
          <p className="text-sm font-semibold">Installer Prevora</p>
          <p className="text-xs text-muted-foreground">
            Accès rapide, hors ligne, comme une vraie app.
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Fermer"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      {isIOS ? (
        <div className="mt-3 rounded-lg bg-secondary/40 p-3 text-xs space-y-2 text-foreground">
          <p className="font-medium text-primary">Pour installer sur iPhone :</p>
          <ol className="list-decimal pl-4 space-y-1.5 text-muted-foreground">
            <li className="flex items-center gap-1.5 flex-wrap">
              Appuyez sur le bouton de partage{" "}
              <span className="inline-flex items-center rounded border bg-card px-1 py-0.5 text-foreground font-mono">
                <Share className="size-3 text-primary inline" />
              </span>{" "}
              dans Safari.
            </li>
            <li className="flex items-center gap-1.5 flex-wrap">
              Défilez vers le bas et appuyez sur{" "}
              <span className="inline-flex items-center rounded border bg-card px-1 py-0.5 text-foreground font-semibold">
                <PlusSquare className="size-3 text-primary inline" /> Sur l&apos;écran d&apos;accueil
              </span>.
            </li>
            <li>Appuyez sur &quot;Ajouter&quot; en haut à droite.</li>
          </ol>
        </div>
      ) : (
        <Button onClick={install} className="mt-3 w-full bg-primary text-white" size="sm">
          <Download className="size-4" /> Installer
        </Button>
      )}
    </div>
  );
}
