"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { questionnaire } from "@/config/questionnaire";
import { entryFormSchema } from "@/lib/validations/entry";
import { submitEntryAction } from "@/app/(app)/questionnaire/actions";
import { queueEntry } from "@/lib/offline";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { QuestionField } from "./question-field";
import { MEDICAL_DISCLAIMER } from "@/config/site";

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

  const form = useForm({
    resolver: zodResolver(entryFormSchema),
    defaultValues,
    mode: "onChange",
  });

  const sections = questionnaire;
  const total = sections.length;
  const isLast = step === total - 1;
  const progress = Math.round(((step + 1) / total) * 100);
  const section = sections[step];

  const next = async () => {
    const ids = section.questions.map((q) => q.id);
    const valid = await form.trigger(ids);
    if (!valid) return;
    if (isLast) return onSubmit();
    setStep((s) => Math.min(total - 1, s + 1));
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        queueEntry({ dateKey, values });
        toast.success("Enregistré hors ligne — synchronisation à la reconnexion.");
        router.push("/dashboard");
        return;
      }
      const res = await submitEntryAction(values, dateKey);
      if (res.ok) {
        toast.success("Journée enregistrée !");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(res.error ?? "Une erreur est survenue.");
      }
    } catch {
      queueEntry({ dateKey, values });
      toast.message("Hors ligne — enregistré localement.");
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{section.title}</span>
          <span className="text-muted-foreground">
            {step + 1} / {total}
          </span>
        </div>
        <Progress value={progress} />
        {section.description && (
          <p className="text-sm text-muted-foreground">{section.description}</p>
        )}
      </div>

      {/* Step */}
      <form onSubmit={(e) => e.preventDefault()}>
        <AnimatePresence mode="wait">
          <motion.div
            key={section.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-3"
          >
            {section.questions.map((q) => (
              <QuestionField key={q.id} question={q} control={form.control} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Nav */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || submitting}
          >
            <ChevronLeft className="size-4" /> Précédent
          </Button>
          <Button type="button" onClick={next} disabled={submitting}>
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isLast ? (
              <Check className="size-4" />
            ) : null}
            {isLast ? "Enregistrer" : "Suivant"}
            {!isLast && !submitting && <ChevronRight className="size-4" />}
          </Button>
        </div>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        {MEDICAL_DISCLAIMER}
      </p>
    </div>
  );
}
