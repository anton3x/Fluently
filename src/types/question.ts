import {
  Question,
  QuestionOption,
  QuestionProgress,
} from "@/db/schema";

export type QuestionWithOptions = Question & {
  options: QuestionOption[];
  progress: QuestionProgress | null;
};