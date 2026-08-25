import type { Database } from "@/db";
import { questionProgress, questions } from "@/db/schema";
import type { Result } from "@/types/result";
import { sql } from "drizzle-orm";

type RecordAnswerInput = {
  questionId: string;
  isCorrect: boolean;
};

type GetProgressOutput = {
  completed: number;
  total: number;
  percentage: number;
};

export interface IProgressRepository {
  recordAnswer(input: RecordAnswerInput): Promise<Result<void>>;
  getProgress(): Promise<Result<GetProgressOutput>>;
}

export class ProgressRepository implements IProgressRepository {
  constructor(private db: Database) {}

  async recordAnswer({ questionId, isCorrect }: RecordAnswerInput): Promise<Result<void>> {
    try {
      await this.db
        .insert(questionProgress)
        .values({
          questionId,
          timesSeen: 1,
          timesCorrect: isCorrect ? 1 : 0,
          timesWrong: isCorrect ? 0 : 1,
          lastAnsweredAt: new Date(),
        })
        .onConflictDoUpdate({
          target: questionProgress.questionId,
          set: {
            timesSeen: sql`${questionProgress.timesSeen} + 1`,
            timesCorrect: sql`${questionProgress.timesCorrect} + ${isCorrect ? 1 : 0}`,
            timesWrong: sql`${questionProgress.timesWrong} + ${isCorrect ? 0 : 1}`,
            lastAnsweredAt: new Date(),
          },
        });

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Could not save answer progress",
      };
    }
  }

  async getProgress(): Promise<Result<GetProgressOutput>> {
    try {
      const result = await this.db
        .select({
          total: sql<number>`(select count(*) from ${questions})`.mapWith(Number),
          completed:
            sql<number>`count(case when ${questionProgress.timesCorrect} > 0 then 1 end)`.mapWith(
              Number
            ),
        })
        .from(questionProgress);

      const progress = result[0];
      const total = progress?.total ?? 0;
      const completed = progress?.completed ?? 0;
      const percentage = total ? (completed / total) * 100 : 0;

      return {
        success: true,
        data: {
          completed,
          total,
          percentage,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Could not fetch progress",
      };
    }
  }
}
