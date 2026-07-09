import { prisma } from "@/lib/prisma";
import { getUserPremiumStatus } from "@/lib/premium";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { redirect } from "next/navigation";
import { Users, Sparkles, Clock, Coins, UserX, UserCheck, ShieldAlert, AlertCircle, FileText, Send, Radio } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRowActions, UserFilters, GlobalNotificationForm } from "@/components/admin/admin-views";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; search?: string; status?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab || "dashboard";
  const search = params.search || "";
  const status = params.status || "all";

  // --- Fetch Global KPIs ---
  const [totalUsers, activePremiums, activeTrials, successfulPayments] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        isPremium: true,
        OR: [
          { premiumExpiresAt: null },
          { premiumExpiresAt: { gt: new Date() } }
        ],
      },
    }),
    prisma.user.count({
      where: {
        trialExpiresAt: { gt: new Date() },
        isPremium: false,
      },
    }),
    prisma.payment.findMany({
      where: { status: "SUCCESS" },
      select: { amount: true },
    }),
  ]);

  const totalRevenue = successfulPayments.reduce((acc, p) => acc + p.amount, 0);

  // --- Tab 1: Vue Générale ---
  if (tab === "dashboard") {
    const [recentUsers, recentPayments] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { user: true },
      }),
    ]);

    // Build unified chronological activity feed
    const activityFeed = [
      ...recentUsers.map((u) => ({
        type: "signup",
        title: `Nouvelle inscription : ${u.email}`,
        time: u.createdAt,
        detail: u.name ? `Nom : ${u.name}` : "Profil non configuré",
      })),
      ...recentPayments.map((p) => ({
        type: "payment",
        title: `Paiement Premium de ${p.user.email}`,
        time: p.createdAt,
        detail: `${p.amount.toFixed(2)} EUR (${p.status})`,
      })),
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 10);

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tableau de bord administrateur</h1>
          <p className="text-sm text-muted-foreground">
            Indicateurs clés de performance (KPI) et flux d&apos;activité récent.
          </p>
        </div>

        {/* KPI Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Utilisateurs
              </CardTitle>
              <Users className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-0.5">Comptes enregistrés</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Abonnements
              </CardTitle>
              <Sparkles className="size-4 text-amber-500 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{activePremiums}</div>
              <p className="text-xs text-muted-foreground mt-0.5">Abonnés Premium actifs</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Essais en cours
              </CardTitle>
              <Clock className="size-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeTrials}</div>
              <p className="text-xs text-muted-foreground mt-0.5">Période de 1.5h active</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Revenus cumulés
              </CardTitle>
              <Coins className="size-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {totalRevenue.toFixed(2)} €
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Simulé via checkout</p>
            </CardContent>
          </Card>
        </div>

        {/* Activity Logs & Audit Feed */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Chronological Logs */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Radio className="size-4 text-primary animate-pulse" />
                Journal d&apos;activité récent
              </CardTitle>
              <CardDescription>Flux d&apos;inscription et de paiement en direct</CardDescription>
            </CardHeader>
            <CardContent className="p-0 border-t">
              {activityFeed.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Aucun événement récent.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {activityFeed.map((item, idx) => (
                    <div key={idx} className="p-4 text-sm flex gap-3 items-start">
                      <span
                        className={`mt-0.5 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase shrink-0 ${
                          item.type === "signup"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {item.type === "signup" ? "User" : "Pay"}
                      </span>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.detail}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                        {format(item.time, "HH:mm:ss", { locale: fr })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick instructions / Help */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="size-4 text-amber-500" />
                Informations confidentielles
              </CardTitle>
              <CardDescription>Directives de conformité Prevora</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <p>
                Conformément aux réglementations sur les données de santé (RGPD / HDS), les données personnelles et confidentielles saisies par les utilisateurs dans leurs questionnaires quotidiens (durée de sommeil, humeurs, douleurs physiques, symptômes particuliers, traitements médicaux, constantes corporelles) ne sont <strong>pas accessibles</strong> depuis cet espace d&apos;administration.
              </p>
              <p>
                Vous pouvez suspendre ou réactiver l&apos;accès d&apos;un utilisateur en cas de violation des conditions d&apos;utilisation, ou lui offrir/retirer le statut premium à des fins de fidélisation ou de support client.
              </p>
              <p>
                Les alertes et rapports de santé restent strictement privés à l&apos;utilisateur.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- Tab 2: Utilisateurs Directory ---
  if (tab === "users") {
    // Build filter where clause
    const whereClause: Record<string, any> = {};
    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "premium") {
      whereClause.isPremium = true;
      whereClause.premiumExpiresAt = { gt: new Date() };
    } else if (status === "trial") {
      whereClause.trialExpiresAt = { gt: new Date() };
      whereClause.isPremium = false;
    } else if (status === "suspended") {
      whereClause.suspended = true;
    } else if (status === "free") {
      whereClause.isPremium = false;
      whereClause.OR = [
        { trialExpiresAt: null },
        { trialExpiresAt: { lte: new Date() } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-sans">Répertoire des utilisateurs</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les autorisations, le statut premium et l&apos;accès des utilisateurs.
          </p>
        </div>

        {/* Filters */}
        <UserFilters currentSearch={search} currentStatus={status} />

        {/* User list table */}
        <Card className="shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-900 border-b border-border text-xs uppercase font-semibold text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Utilisateur</th>
                  <th className="px-6 py-3.5">Créé le</th>
                  <th className="px-6 py-3.5 font-mono">Level</th>
                  <th className="px-6 py-3.5">Statut</th>
                  <th className="px-6 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm">
                      Aucun utilisateur correspondant à votre recherche.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const prem = getUserPremiumStatus({
                      suspended: u.suspended,
                      isPremium: u.isPremium,
                      premiumExpiresAt: u.premiumExpiresAt,
                      trialExpiresAt: u.trialExpiresAt,
                    });

                    return (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">{u.name || "N/A"}</div>
                          <div className="text-xs text-muted-foreground font-mono">{u.email}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {format(u.createdAt, "dd/MM/yyyy", { locale: fr })}
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-semibold">
                          Lv.{u.level} ({u.xp} XP)
                        </td>
                        <td className="px-6 py-4">
                          {u.suspended ? (
                            <span className="inline-flex rounded-full bg-destructive/15 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                              Suspendu
                            </span>
                          ) : prem.reason === "subscription" ? (
                            <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              Premium
                            </span>
                          ) : prem.reason === "trial" ? (
                            <span className="inline-flex rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                              Essai gratuit
                            </span>
                          ) : prem.reason === "expired" ? (
                            <span className="inline-flex rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                              Essai expiré
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-slate-500/15 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                              Standard
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <UserRowActions
                            userId={u.id}
                            suspended={u.suspended}
                            isPremium={prem.isPremium}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  // --- Tab 3: Notification Globale ---
  if (tab === "push") {
    const totalSubs = await prisma.pushSubscription.count();

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notification globale</h1>
          <p className="text-sm text-muted-foreground">
            Diffusez une notification push en temps réel à l&apos;intégralité des appareils abonnés.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="size-4 text-primary" />
                Message push de diffusion
              </CardTitle>
              <CardDescription>Envoyez une alerte sur tous les mobiles et ordinateurs enregistrés</CardDescription>
            </CardHeader>
            <CardContent>
              <GlobalNotificationForm />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Audience Push</CardTitle>
              <CardDescription>Appareils de diffusion</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-secondary/50 p-4 border border-border/40 text-center">
                <div className="text-4xl font-bold font-mono text-primary">{totalSubs}</div>
                <div className="text-xs text-muted-foreground mt-1">Appareil(s) actuellement abonnés</div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Les notifications push ne sont distribuées qu&apos;aux utilisateurs ayant activé l&apos;option dans les réglages de leur navigateur ou ayant installé la PWA de Prevora.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return redirect("/admin");
}
