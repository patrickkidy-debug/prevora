export interface ReportData {
  summary: string;
  highlights: string[];
  recommendations: string[];
  averages: Record<string, number | null>;
  disclaimer: string;
}

export const METRIC_LABELS: Record<string, string> = {
  sleepHours: "Sommeil (h)",
  energy: "Énergie",
  mood: "Humeur",
  stress: "Stress",
  fatigue: "Fatigue",
  activityMinutes: "Activité (min)",
  hydrationGlasses: "Hydratation",
  nutritionQuality: "Nutrition",
  wellbeingScore: "Bien-être",
};

export const REPORT_TYPE_LABEL: Record<string, string> = {
  DAILY: "Quotidien",
  WEEKLY: "Hebdomadaire",
  MONTHLY: "Mensuel",
};
