import { z } from "zod";

export const questionTypeSchema = z.enum(["word", "sentence"]);
export const cefrLevelSchema = z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]);
export const languageSchema = z.enum(["pt", "es", "fr", "de", "it"]);

export const questionOptionImportSchema = z.object({
  language: languageSchema,
  text: z.string().trim().min(1),
  isCorrect: z.boolean(),
});

export const questionImportSchema = z
  .object({
    type: questionTypeSchema,
    text: z.string().trim().min(1),
    phonetic: z.string().trim().min(1),
    cefrLevel: cefrLevelSchema,
    options: z.array(questionOptionImportSchema).min(4),
  })
  .superRefine(({ options }, context) => {
    const correctByLanguage = new Map<string, number>();
    const optionKeys = new Set<string>();

    for (const option of options) {
      const optionKey = `${option.language}:${option.text}`;

      if (optionKeys.has(optionKey)) {
        context.addIssue({
          code: "custom",
          message: "questions.import.duplicateOption",
          path: ["options"],
        });
      }

      optionKeys.add(optionKey);
      correctByLanguage.set(
        option.language,
        (correctByLanguage.get(option.language) ?? 0) + Number(option.isCorrect)
      );
    }

    for (const correctCount of correctByLanguage.values()) {
      if (correctCount !== 1) {
        context.addIssue({
          code: "custom",
          message: "questions.import.correctOptionCount",
          path: ["options"],
        });
      }
    }
  });

export const questionsImportSchema = z.array(questionImportSchema).min(1);

export type QuestionsImport = z.infer<typeof questionsImportSchema>;
