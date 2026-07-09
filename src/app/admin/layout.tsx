import { requireUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { LayoutDashboard, Users, Send, Settings, ArrowLeft, ShieldAlert } from "lucide-react";

export const metadata = { title: "Prevora Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  // Enforce admin permission
  if (user.email !== "patrickkidy@gmail.com") {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background p-6">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="size-8" />
        </div>
        <h1 className="text-xl font-bold">Accès Interdit</h1>
        <p className="text-center text-sm text-muted-foreground max-w-sm">
          Seul l&apos;administrateur principal de la plateforme (patrickkidy@gmail.com) est autorisé à accéder à cette zone.
        </p>
        <Link
          href="/dashboard"
          className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" /> Retourner à l&apos;application
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[16rem_1fr]">
      {/* Admin Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col border-r bg-slate-900 text-slate-100 p-4 md:flex">
        <div className="px-2 py-1.5 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              Admin
            </span>
            <span className="font-semibold text-sm tracking-wide">Prevora Portal</span>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-800 text-slate-300 hover:text-slate-100"
          >
            <LayoutDashboard className="size-4" />
            Vue Générale
          </Link>
          <Link
            href="/admin?tab=users"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-800 text-slate-300 hover:text-slate-100"
          >
            <Users className="size-4" />
            Utilisateurs
          </Link>
          <Link
            href="/admin?tab=push"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-800 text-slate-300 hover:text-slate-100"
          >
            <Send className="size-4" />
            Notification Globale
          </Link>
        </nav>

        <div className="border-t border-slate-800 pt-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-800 text-slate-400 hover:text-slate-100"
          >
            <ArrowLeft className="size-4" />
            Quitter le panel
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col bg-slate-50 dark:bg-slate-950/20">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-lg">
          <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
            Espace d&apos;Administration
          </h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Connecté : <strong className="font-semibold text-foreground">{user.email}</strong>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
