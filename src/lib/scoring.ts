import { clamp } from "@/lib/utils";

/**
 * Deterministic wellness scoring. Converts raw daily inputs into 0-100
 * sub-scores plus a composite wellbeing score. Pure functions, no AI —
 * these numbers are explainable and stable.
 *
 * NB: scores are wellness indicators, NOT a medical diagnosis.
 */

export interface ScoreInputs {
  sleepQuality?: number | null; // 0-10
  sleepHours?: number | null; // hours
  energy?: number | null; // 0-10
  mood?: number | null; // 0-10
  stress?: number | null; // 0-10 (higher = worse)
  anxiety?: number | null; // 0-10 (higher = worse)
  pain?: number | null; // 0-10 (higher = worse)
  fatigue?: number | null; // 0-10 (higher = worse)
  hydrationGlasses?: number | null;
  activityMinutes?: number | null;
  nutritionQuality?: number | null; // 0-10
}

export interface Scores {
  sleep: number;
  stress: number;
  activity: number;
  nutrition: number;
  hydration: number;
  wellbeing: number;
}

const scale10to100 = (v: number) => clamp(Math.round(v * 10));

/** Sleep: quality (0-10) blended with duration vs 7-9h optimal band. */
export function sleepScore(i: ScoreInputs): number | null {
  const parts: number[] = [];
  if (i.sleepQuality != null) parts.push(scale10to100(i.sleepQuality));
  if (i.sleepHours != null) {
    const h = i.sleepHours;
    let s: number;
    if (h >= 7 && h <= 9) s = 100;
    else if (h < 7) s = clamp(100 - (7 - h) * 22);
    else s = clamp(100 - (h - 9) * 15);
    parts.push(s);
  }
  if (i.energy != null) parts.push(scale10to100(i.energy));
  if (i.fatigue != null) parts.push(scale10to100(10 - i.fatigue));
  return avg(parts);
}

/** Stress score: inverted stress/anxiety plus mood. Higher = calmer. */
export function stressScore(i: ScoreInputs): number | null {
  const parts: number[] = [];
  if (i.stress != null) parts.push(scale10to100(10 - i.stress));
  if (i.anxiety != null) parts.push(scale10to100(10 - i.anxiety));
  if (i.mood != null) parts.push(scale10to100(i.mood));
  return avg(parts);
}

/** Activity: minutes vs 30min/day baseline, capped. */
export function activityScore(i: ScoreInputs): number | null {
  if (i.activityMinutes == null) return null;
  return clamp(Math.round((i.activityMinutes / 30) * 100));
}

export function nutritionScore(i: ScoreInputs): number | null {
  if (i.nutritionQuality == null) return null;
  return scale10to100(i.nutritionQuality);
}

/** Hydration: glasses vs ~8/day baseline. */
export function hydrationScore(i: ScoreInputs): number | null {
  if (i.hydrationGlasses == null) return null;
  return clamp(Math.round((i.hydrationGlasses / 8) * 100));
}

/** Composite wellbeing: weighted mean of available sub-scores. */
export function computeScores(i: ScoreInputs): Scores {
  const sleep = sleepScore(i);
  const stress = stressScore(i);
  const activity = activityScore(i);
  const nutrition = nutritionScore(i);
  const hydration = hydrationScore(i);

  const weighted: Array<[number | null, number]> = [
    [sleep, 0.3],
    [stress, 0.25],
    [activity, 0.2],
    [nutrition, 0.15],
    [hydration, 0.1],
  ];
  let sum = 0;
  let wsum = 0;
  for (const [v, w] of weighted) {
    if (v != null) {
      sum += v * w;
      wsum += w;
    }
  }
  const wellbeing = wsum > 0 ? Math.round(sum / wsum) : 0;

  return {
    sleep: sleep ?? 0,
    stress: stress ?? 0,
    activity: activity ?? 0,
    nutrition: nutrition ?? 0,
    hydration: hydration ?? 0,
    wellbeing,
  };
}

function avg(xs: number[]): number | null {
  if (xs.length === 0) return null;
  return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
}

/** Qualitative label + tailwind text color token for a 0-100 score. */
export function scoreLabel(score: number): { label: string; tone: string } {
  if (score >= 80) return { label: "Excellent", tone: "text-success" };
  if (score >= 60) return { label: "Bon", tone: "text-primary" };
  if (score >= 40) return { label: "Moyen", tone: "text-warning" };
  return { label: "À surveiller", tone: "text-destructive" };
}
