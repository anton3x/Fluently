import { QuestionRepository } from "../question-repository";
import type { QuestionWithOptions } from "@/types/question";

function createDatabaseMock() {
  const query = {
    questions: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  };
  const db = {
    query,
    select: jest.fn(),
    transaction: jest.fn(),
  };

  return { db, query };
}

const question: QuestionWithOptions = {
  id: "question-1",
  type: "word",
  text: "hello",
  phonetic: "həˈləʊ",
  cefrLevel: "A1",
  createdAt: new Date("2026-01-01"),
  options: [
    {
      id: "option-1",
      questionId: "question-1",
      language: "pt",
      text: "ola",
      isCorrect: true,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    },
  ],
  progress: null,
};

describe("QuestionRepository", () => {
  it("returns a question by id", async () => {
    const { db, query } = createDatabaseMock();
    query.questions.findFirst.mockResolvedValue(question);

    const result = await new QuestionRepository(db as never).getQuestionById(question.id);

    expect(result).toEqual({ success: true, data: question });
    expect(query.questions.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ with: { options: true, progress: true } })
    );
  });

  it("returns an error when a question does not exist", async () => {
    const { db, query } = createDatabaseMock();
    query.questions.findFirst.mockResolvedValue(undefined);

    const result = await new QuestionRepository(db as never).getQuestionById("missing");

    expect(result).toEqual({ success: false, error: "Question not found" });
  });

  it("returns a random unanswered question", async () => {
    const { db, query } = createDatabaseMock();
    query.questions.findFirst.mockResolvedValue(question);

    const result = await new QuestionRepository(db as never).getRandomQuestion();

    expect(result).toEqual({ success: true, data: question });
  });

  it("returns an error when no random question is available", async () => {
    const { db, query } = createDatabaseMock();
    query.questions.findFirst.mockResolvedValue(undefined);

    const result = await new QuestionRepository(db as never).getRandomQuestion();

    expect(result).toEqual({ success: false, error: "No questions found" });
  });

  it("returns due questions", async () => {
    const { db, query } = createDatabaseMock();
    query.questions.findMany.mockResolvedValue([question]);

    const result = await new QuestionRepository(db as never).getDueQuestions();

    expect(result).toEqual({ success: true, data: [question] });
  });

  it("creates a question in a transaction", async () => {
    const { db } = createDatabaseMock();
    const tx = {
      insert: jest.fn().mockReturnValue({ values: jest.fn().mockResolvedValue(undefined) }),
      query: {
        questions: {
          findFirst: jest.fn().mockResolvedValue(question),
        },
      },
    };
    db.transaction.mockImplementation(async (callback) => callback(tx));

    const result = await new QuestionRepository(db as never).createQuestion(question);

    expect(result).toEqual({ success: true, data: question });
    expect(tx.insert).toHaveBeenCalledTimes(2);
  });

  it("returns the database error when creating a question fails", async () => {
    const { db } = createDatabaseMock();
    db.transaction.mockRejectedValue(new Error("insert failed"));

    const result = await new QuestionRepository(db as never).createQuestion(question);

    expect(result).toEqual({ success: false, error: "insert failed" });
  });

  it("creates only new questions during a bulk import", async () => {
    const { db } = createDatabaseMock();
    const tx = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest
          .fn()
          .mockResolvedValueOnce([])
          .mockResolvedValueOnce([{ id: "existing" }]),
      }),
      insert: jest.fn().mockReturnValue({ values: jest.fn().mockResolvedValue(undefined) }),
      query: {
        questions: {
          findMany: jest.fn().mockResolvedValue([question]),
        },
      },
    };
    db.transaction.mockImplementation(async (callback) => callback(tx));

    const result = await new QuestionRepository(db as never).createQuestions([
      question,
      { ...question, id: "existing", text: "existing" },
    ]);

    expect(result).toEqual({ success: true, data: [question] });
    expect(tx.insert).toHaveBeenCalledTimes(2);
    expect(tx.query.questions.findMany).toHaveBeenCalled();
  });
});
