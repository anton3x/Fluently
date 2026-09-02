import { createContext, type PropsWithChildren, useContext, useMemo } from "react";

import { useDatabase } from "@/db";

import { IProgressRepository, ProgressRepository } from "../repositories/progress-repository";
const ProgressContext = createContext<IProgressRepository | null>(null);

export function ProgressProvider({ children }: Readonly<PropsWithChildren>) {
  const db = useDatabase();

  const repository = useMemo(() => new ProgressRepository(db), [db]);

  return <ProgressContext.Provider value={repository}>{children}</ProgressContext.Provider>;
}

export function useProgressRepository() {
  const repository = useContext(ProgressContext);
  if (!repository) throw new Error("ProgressProvider is missing");
  return repository;
}
