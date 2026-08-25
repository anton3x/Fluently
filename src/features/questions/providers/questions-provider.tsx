import { createContext, type PropsWithChildren, useContext, useMemo } from "react";

import { useDatabase } from "@/db";

import { IQuestionRepository, QuestionRepository } from "../repositories/question-repository";

const QuestionsContext = createContext<IQuestionRepository | null>(null);

export function QuestionsProvider({ children }: PropsWithChildren) {
  const db = useDatabase();

  const repository = useMemo(() => new QuestionRepository(db), [db]);

  return <QuestionsContext.Provider value={repository}>{children}</QuestionsContext.Provider>;
}

export function useQuestionRepository() {
  const repository = useContext(QuestionsContext);
  if (!repository) throw new Error("QuestionsProvider is missing");
  return repository;
}
