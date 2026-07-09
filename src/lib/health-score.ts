export interface HealthScoreBreakdown {
  score: number;
  sleep: number;
  mind: number;
  physical: number;
  lifestyle: number;
  adherence: number;
  trends: number;
  explanations: string[];
}

/**
 * Modular and extensible Prevora Health Score engine (0-100 scale).
 * Calculates wellness based on current inputs, streaks, and recent trends.
 */
export function calculatePrevoraHealthScore(
  today: {
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
    medicationTaken?: boolean | null;
  } | null,
  history: Array<{ wellbeingScore?: number | null }> = [],
  streakCount: number = 0
): HealthScoreBreakdown {
  const explanations: string[] = [];
  
  if (!today) {
    return {
      score: 0,
      sleep: 0,
      mind: 0,
      physical: 0,
      lifestyle: 0,
      adherence: 0,
      trends: 0,
      explanations: ["Aucune donnée saisie aujourd'hui pour calculer le score."],
    };
  }

  // 1. Sleep Sub-score (20%)
  const sleepQualityVal = today.sleepQuality != null ? today.sleepQuality * 10 : null;
  let sleepHoursVal = null;
  if (today.sleepHours != null) {
    const h = today.sleepHours;
    if (h >= 7 && h <= 9) sleepHoursVal = 100;
    else if (h < 7) sleepHoursVal = Math.max(0, 100 - (7 - h) * 22);
    else sleepHoursVal = Math.max(0, 100 - (h - 9) * 15);
  }
  const sleepParts = [sleepQualityVal, sleepHoursVal].filter((v) => v !== null) as number[];
  const sleepScoreVal = sleepParts.length > 0 ? Math.round(sleepParts.reduce((a, b) => a + b, 0) / sleepParts.length) : 70;

  if (sleepScoreVal >= 80) {
    explanations.push("Votre sommeil contribue positivement à votre vitalité.");
  } else if (sleepScoreVal < 50) {
    explanations.push("Votre sommeil est perturbé ou insuffisant ces derniers temps.");
  }

  // 2. Mind & Mood Sub-score (20%)
  const mindParts: number[] = [];
  if (today.energy != null) mindParts.push(today.energy * 10);
  if (today.mood != null) mindParts.push(today.mood * 10);
  if (today.stress != null) mindParts.push((10 - today.stress) * 10);
  if (today.anxiety != null) mindParts.push((10 - today.anxiety) * 10);
  const mindScoreVal = mindParts.length > 0 ? Math.round(mindParts.reduce((a, b) => a + b, 0) / mindParts.length) : 70;

  if (today.stress != null && today.stress <= 3) {
    explanations.push("Votre niveau de stress est bas et maîtrisé.");
  } else if (today.stress != null && today.stress >= 7) {
    explanations.push("Votre niveau de stress est élevé aujourd'hui.");
  }

  // 3. Physical & Body Sub-score (15%)
  const physicalParts: number[] = [];
  if (today.pain != null) physicalParts.push((10 - today.pain) * 10);
  if (today.fatigue != null) physicalParts.push((10 - today.fatigue) * 10);
  const physicalScoreVal = physicalParts.length > 0 ? Math.round(physicalParts.reduce((a, b) => a + b, 0) / physicalParts.length) : 80;

  if (today.pain != null && today.pain >= 5) {
    explanations.push("Des douleurs notables affectent votre score aujourd'hui.");
  }

  // 4. Lifestyle & Habits Sub-score (20%)
  const lifestyleParts: number[] = [];
  if (today.hydrationGlasses != null) {
    lifestyleParts.push(Math.min(100, (today.hydrationGlasses / 8) * 100));
    if (today.hydrationGlasses < 5) {
      explanations.push("Pensez à boire plus d'eau pour améliorer votre hydratation.");
    }
  }
  if (today.activityMinutes != null) {
    lifestyleParts.push(Math.min(100, (today.activityMinutes / 30) * 100));
    if (today.activityMinutes >= 30) {
      explanations.push("Votre activité physique est excellente aujourd'hui.");
    } else if (today.activityMinutes < 15) {
      explanations.push("Votre activité physique est un peu basse ces derniers temps.");
    }
  }
  if (today.nutritionQuality != null) {
    lifestyleParts.push(today.nutritionQuality * 10);
  }
  const lifestyleScoreVal = lifestyleParts.length > 0 ? Math.round(lifestyleParts.reduce((a, b) => a + b, 0) / lifestyleParts.length) : 70;

  // 5. Adherence & Regularity Sub-score (15%)
  const adherenceParts: number[] = [];
  if (today.medicationTaken !== undefined && today.medicationTaken !== null) {
    adherenceParts.push(today.medicationTaken ? 100 : 0);
    if (!today.medicationTaken) {
      explanations.push("Pensez à prendre vos traitements régulièrement.");
    }
  } else {
    adherenceParts.push(100); // Default to compliant if not tracking
  }
  
  // Regularity based on streak (e.g. 7 days streak = 100%)
  const streakPct = Math.min(100, (streakCount / 7) * 100);
  adherenceParts.push(streakPct);
  const adherenceScoreVal = Math.round(adherenceParts.reduce((a, b) => a + b, 0) / adherenceParts.length);

  if (streakCount >= 7) {
    explanations.push("Félicitations pour votre régularité de saisie de 7 jours ! 🎉");
  }

  // 6. Trends Sub-score (10%)
  let trendsScoreVal = 100;
  const historyWithScores = history.filter((e) => e.wellbeingScore != null) as Array<{ wellbeingScore: number }>;
  if (historyWithScores.length > 0) {
    const avgScore = historyWithScores.reduce((sum, e) => sum + e.wellbeingScore, 0) / historyWithScores.length;
    // Calculate current tentative base score (before trend weight)
    const baseScore = Math.round(
      sleepScoreVal * 0.22 +
      mindScoreVal * 0.22 +
      physicalScoreVal * 0.17 +
      lifestyleScoreVal * 0.22 +
      adherenceScoreVal * 0.17
    );
    if (baseScore >= avgScore) {
      trendsScoreVal = 100;
      if (baseScore > avgScore + 5) {
        explanations.push("Votre score global est en nette progression cette semaine.");
      }
    } else {
      trendsScoreVal = Math.max(0, Math.round(100 - (avgScore - baseScore) * 6));
      explanations.push("Votre score est en légère baisse par rapport à vos moyennes.");
    }
  }

  if (explanations.length === 0) {
    explanations.push("Votre score de bien-être est stable et équilibré.");
  }

  // Final Composite Prevora Health Score
  const score = Math.round(
    sleepScoreVal * 0.20 +
    mindScoreVal * 0.20 +
    physicalScoreVal * 0.15 +
    lifestyleScoreVal * 0.20 +
    adherenceScoreVal * 0.15 +
    trendsScoreVal * 0.10
  );

  return {
    score,
    sleep: sleepScoreVal,
    mind: mindScoreVal,
    physical: physicalScoreVal,
    lifestyle: lifestyleScoreVal,
    adherence: adherenceScoreVal,
    trends: trendsScoreVal,
    explanations: explanations.slice(0, 4), // Cap at 4 key bullet points
  };
}
