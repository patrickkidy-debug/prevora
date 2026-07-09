import { requireUser } from "@/lib/auth";
import { getEntryForDate } from "@/server/entries";
import { allQuestions } from "@/config/questionnaire";
import { emptyEntryValues } from "@/lib/validations/entry";
import { toDateKey } from "@/lib/utils";
import { QuestionnaireForm } from "@/components/questionnaire/questionnaire-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata = { title: "Questionnaire quotidien" };

export default async function QuestionnairePage() {
  const user = await requireUser();
  const today = toDateKey(new Date());
  const entry = await getEntryForDate(user.id, today);

  // Prefill from an existing entry (mapped columns + `extra` JSON).
  const defaults: Record<string, unknown> = { ...emptyEntryValues };
  if (entry) {
    const extra = (entry.extra as Record<string, unknown> | null) ?? {};
    for (const q of allQuestions) {
      const mapped = q.field
        ? (entry as Record<string, unknown>)[q.field]
        : undefined;
      const value = mapped ?? extra[q.id];
      if (value !== null && value !== undefined) defaults[q.id] = value;
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Questionnaire quotidien</CardTitle>
          <CardDescription>
            {entry
              ? "Vous avez déjà répondu aujourd'hui — modifiez vos réponses si besoin."
              : "Prenez une minute pour renseigner votre journée."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuestionnaireForm defaultValues={defaults} dateKey={today} />
        </CardContent>
      </Card>
    </div>
  );
}
