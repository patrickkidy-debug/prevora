"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Ban, UserCheck, Sparkles, UserX, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { toggleSuspendUserAction, togglePremiumUserAction, sendGlobalNotificationAction } from "@/app/admin/actions";

// Interactive User Management table actions
export function UserRowActions({
  userId,
  suspended,
  isPremium,
}: {
  userId: string;
  suspended: boolean;
  isPremium: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleToggleSuspend = async () => {
    setLoading(true);
    try {
      const res = await toggleSuspendUserAction(userId, !suspended);
      if (res.ok) {
        toast.success(suspended ? "Compte réactivé !" : "Compte suspendu !");
        router.refresh();
      } else {
        toast.error(res.error || "Une erreur est survenue.");
      }
    } catch {
      toast.error("Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePremium = async () => {
    setLoading(true);
    try {
      const res = await togglePremiumUserAction(userId, !isPremium);
      if (res.ok) {
        toast.success(isPremium ? "Abonnement révoqué." : "Abonnement premium activé !");
        router.refresh();
      } else {
        toast.error(res.error || "Une erreur est survenue.");
      }
    } catch {
      toast.error("Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleTogglePremium}
        disabled={loading}
        className={`gap-1 ${isPremium ? "border-amber-500/30 text-amber-600 hover:bg-amber-500/10" : ""}`}
      >
        <Sparkles className="size-3.5" />
        {isPremium ? "Retirer Premium" : "Offrir Premium"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleSuspend}
        disabled={loading}
        className={`gap-1 ${suspended ? "text-emerald-600 hover:bg-emerald-500/10" : "text-destructive hover:bg-destructive/10"}`}
      >
        {suspended ? <UserCheck className="size-3.5" /> : <UserX className="size-3.5" />}
        {suspended ? "Réactiver" : "Suspendre"}
      </Button>
    </div>
  );
}

// Client Search & Filter Component
export function UserFilters({
  currentSearch,
  currentStatus,
}: {
  currentSearch: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [search, setSearch] = React.useState(currentSearch);
  const [status, setStatus] = React.useState(currentStatus);

  const applyFilters = () => {
    const params = new URLSearchParams();
    params.set("tab", "users");
    if (search) params.set("search", search);
    if (status && status !== "all") params.set("status", status);
    router.push(`/admin?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3 items-center justify-between pb-4">
      <div className="flex flex-1 max-w-sm gap-2">
        <Input
          placeholder="Rechercher par nom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
        />
        <Button onClick={applyFilters} variant="secondary" className="shrink-0 gap-1.5">
          <Search className="size-4" />
          Filtrer
        </Button>
      </div>

      <div className="flex gap-2">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            const params = new URLSearchParams();
            params.set("tab", "users");
            if (search) params.set("search", search);
            if (e.target.value !== "all") params.set("status", e.target.value);
            router.push(`/admin?${params.toString()}`);
          }}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">Tous les statuts</option>
          <option value="premium">Premium</option>
          <option value="trial">Essai gratuit</option>
          <option value="free">Standard</option>
          <option value="suspended">Suspendu</option>
        </select>
      </div>
    </div>
  );
}

// Global notification form
export function GlobalNotificationForm() {
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [sending, setSending] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    setSending(true);
    try {
      const res = await sendGlobalNotificationAction(title, body);
      if (res.ok) {
        toast.success(res.message);
        setTitle("");
        setBody("");
      } else {
        toast.error(res.error || "Une erreur est survenue.");
      }
    } catch {
      toast.error("Erreur de communication.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div className="space-y-2">
        <label className="text-sm font-medium">Titre de la notification</label>
        <Input
          placeholder="Ex: Rappel questionnaire quotidien 🔔"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={sending}
          required
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Contenu du message</label>
        <textarea
          placeholder="Ex: Prenez une minute pour renseigner vos scores aujourd'hui et rester sur votre lancée !"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          disabled={sending}
          required
          rows={4}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <Button type="submit" disabled={sending} className="bg-primary text-white gap-2">
        {sending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Envoi en cours...
          </>
        ) : (
          <>
            <Send className="size-4" />
            Envoyer à tous les utilisateurs
          </>
        )}
      </Button>
    </form>
  );
}
