import { z } from "zod";
import { allQuestions, type Question } from "@/config/questionnaire";

function fieldSchema(q: Question): z.ZodTypeAny {
  switch (q.type) {
    case "scale":
    case "number": {
      let s = z.coerce.number();
      if (q.min != null) s = s.min(q.min, `Min ${q.min}`);
      if (q.max != null) s = s.max(q.max, `Max ${q.max}`);
      return s.optional().nullable();
    }
    case "boolean":
      return z.coerce.boolean().optional().nullable();
    case "select":
      return z.string().optional().nullable();
    case "text":
    default:
      return z.string().max(2000).optional().nullable();
  }
}

/** Zod schema derived from the evolvable questionnaire config. */
export const entryFormSchema = z.object(
  Object.fromEntries(allQuestions.map((q) => [q.id, fieldSchema(q)])),
);

export type EntryFormValues = z.infer<typeof entryFormSchema>;

/** Empty defaults for every question id. */
export const emptyEntryValues: Record<string, unknown> = Object.fromEntries(
  allQuestions.map((q) => [q.id, q.type === "boolean" ? false : ""]),
);
