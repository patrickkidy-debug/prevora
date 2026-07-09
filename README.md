# Prevora — Plateforme de prévention santé propulsée par l'IA

Prevora aide les utilisateurs à suivre leur santé au quotidien, détecter des
tendances, améliorer leurs habitudes et recevoir des conseils de prévention
personnalisés.

> ⚠️ **Prevora ne fournit pas de diagnostic médical et ne remplace pas un
> professionnel de santé.** Toutes les recommandations rappellent de consulter
> un médecin en cas de symptômes persistants, aggravés ou préoccupants.

## Stack

- **Next.js 16** (App Router) · **React 19** · **TypeScript**
- **Tailwind CSS v4** · **shadcn/ui** (Radix) · **Framer Motion** · **Recharts**
- **Supabase Auth** (email + Google + Apple) · **PostgreSQL** · **Prisma 6**
- **React Hook Form** + **Zod**
- **IA modulaire** (OpenAI / Anthropic / mock — remplaçable via `AI_PROVIDER`)
- **PWA** installable (manifest, service worker, hors ligne, web-push)

## Architecture

```
src/
  app/
    (auth)/          Connexion, inscription, mot de passe, OAuth
    (app)/           Espace connecté : dashboard, questionnaire, historique,
                     rapports, alertes, objectifs, récompenses, profil, réglages
    api/             export RGPD, push, cron rappels
    auth/callback/   Échange de code OAuth / email
    share/[token]/   Partage sécurisé d'un rapport (lecture seule)
  components/        UI (ui/ = primitives shadcn), dashboard, questionnaire…
  config/            questionnaire (évolutif), site, gamification
  lib/
    ai/              Abstraction fournisseur IA (types, mock, openai, anthropic)
    supabase/        Clients browser / server / middleware / admin
    scoring.ts       Calcul déterministe des scores 0-100
    insights.ts      Moteur tendances + alertes (déterministe, explicable)
    pdf.ts           Export PDF premium (jsPDF)
    offline.ts       File d'attente hors ligne
    push.ts          Envoi web-push
  server/            Accès données (entries, alerts, reports)
prisma/schema.prisma Modèle de données santé complet
public/              manifest, service worker, icônes PWA
```

Le questionnaire est **piloté par la donnée** (`src/config/questionnaire.ts`) :
ajouter une question l'affiche et la persiste automatiquement — les champs non
mappés vont dans la colonne JSON `extra`, sans migration.

L'IA est **remplaçable** : implémentez l'interface `AIProvider`
(`src/lib/ai/types.ts`). Sans clé API, le fournisseur `mock` produit des
résumés déterministes pour que l'app fonctionne immédiatement.

## Démarrage

```bash
npm install
cp .env.example .env      # renseignez Supabase + (optionnel) clés IA / VAPID
npm run db:push           # crée les tables (nécessite DATABASE_URL / DIRECT_URL)
npm run dev
```

Ouvrez http://localhost:3000

### Variables d'environnement

Voir `.env.example`. Essentielles :

| Variable | Rôle |
|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Auth + client Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Suppression de compte (serveur) |
| `DATABASE_URL` / `DIRECT_URL` | Postgres (pooled / direct pour migrations) |
| `AI_PROVIDER` | `openai` \| `anthropic` \| `mock` |
| `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` | Clé du fournisseur choisi |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Notifications push |
| `CRON_SECRET` | Protège `/api/cron/reminders` |

Générer des clés VAPID : `npm run vapid`

### Auth Google / Apple

Activez les fournisseurs dans Supabase → Authentication → Providers, et ajoutez
l'URL de callback `${APP_URL}/auth/callback`.

## Scripts

| Script | Action |
|--------|--------|
| `npm run dev` | Développement |
| `npm run build` / `start` | Production |
| `npm run typecheck` | Vérification TypeScript |
| `npm run db:push` / `db:studio` | Schéma / explorateur Prisma |
| `npm run icons` | Régénère les icônes PWA |
| `npm run vapid` | Génère des clés VAPID |

## Rappels quotidiens (cron)

Planifiez un appel GET vers `/api/cron/reminders` avec l'en-tête
`x-cron-secret: $CRON_SECRET` (Vercel Cron, GitHub Actions…). Les utilisateurs
sans saisie du jour reçoivent un rappel push.

## Sécurité & confidentialité

- En-têtes CSP, HSTS, X-Frame-Options, Permissions-Policy (`next.config.ts`)
- Validation Zod côté serveur, rate limiting, protection CSRF via Supabase SSR
- Export RGPD (`/api/export`) et suppression de compte définitive
- Données de santé rattachées à l'utilisateur (Supabase Auth + cascade Prisma)

## Santé connectée (à venir)

Le modèle `ConnectedSource` prépare l'intégration d'Apple Health, Google Health
Connect, Google Fit, Fitbit, Garmin et Samsung Health.
