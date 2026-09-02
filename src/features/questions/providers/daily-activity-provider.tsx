import { createContext, type PropsWithChildren, useContext, useMemo } from "react";

import { useDatabase } from "@/db";

import { IDailyActivityRepository, DailyActivityRepository } from "../repositories/daily-activity-repository";

const DailyActivityContext = createContext<IDailyActivityRepository | null>(null);

export function DailyActivityProvider({ children }: PropsWithChildren) {
  const db = useDatabase();

  const repository = useMemo(() => new DailyActivityRepository(db), [db]);

  return <DailyActivityContext.Provider value={repository}>{children}</DailyActivityContext.Provider>;
}

export function useDailyActivityRepository() {
  const repository = useContext(DailyActivityContext);
  if (!repository) throw new Error("DailyActivityProvider is missing");
  return repository;
}