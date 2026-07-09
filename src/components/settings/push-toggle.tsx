"use client";

import * as React from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function PushToggle() {
  const [state, setState] = React.useState<"idle" | "on" | "loading">("idle");
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "on" : "idle"))
      .catch(() => {});
  }, []);

  const enable = async () => {
    if (!vapid) {
      toast.error("Notifications non configurées (VAPID manquant).");
      return;
    }
    setState("loading");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        toast.error("Permission refusée.");
        setState("idle");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapid),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ subscription: sub }),
      });
      if (!res.ok) throw new Error();
      setState("on");
      toast.success("Notifications activées");
    } catch {
      toast.error("Impossible d'activer les notifications.");
      setState("idle");
    }
  };

  const disable = async () => {
    setState("loading");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("idle");
      toast.success("Notifications désactivées");
    } catch {
      setState("idle");
    }
  };

  if (state === "on") {
    return (
      <Button variant="outline" onClick={disable}>
        <BellOff className="size-4" /> Désactiver sur cet appareil
      </Button>
    );
  }

  return (
    <Button onClick={enable} disabled={state === "loading"}>
      {state === "loading" ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Bell className="size-4" />
      )}
      Activer les notifications push
    </Button>
  );
}
