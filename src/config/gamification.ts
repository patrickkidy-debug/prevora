export interface UserStats {
  totalEntries: number;
  currentStreak: number;
  longestStreak: number;
  reportsCount: number;
}

export interface BadgeDef {
  code: string;
  name: string;
  description: string;
  icon: string; // emoji
  tier: "bronze" | "silver" | "gold";
  unlocked: (s: UserStats) => boolean;
}

export const BADGES: BadgeDef[] = [
  {
    code: "first_entry",
    name: "Premier pas",
    description: "Compléter votre premier questionnaire",
    icon: "🌱",
    tier: "bronze",
    unlocked: (s) => s.totalEntries >= 1,
  },
  {
    code: "streak_3",
    name: "En route",
    description: "3 jours de suite",
    icon: "🔥",
    tier: "bronze",
    unlocked: (s) => s.longestStreak >= 3,
  },
  {
    code: "streak_7",
    name: "Semaine parfaite",
    description: "7 jours de suite",
    icon: "⭐",
    tier: "silver",
    unlocked: (s) => s.longestStreak >= 7,
  },
  {
    code: "streak_30",
    name: "Discipline",
    description: "30 jours de suite",
    icon: "🏆",
    tier: "gold",
    unlocked: (s) => s.longestStreak >= 30,
  },
  {
    code: "entries_10",
    name: "Régularité",
    description: "10 journées enregistrées",
    icon: "📈",
    tier: "bronze",
    unlocked: (s) => s.totalEntries >= 10,
  },
  {
    code: "entries_50",
    name: "Assidu",
    description: "50 journées enregistrées",
    icon: "💪",
    tier: "silver",
    unlocked: (s) => s.totalEntries >= 50,
  },
  {
    code: "first_report",
    name: "Bilan",
    description: "Générer un premier rapport",
    icon: "📄",
    tier: "bronze",
    unlocked: (s) => s.reportsCount >= 1,
  },
];

export interface ChallengeDef {
  code: string;
  title: string;
  description: string;
  icon: string;
  reward: number;
}

export const CHALLENGES: ChallengeDef[] = [
  {
    code: "hydration_week",
    title: "Défi hydratation",
    description: "8 verres d'eau par jour pendant 7 jours",
    icon: "💧",
    reward: 50,
  },
  {
    code: "move_week",
    title: "Défi mouvement",
    description: "30 min d'activité par jour pendant 7 jours",
    icon: "🏃",
    reward: 60,
  },
  {
    code: "sleep_week",
    title: "Défi sommeil",
    description: "7h+ de sommeil pendant 7 jours",
    icon: "😴",
    reward: 50,
  },
];

/** Derived XP + level from raw stats. */
export function computeProgress(s: UserStats) {
  const xp = s.totalEntries * 10 + s.longestStreak * 5 + s.reportsCount * 15;
  const level = Math.floor(xp / 100) + 1;
  const xpIntoLevel = xp % 100;
  return { xp, level, xpIntoLevel, xpToNext: 100 - xpIntoLevel };
}
