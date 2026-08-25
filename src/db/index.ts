import { drizzle } from "drizzle-orm/expo-sqlite";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useMemo } from "react";

import * as schema from "./schema";

export function useDatabase() {
  const expoDb = useSQLiteContext();
  return useMemo(() => createDatabase(expoDb), [expoDb]);
}

export function createDatabase(expoDb: SQLiteDatabase) {
  return drizzle(expoDb, {
    schema,
  });
}

export type Database = ReturnType<typeof createDatabase>;
