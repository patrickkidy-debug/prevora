/**
 * Evolvable daily questionnaire definition.
 *
 * The questionnaire is data-driven: adding a question here makes it appear in
 * the form and be persisted. Mapped fields land in dedicated DailyEntry
 * columns; unmapped ones are stored in the `extra` JSON column so new questions
 * never require a migration.
 */

export type QuestionType =
  | "scale" // 0-10 slider
  | "number"
  | "boolean"
  | "text"
  | "select";

export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  /** DailyEntry column this maps to; omit to store in `extra`. */
  field?: string;
  type: QuestionType;
  label: string;
  help?: string;
  icon?: string; // lucide icon name
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  optional?: boolean;
  options?: QuestionOption[];
  /** For scale questions: is a HIGH value good (true) or bad (false)? */
  higherIsBetter?: boolean;
}

export interface QuestionSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export const QUESTIONNAIRE_VERSION = 1;

export const questionnaire: QuestionSection[] = [
  {
    id: "sleep",
    title: "Sommeil",
    description: "Comment avez-vous dormi ?",
    questions: [
      {
        id: "sleepQuality",
        field: "sleepQuality",
        type: "scale",
        label: "Qualité du sommeil",
        icon: "moon",
        min: 0,
        max: 10,
        higherIsBetter: true,
      },
      {
        id: "sleepHours",
        field: "sleepHours",
        type: "number",
        label: "Durée du sommeil",
        icon: "clock",
        unit: "h",
        min: 0,
        max: 16,
        step: 0.5,
      },
    ],
  },
  {
    id: "mind",
    title: "Énergie & humeur",
    questions: [
      {
        id: "energy",
        field: "energy",
        type: "scale",
        label: "Niveau d'énergie",
        icon: "battery-charging",
        higherIsBetter: true,
      },
      {
        id: "mood",
        field: "mood",
        type: "scale",
        label: "Humeur",
        icon: "smile",
        higherIsBetter: true,
      },
      {
        id: "stress",
        field: "stress",
        type: "scale",
        label: "Stress",
        icon: "activity",
        higherIsBetter: false,
      },
      {
        id: "anxiety",
        field: "anxiety",
        type: "scale",
        label: "Anxiété",
        icon: "wind",
        higherIsBetter: false,
      },
    ],
  },
  {
    id: "body",
    title: "Corps",
    questions: [
      {
        id: "pain",
        field: "pain",
        type: "scale",
        label: "Douleurs",
        icon: "zap",
        higherIsBetter: false,
      },
      {
        id: "fatigue",
        field: "fatigue",
        type: "scale",
        label: "Fatigue",
        icon: "bed",
        higherIsBetter: false,
      },
    ],
  },
  {
    id: "lifestyle",
    title: "Mode de vie",
    questions: [
      {
        id: "hydrationGlasses",
        field: "hydrationGlasses",
        type: "number",
        label: "Hydratation",
        help: "Nombre de verres d'eau",
        icon: "droplet",
        unit: "verres",
        min: 0,
        max: 20,
        step: 1,
      },
      {
        id: "activityMinutes",
        field: "activityMinutes",
        type: "number",
        label: "Activité physique",
        icon: "footprints",
        unit: "min",
        min: 0,
        max: 400,
        step: 5,
      },
      {
        id: "nutritionQuality",
        field: "nutritionQuality",
        type: "scale",
        label: "Qualité de l'alimentation",
        icon: "apple",
        higherIsBetter: true,
      },
      {
        id: "weightKg",
        field: "weightKg",
        type: "number",
        label: "Poids",
        icon: "scale",
        unit: "kg",
        min: 20,
        max: 350,
        step: 0.1,
        optional: true,
      },
    ],
  },
  {
    id: "vitals",
    title: "Constantes (facultatif)",
    description: "À renseigner si vous les mesurez.",
    questions: [
      {
        id: "temperatureC",
        field: "temperatureC",
        type: "number",
        label: "Température",
        icon: "thermometer",
        unit: "°C",
        min: 34,
        max: 43,
        step: 0.1,
        optional: true,
      },
      {
        id: "systolic",
        field: "systolic",
        type: "number",
        label: "Tension systolique",
        icon: "heart-pulse",
        unit: "mmHg",
        min: 70,
        max: 250,
        optional: true,
      },
      {
        id: "diastolic",
        field: "diastolic",
        type: "number",
        label: "Tension diastolique",
        icon: "heart-pulse",
        unit: "mmHg",
        min: 40,
        max: 150,
        optional: true,
      },
      {
        id: "heartRate",
        field: "heartRate",
        type: "number",
        label: "Fréquence cardiaque",
        icon: "heart",
        unit: "bpm",
        min: 30,
        max: 220,
        optional: true,
      },
      {
        id: "glucose",
        field: "glucose",
        type: "number",
        label: "Glycémie",
        icon: "candy",
        unit: "g/L",
        min: 0.3,
        max: 5,
        step: 0.01,
        optional: true,
      },
    ],
  },
  {
    id: "adherence",
    title: "Suivi",
    questions: [
      {
        id: "medicationTaken",
        field: "medicationTaken",
        type: "boolean",
        label: "Médicaments pris",
        icon: "pill",
        optional: true,
      },
      {
        id: "newSymptoms",
        field: "newSymptoms",
        type: "text",
        label: "Nouveaux symptômes",
        icon: "stethoscope",
        optional: true,
      },
      {
        id: "alcoholUnits",
        field: "alcoholUnits",
        type: "number",
        label: "Alcool",
        icon: "wine",
        unit: "verres",
        min: 0,
        max: 30,
        optional: true,
      },
      {
        id: "tobaccoCount",
        field: "tobaccoCount",
        type: "number",
        label: "Tabac",
        icon: "cigarette",
        unit: "cig.",
        min: 0,
        max: 80,
        optional: true,
      },
      {
        id: "comments",
        field: "comments",
        type: "text",
        label: "Commentaires libres",
        icon: "message-square",
        optional: true,
      },
    ],
  },
];

/** Flat list of all questions. */
export const allQuestions: Question[] = questionnaire.flatMap((s) => s.questions);

/** Fields backed by a real DailyEntry column. */
export const mappedFields = new Set(
  allQuestions.filter((q) => q.field).map((q) => q.field as string),
);
