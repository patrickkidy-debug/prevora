"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, Loader2, Save, LogOut, ArrowRight, Play, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { allQuestions, type Question } from "@/config/questionnaire";
import { entryFormSchema } from "@/lib/validations/entry";
import { submitEntryAction } from "@/app/(app)/questionnaire/actions";
import { queueEntry } from "@/lib/offline";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuestionField } from "./question-field";
import { MEDICAL_DISCLAIMER } from "@/config/site";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Virtual questionnaire questions used to toggle sections dynamically
const virtualQuestions: Record<string, Question> = {
  trackHabits: {
    id: "trackHabits",
    type: "boolean",
    label: "Avez-vous consommé de l'alcool ou du tabac aujourd'hui ?",
    icon: "wine",
    optional: true,
  },
  trackMeds: {
    id: "trackMeds",
    type: "boolean",
    label: "Souhaitez-vous renseigner des prises de médicaments ?",
    icon: "pill",
    optional: true,
  },
  trackVitals: {
    id: "trackVitals",
    type: "boolean",
    label: "Souhaitez-vous renseigner vos constantes médicales (poids, tension, etc.) ?",
    icon: "heart-pulse",
    optional: true,
  }
};

export function QuestionnaireForm({
  defaultValues,
  dateKey,
}: {
  defaultValues: Record<string, unknown>;
  dateKey: string;
}) {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [draftPrompt, setDraftPrompt] = React.useState(false);

  const form = useForm({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      ...defaultValues,
      trackHabits: defaultValues.trackHabits || false,
      trackMeds: defaultValues.trackMeds || false,
      trackVitals: defaultValues.trackVitals || false,
    },
    mode: "onChange",
  });

  const formValues = form.watch();

  // Dynamically compute active questions based on user answers
  const activeQuestions = React.useMemo(() => {
    const list: Question[] = [];

    // Helper to find question details
    const findQ = (id: string) => allQuestions.find((q) => q.id === id);

    // 1. Sommeil (Core)
    const qSleepQuality = findQ("sleepQuality");
    const qSleepHours = findQ("sleepHours");
    if (qSleepQuality) list.push(qSleepQuality);
    if (qSleepHours) list.push(qSleepHours);

    // 2. Énergie & humeur (Core)
    const qEnergy = findQ("energy");
    const qMood = findQ("mood");
    const qStress = findQ("stress");
    if (qEnergy) list.push(qEnergy);
    if (qMood) list.push(qMood);
    if (qStress) list.push(qStress);

    // Dynamic Follow-up: Anxiety (if stress >= 6 or mood <= 4)
    if (Number(formValues.stress) >= 6 || (formValues.mood !== undefined && Number(formValues.mood) <= 4)) {
      const qAnxiety = findQ("anxiety");
      if (qAnxiety) list.push(qAnxiety);
    }

    // 3. Corps (Core)
    const qPain = findQ("pain");
    const qFatigue = findQ("fatigue");
    if (qPain) list.push(qPain);
    if (qFatigue) list.push(qFatigue);

    // Dynamic Follow-up: Symptoms (if pain >= 5)
    if (Number(formValues.pain) >= 5) {
      const qNewSymptoms = findQ("newSymptoms");
      if (qNewSymptoms) list.push(qNewSymptoms);
    }

    // 4. Mode de vie (Core)
    const qHydration = findQ("hydrationGlasses");
    const qActivity = findQ("activityMinutes");
    const qNutrition = findQ("nutritionQuality");
    if (qHydration) list.push(qHydration);
    if (qActivity) list.push(qActivity);
    if (qNutrition) list.push(qNutrition);

    // 5. Habits (Alcool & Tabac) Trigger
    list.push(virtualQuestions.trackHabits);

    // Habits Follow-up (if trackHabits is true)
    if (formValues.trackHabits) {
      const qAlcohol = findQ("alcoholUnits");
      const qTobacco = findQ("tobaccoCount");
      if (qAlcohol) list.push(qAlcohol);
      if (qTobacco) list.push(qTobacco);
    }

    // 6. Medication Trigger
    list.push(virtualQuestions.trackMeds);

    // Medication Follow-up (if trackMeds is true)
    if (formValues.trackMeds) {
      const qMeds = findQ("medicationTaken");
      if (qMeds) list.push(qMeds);
    }

    // 7. Vitals Trigger
    list.push(virtualQuestions.trackVitals);

    // Vitals Follow-up (if trackVitals is true)
    if (formValues.trackVitals) {
      const qWeight = findQ("weightKg");
      const qTemp = findQ("temperatureC");
      const qSystolic = findQ("systolic");
      const qDiastolic = findQ("diastolic");
      const qHeart = findQ("heartRate");
      const qGlucose = findQ("glucose");
      if (qWeight) list.push(qWeight);
      if (qTemp) list.push(qTemp);
      if (qSystolic) list.push(qSystolic);
      if (qDiastolic) list.push(qDiastolic);
      if (qHeart) list.push(qHeart);
      if (qGlucose) list.push(qGlucose);
    }

    // 8. Comments (Optional)
    const qComments = findQ("comments");
    if (qComments) list.push(qComments);

    return list;
  }, [
    formValues.stress,
    formValues.mood,
    formValues.pain,
    formValues.trackHabits,
    formValues.trackMeds,
    formValues.trackVitals,
  ]);

  const total = activeQuestions.length;
  const isLast = step === total - 1;
  const progress = Math.round(((step) / total) * 100);
  const activeQuestion = activeQuestions[step];

  // Load draft on mount if exists
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`prevora:draft:${dateKey}`);
      if (saved) {
        setDraftPrompt(true);
      }
    }
  }, [dateKey]);

  // Save draft on values/step change
  React.useEffect(() => {
    if (typeof window !== "undefined" && !draftPrompt) {
      localStorage.setItem(
        `prevora:draft:${dateKey}`,
        JSON.stringify({ step, values: formValues })
      );
    }
  }, [formValues, step, dateKey, draftPrompt]);

  const handleResume = () => {
    const saved = localStorage.getItem(`prevora:draft:${dateKey}`);
    if (saved) {
      try {
        const { step: savedStep, values } = JSON.parse(saved);
        // Load step and values
        Object.entries(values).forEach(([k, v]) => {
          form.setValue(k as any, v);
        });
        setStep(Math.min(savedStep, activeQuestions.length - 1));
        toast.success("Questionnaire restauré !");
      } catch (err) {
        console.error("Error parsing draft:", err);
      }
    }
    setDraftPrompt(false);
  };

  const handleDiscard = () => {
    localStorage.removeItem(`prevora:draft:${dateKey}`);
    setDraftPrompt(false);
  };

  const handleSaveAndQuit = () => {
    toast.success("Brouillon enregistré. Vous pourrez reprendre plus tard !");
    router.push("/dashboard");
  };

  const next = async () => {
    const valid = await form.trigger(activeQuestion.id as any);
    if (!valid) return;
    if (isLast) return onSubmit();
    setStep((s) => Math.min(total - 1, s + 1));
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    // Strip virtual toggle fields before submitting to db
    const { trackHabits, trackMeds, trackVitals, ...cleanValues } = values as any;
    
    // Filter empty values
    const finalValues: Record<string, any> = {};
    for (const [k, v] of Object.entries(cleanValues)) {
      if (v === null || v === undefined || v === "") continue;
      finalValues[k] = v;
    }

    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        queueEntry({ dateKey, values: finalValues });
        toast.success("Enregistré hors ligne — synchronisation à la reconnexion.");
        localStorage.removeItem(`prevora:draft:${dateKey}`);
        router.push("/dashboard");
        return;
      }
      const res = await submitEntryAction(finalValues, dateKey);
      if (res.ok) {
        toast.success("Journée enregistrée !");
        localStorage.removeItem(`prevora:draft:${dateKey}`);
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(res.error ?? "Une erreur est survenue.");
      }
    } catch {
      queueEntry({ dateKey, values: finalValues });
      toast.message("Hors ligne — enregistré localement.");
      localStorage.removeItem(`prevora:draft:${dateKey}`);
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  });

  // Welcome / Resume draft screen
  if (draftPrompt) {
    return (
      <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-transparent shadow-lg text-center p-4">
        <CardHeader>
          <CardTitle className="text-xl">Questionnaire en cours</CardTitle>
          <CardDescription>
            Vous avez commencé à remplir le questionnaire aujourd&apos;hui.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Voulez-vous reprendre là où vous vous étiez arrêté ou recommencer du début ?
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={handleResume} className="w-full sm:flex-1 bg-primary text-white gap-2">
            <Play className="size-4" /> Reprendre
          </Button>
          <Button onClick={handleDiscard} variant="outline" className="w-full sm:flex-1 gap-2 border-destructive/25 text-destructive hover:bg-destructive/5">
            <RotateCcw className="size-4" /> Recommencer
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!activeQuestion) {
    return <div className="p-8 text-center"><Loader2 className="size-8 animate-spin mx-auto text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Progress & Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold text-primary uppercase tracking-wider">Questionnaire Prevora</span>
          <span className="font-mono bg-secondary px-2.5 py-0.5 rounded-full text-foreground">
            {step + 1} / {total}
          </span>
        </div>
        <Progress value={progress} className="h-2 rounded-full" />
      </div>

      {/* Slide Animation Container */}
      <div className="min-h-[160px] flex flex-col justify-center">
        <form onSubmit={(e) => e.preventDefault()}>
          <AnimatePresence>
            <motion.div
              key={activeQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
              className="space-y-4"
            >
              <QuestionField question={activeQuestion} control={form.control} />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0 || submitting}
                size="sm"
              >
                <ChevronLeft className="size-4" /> Précédent
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveAndQuit}
                disabled={submitting}
                size="sm"
                className="gap-1"
              >
                <Save className="size-3.5" /> Quitter
              </Button>
            </div>
            
            <Button type="button" onClick={next} disabled={submitting} size="sm">
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isLast ? (
                <Check className="size-4" />
              ) : null}
              {isLast ? "Terminer" : "Suivant"}
              {!isLast && !submitting && <ChevronRight className="size-4" />}
            </Button>
          </div>
        </form>
      </div>

      <p className="text-center text-[10px] leading-relaxed text-muted-foreground max-w-lg mx-auto">
        {MEDICAL_DISCLAIMER}
      </p>
    </div>
  );
}
