import { getAIProvider } from "./index";
import type { ChatMessage } from "./types";
import { analyzeEntries, type EntryLike, type Analysis } from "@/lib/insights";
import { MEDICAL_DISCLAIMER } from "@/config/site";

const SYSTEM_PROMPT = `Tu es l'assistant santé de Prevora, une application de PRÉVENTION.
Règles absolues:
- Tu ne poses JAMAIS de diagnostic et ne nommes aucune maladie.
- Tu ne remplaces pas un professionnel de santé.
- Tu parles en français, ton bienveillant, clair et concret.
- Tu t'appuies uniquement sur les données fournies.
- Quand un signal est préoccupant, tu invites à consulter un professionnel de santé.
- Réponses courtes et actionnables.`;

export interface DailyInsight {
  summary: string;
  advice: string[];
  trends: string[];
  disclaimer: string;
}

function buildFallbackSummary(a: Analysis): string {
  const wb = a.averages.wellbeingScore;
  const head =
    wb != null
      ? `Votre bien-être moyen est de ${Math.round(wb)}/100 sur la semaine.`
      : "Continuez à enregistrer vos journées pour affiner votre suivi.";
  const trendLine = a.trends[0]?.text ?? "";
  return [head, trendLine].filter(Boolean).join(" ");
}

/** Daily narrative built from recent entries. Never diagnoses. */
export async function generateDailyInsight(
  entries: EntryLike[],
): Promise<DailyInsight> {
  const analysis = analyzeEntries(entries);
  const fallbackSummary = buildFallbackSummary(analysis);

  const payload = {
    averages: analysis.averages,
    trends: analysis.trends.map((t) => t.text),
    alerts: analysis.alerts.map((al) => `${al.title}: ${al.message}`),
  };

  const fallbackJson = JSON.stringify({
    summary: fallbackSummary,
    advice: analysis.advice,
    trends: analysis.trends.map((t) => t.text),
  });

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Voici les données santé récentes (agrégées):
${JSON.stringify(payload, null, 2)}

Rédige un résumé quotidien (2-3 phrases), puis 2 à 4 conseils de prévention.
Réponds en JSON strict: {"summary": string, "advice": string[], "trends": string[]}.

FALLBACK:${fallbackJson}`,
    },
  ];

  try {
    const raw = await getAIProvider().complete(messages, {
      json: true,
      temperature: 0.4,
    });
    const parsed = JSON.parse(raw) as Partial<DailyInsight>;
    return {
      summary: parsed.summary || fallbackSummary,
      advice: parsed.advice?.length ? parsed.advice : analysis.advice,
      trends: parsed.trends?.length
        ? parsed.trends
        : analysis.trends.map((t) => t.text),
      disclaimer: MEDICAL_DISCLAIMER,
    };
  } catch {
    return {
      summary: fallbackSummary,
      advice: analysis.advice,
      trends: analysis.trends.map((t) => t.text),
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }
}

export interface PeriodReport {
  summary: string;
  highlights: string[];
  recommendations: string[];
  analysis: Analysis;
  disclaimer: string;
}

/** Weekly / monthly narrative report. */
export async function generatePeriodReport(
  entries: EntryLike[],
  period: "weekly" | "monthly",
): Promise<PeriodReport> {
  const analysis = analyzeEntries(entries);
  const label = period === "weekly" ? "hebdomadaire" : "mensuel";
  const fallbackSummary = `Rapport ${label} basé sur ${entries.length} journée(s) enregistrée(s). ${buildFallbackSummary(
    analysis,
  )}`;

  const highlights = [
    ...analysis.trends.map((t) => t.text),
    ...analysis.alerts.map((a) => `${a.title} — ${a.message}`),
  ].slice(0, 6);

  const fallbackJson = JSON.stringify({
    summary: fallbackSummary,
    highlights,
    recommendations: analysis.advice,
  });

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Génère un rapport ${label} de prévention à partir de ces données:
${JSON.stringify(
  {
    averages: analysis.averages,
    trends: analysis.trends.map((t) => t.text),
    alerts: analysis.alerts.map((a) => `${a.title}: ${a.message}`),
    days: entries.length,
  },
  null,
  2,
)}

Réponds en JSON strict: {"summary": string, "highlights": string[], "recommendations": string[]}.

FALLBACK:${fallbackJson}`,
    },
  ];

  try {
    const raw = await getAIProvider().complete(messages, {
      json: true,
      temperature: 0.4,
      maxTokens: 900,
    });
    const parsed = JSON.parse(raw) as Partial<PeriodReport>;
    return {
      summary: parsed.summary || fallbackSummary,
      highlights: parsed.highlights?.length ? parsed.highlights : highlights,
      recommendations: parsed.recommendations?.length
        ? parsed.recommendations
        : analysis.advice,
      analysis,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  } catch {
    return {
      summary: fallbackSummary,
      highlights,
      recommendations: analysis.advice,
      analysis,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }
}
