import { Database } from "@/db";
import { questionOptions, questionProgress, questions } from "@/db/schema";
import { QuestionWithOptions } from "@/types/question";
import { Result } from "@/types/result";
import { eq, and, gt, sql } from "drizzle-orm";

export interface IQuestionRepository {
  getQuestionById(id: string): Promise<Result<QuestionWithOptions>>;

  getRandomQuestion(): Promise<Result<QuestionWithOptions>>;

  getDueQuestions(): Promise<Result<QuestionWithOptions[]>>;

  getQuestions(): Promise<Result<QuestionWithOptions[]>>;

  createQuestion(question: QuestionWithOptions): Promise<Result<QuestionWithOptions>>;

  createQuestions(data: QuestionWithOptions[]): Promise<Result<QuestionWithOptions[]>>;
}

export class QuestionRepository implements IQuestionRepository {
  constructor(private readonly db: Database) {}
  async getQuestions(): Promise<Result<QuestionWithOptions[]>> {
    const result = await this.db.query.questions.findMany({
      with: {
        options: true,
        progress: true,
      },
    });

    return {
      success: true,
      data: result,
    };
  }
  async getQuestionById(id: string): Promise<Result<QuestionWithOptions>> {
    const question = await this.db.query.questions.findFirst({
      with: {
        options: true,
        progress: true,
      },
      where: eq(questions.id, id),
    });

    if (!question) {
      return { success: false, error: "Question not found" };
    }
    return { success: true, data: question };
  }

  async getRandomQuestion(): Promise<Result<QuestionWithOptions>> {
    const question = await this.db.query.questions.findFirst({
      with: {
        options: true,
        progress: true,
      },
      where: (questions, { notExists }) =>
        notExists(
          this.db
            .select({ id: questionProgress.questionId })
            .from(questionProgress)
            .where(
              and(
                eq(questionProgress.questionId, questions.id),
                gt(questionProgress.timesCorrect, 0)
              )
            )
        ),
      orderBy: sql`RANDOM()`,
    });

    if (!question) {
      return { success: false, error: "No questions found" };
    }
    return { success: true, data: question };
  }

  async getDueQuestions(): Promise<Result<QuestionWithOptions[]>> {
    const result = await this.db.query.questions.findMany({
      with: {
        options: true,
        progress: true,
      },
      where: (questions, { notExists }) =>
        notExists(
          this.db
            .select({ id: questionProgress.questionId })
            .from(questionProgress)
            .where(
              and(
                eq(questionProgress.questionId, questions.id),
                gt(questionProgress.timesCorrect, 0)
              )
            )
        ),
    });

    return {
      success: true,
      data: result,
    };
  }

  async createQuestion(question: QuestionWithOptions): Promise<Result<QuestionWithOptions>> {
    try {
      const result = await this.db.transaction(async (tx) => {
        await tx.insert(questions).values({
          id: question.id,
          type: question.type,
          text: question.text,
          phonetic: question.phonetic,
          cefrLevel: question.cefrLevel,
          createdAt: question.createdAt,
        });

        await tx.insert(questionOptions).values(question.options);

        return tx.query.questions.findFirst({
          where: eq(questions.id, question.id),
          with: {
            options: true,
            progress: true,
          },
        });
      });

      if (!result) {
        return {
          success: false,
          error: "questions.import.createError",
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "errors.unknown",
      };
    }
  }

  async createQuestions(data: QuestionWithOptions[]): Promise<Result<QuestionWithOptions[]>> {
    try {
      const result = await this.db.transaction(async (tx) => {
        const questionIds: string[] = [];

        for (const question of data) {
          const [existingQuestion] = await tx
            .select({ id: questions.id })
            .from(questions)
            .where(and(eq(questions.type, question.type), eq(questions.text, question.text)))
            .limit(1);

          if (existingQuestion) continue;

          await tx.insert(questions).values({
            id: question.id,
            type: question.type,
            text: question.text,
            phonetic: question.phonetic,
            cefrLevel: question.cefrLevel,
            createdAt: question.createdAt,
          });

          await tx.insert(questionOptions).values(question.options);
          questionIds.push(question.id);
        }

        if (!questionIds.length) return [];

        return tx.query.questions.findMany({
          where: (questions, { inArray }) => inArray(questions.id, questionIds),
          with: {
            options: true,
            progress: true,
          },
        });
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "questions.import.failureTitle",
      };
    }
  }
}
