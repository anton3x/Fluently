import type { Database } from "@/db";
import { dailyActivity } from "@/db/schema";
import type { DailyActivity } from "@/db/schema";
import type { Result } from "@/types/result";
import { eq, sql, desc } from "drizzle-orm";

export interface IDailyActivityRepository {
  getByDate(date: string): Promise<Result<DailyActivity>>;
  getAll(): Promise<Result<DailyActivity[]>>;
  createOrUpdate(activity: DailyActivity): Promise<Result<DailyActivity>>;
  deleteByDate(date: string): Promise<Result<void>>;
  incrementCounts(date: string, isCorrect: boolean): Promise<Result<void>>;
}

export class DailyActivityRepository implements IDailyActivityRepository {
  constructor(private db: Database) {}

  async getByDate(date: string): Promise<Result<DailyActivity>> {
    try {
      const result = await this.db.query.dailyActivity.findFirst({
        where: eq(dailyActivity.date, date),
      });

      if (!result) {
        return { success: false, error: "Daily activity not found" };
      }
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Could not fetch daily activity",
      };
    }
  }

  async getAll(): Promise<Result<DailyActivity[]>> {
    try {
      const result = await this.db.query.dailyActivity.findMany({
        orderBy: desc(dailyActivity.date),
      });
      return { success: true, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Could not fetch daily activities",
      };
    }
  }

  async createOrUpdate(activity: DailyActivity): Promise<Result<DailyActivity>> {
    try {
      const result = await this.db
        .insert(dailyActivity)
        .values(activity)
        .onConflictDoUpdate({
          target: dailyActivity.date,
          set: {
            questionsAnswered: activity.questionsAnswered,
            timesCorrect: activity.timesCorrect,
            timesWrong: activity.timesWrong,
            updatedAt: new Date(),
          },
        })
        .returning();

      return { success: true, data: result[0] };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Could not create or update daily activity",
      };
    }
  }

  async deleteByDate(date: string): Promise<Result<void>> {
    try {
      await this.db.delete(dailyActivity).where(eq(dailyActivity.date, date));
      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Could not delete daily activity",
      };
    }
  }

  async incrementCounts(date: string, isCorrect: boolean): Promise<Result<void>> {
    try {
      const today = new Date();
      const createdAt = today;
      const updatedAt = today;

      await this.db
        .insert(dailyActivity)
        .values({
          date,
          questionsAnswered: 1,
          timesCorrect: isCorrect ? 1 : 0,
          timesWrong: isCorrect ? 0 : 1,
          createdAt,
          updatedAt,
        })
        .onConflictDoUpdate({
          target: dailyActivity.date,
          set: {
            questionsAnswered: sql`${dailyActivity.questionsAnswered} + 1`,
            timesCorrect: sql`${dailyActivity.timesCorrect} + ${isCorrect ? 1 : 0}`,
            timesWrong: sql`${dailyActivity.timesWrong} + ${isCorrect ? 0 : 1}`,
            updatedAt,
          },
        });

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Could not increment daily activity counts",
      };
    }
  }
}
