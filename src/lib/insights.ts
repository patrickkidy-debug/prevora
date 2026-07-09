/**
 * Deterministic health-insight engine.
 *
 * Pure, explainable analysis of daily entries: averages, trends (week over
 * week) and prevention alerts. No AI and NO diagnosis — it only surfaces
 * patterns and, when appropriate, advises consulting a professional.
 */

export interface EntryLike {
  date: Date | string;
  sleepQuality?: number | null;
  sleepHours?: number | null;
  energy?: number | null;
  mood?: number | null;
  stress?: number | null;
  anxiety?: number | null;
  pain?: number | null;
  fatigue?: number | null;
  hydrationGlasses?: number | null;
  activityMinutes?: number | null;
  nutritionQuality?: number | null;
  weightKg?: number | null;
  wellbeingScore?: number | null;
}

export type TrendDirection = "up" | "down" | "stable";

export interface Trend {
  metric: string;
  label: string;
  direction: TrendDirection;
  deltaPct: number;
  text: string;
}

export interface DetectedAlert {
  type: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  recommendation?: string;
  consultAdvised: boolean;
}

export interface Analysis {
  averages: Record<string, number | null>;
  trends: Trend[];
  alerts: DetectedAlert[];
  advice: string[];
}

const num = (v: unknown): number | null =>
  typeof v === "number" && !Number.isNaN(v) ? v : null;

function mean(values: Array<number | null | undefined>): number | null {
  const xs = values.filter((v): v is number => typeof v === "number");
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

function count(values: Array<number | null | undefined>, pred: (n: number) => boolean) {
  return values.filter((v) => typeof v === "number" && pred(v)).length;
}

const METRIC_LABELS: Record<string, string> = {
  sleepHours: "Sommeil",
  sleepQuality: "Qualité du sommeil",
  energy: "Énergie",
  mood: "Humeur",
  stress: "Stress",
  fatigue: "Fatigue",
  activityMinutes: "Activité",
  hydrationGlasses: "Hydratation",
  nutritionQuality: "Nutrition",
  wellbeingScore: "Bien-être",
};

/** Analyze entries sorted oldest -> newest. */
export function analyzeEntries(entries: EntryLike[]): Analysis {
  const sorted = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  const last7 = sorted.slice(-7);
  const prev7 = sorted.slice(-14, -7);

  const metrics = [
    "sleepHours",
    "energy",
    "mood",
    "stress",
    "fatigue",
    "activityMinutes",
    "hydrationGlasses",
    "nutritionQuality",
    "wellbeingScore",
  ] as const;

  const averages: Record<string, number | null> = {};
  const trends: Trend[] = [];

  for (const m of metrics) {
    const cur = mean(last7.map((e) => num(e[m])));
    const prv = mean(prev7.map((e) => num(e[m])));
    averages[m] = cur;
    if (cur == null || prv == null || prv === 0) continue;

    const deltaPct = ((cur - prv) / Math.abs(prv)) * 100;
    if (Math.abs(deltaPct) < 8) continue;

    const direction: TrendDirection = deltaPct > 0 ? "up" : "down";
    const rising = direction === "up";
    const goodWhenUp = !["stress", "fatigue"].includes(m);
    const positive = rising === goodWhenUp;
    trends.push({
      metric: m,
      label: METRIC_LABELS[m] ?? m,
      direction,
      deltaPct: Math.round(deltaPct),
      text: `${METRIC_LABELS[m]} ${rising ? "en hausse" : "en baisse"} de ${Math.abs(
        Math.round(deltaPct),
      )} % sur 7 jours${positive ? " — bonne dynamique." : " — à surveiller."}`,
    });
  }

  const alerts = detectAlerts(last7, prev7);
  const advice = buildAdvice(averages, alerts);

  return { averages, trends, alerts, advice };
}

function detectAlerts(last7: EntryLike[], prev7: EntryLike[]): DetectedAlert[] {
  const alerts: DetectedAlert[] = [];

  // Persistent fatigue: high fatigue on >= 3 of last recorded days.
  const fatigueDays = count(last7.map((e) => e.fatigue), (n) => n >= 7);
  if (fatigueDays >= 3) {
    alerts.push({
      type: "persistent_fatigue",
      severity: "WARNING",
      title: "Fatigue persistante",
      message: `Fatigue élevée relevée sur ${fatigueDays} jours récents.`,
      recommendation:
        "Veillez à votre sommeil et votre récupération. Si la fatigue persiste, parlez-en à un professionnel de santé.",
      consultAdvised: true,
    });
  }

  // Sleep drop.
  const sleepNow = mean(last7.map((e) => e.sleepHours));
  const sleepPrev = mean(prev7.map((e) => e.sleepHours));
  if (sleepNow != null && sleepPrev != null && sleepNow < sleepPrev - 1) {
    alerts.push({
      type: "sleep_drop",
      severity: "WARNING",
      title: "Baisse du sommeil",
      message: `Votre sommeil moyen est passé de ${sleepPrev.toFixed(1)}h à ${sleepNow.toFixed(1)}h.`,
      recommendation: "Essayez de retrouver un rythme de coucher régulier.",
      consultAdvised: false,
    });
  }

  // Rising stress.
  const stressNow = mean(last7.map((e) => e.stress));
  const stressPrev = mean(prev7.map((e) => e.stress));
  if (stressNow != null && stressPrev != null && stressNow > stressPrev + 1.5) {
    alerts.push({
      type: "stress_increase",
      severity: "WARNING",
      title: "Augmentation du stress",
      message: "Votre niveau de stress moyen augmente nettement.",
      recommendation:
        "Intégrez des pauses, de la respiration ou de la marche. Consultez si le stress devient difficile à gérer.",
      consultAdvised: true,
    });
  }

  // Repeated pain.
  const painDays = count(last7.map((e) => e.pain), (n) => n >= 6);
  if (painDays >= 3) {
    alerts.push({
      type: "repeated_pain",
      severity: "WARNING",
      title: "Douleurs répétées",
      message: `Douleurs notables sur ${painDays} jours récents.`,
      recommendation:
        "Des douleurs qui persistent méritent l'avis d'un professionnel de santé.",
      consultAdvised: true,
    });
  }

  // Low activity.
  const activityAvg = mean(last7.map((e) => e.activityMinutes));
  if (activityAvg != null && activityAvg < 15 && last7.length >= 4) {
    alerts.push({
      type: "low_activity",
      severity: "INFO",
      title: "Activité insuffisante",
      message: "Votre activité physique est faible cette semaine.",
      recommendation: "Visez au moins 30 minutes de marche par jour.",
      consultAdvised: false,
    });
  }

  // Weight change (uses first vs last available weight in window).
  const weights = last7
    .map((e) => ({ d: new Date(e.date).getTime(), w: num(e.weightKg) }))
    .filter((x) => x.w != null) as Array<{ d: number; w: number }>;
  if (weights.length >= 2) {
    const first = weights[0].w;
    const lastW = weights[weights.length - 1].w;
    const diff = lastW - first;
    if (Math.abs(diff) >= 2) {
      const gain = diff > 0;
      alerts.push({
        type: gain ? "weight_gain" : "weight_loss",
        severity: "WARNING",
        title: gain ? "Prise de poids importante" : "Perte de poids inhabituelle",
        message: `Variation de poids de ${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg récemment.`,
        recommendation:
          "Une variation rapide et non intentionnelle du poids justifie un avis médical.",
        consultAdvised: true,
      });
    }
  }

  return alerts;
}

function buildAdvice(
  averages: Record<string, number | null>,
  alerts: DetectedAlert[],
): string[] {
  const advice: string[] = [];
  const sleep = averages.sleepHours;
  const hydration = averages.hydrationGlasses;
  const activity = averages.activityMinutes;
  const nutrition = averages.nutritionQuality;

  if (sleep != null && sleep < 7)
    advice.push("Visez 7 à 9 h de sommeil pour une meilleure récupération.");
  if (hydration != null && hydration < 6)
    advice.push("Augmentez votre hydratation : environ 8 verres d'eau par jour.");
  if (activity != null && activity < 30)
    advice.push("Ajoutez un peu d'activité : une marche quotidienne fait la différence.");
  if (nutrition != null && nutrition < 6)
    advice.push("Privilégiez des repas équilibrés riches en fruits et légumes.");

  if (advice.length === 0 && alerts.length === 0)
    advice.push("Continuez ainsi, vos habitudes sont sur la bonne voie !");

  return advice.slice(0, 4);
}
