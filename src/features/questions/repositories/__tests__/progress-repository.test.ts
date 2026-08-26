import { ProgressRepository } from "../progress-repository";

function createDatabaseMock() {
  const db = {
    insert: jest.fn(),
    select: jest.fn(),
  };

  return db;
}

describe("ProgressRepository", () => {
  it("records a correct answer", async () => {
    const db = createDatabaseMock();

    const onConflictDoUpdate = jest.fn().mockResolvedValue(undefined);
    db.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({ onConflictDoUpdate }),
    });

    const result = await new ProgressRepository(db as never).recordAnswer({
      questionId: "question-1",
      isCorrect: true,
    });

    expect(result).toEqual({ success: true, data: undefined });
    expect(db.insert().values).toHaveBeenCalledWith(
      expect.objectContaining({
        questionId: "question-1",
        timesSeen: 1,
        timesCorrect: 1,
        timesWrong: 0,
        lastAnsweredAt: expect.any(Date),
      })
    );
    expect(onConflictDoUpdate).toHaveBeenCalled();
  });

  it("records an incorrect answer", async () => {
    const db = createDatabaseMock();
    db.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        onConflictDoUpdate: jest.fn().mockResolvedValue(undefined),
      }),
    });

    await new ProgressRepository(db as never).recordAnswer({
      questionId: "question-1",
      isCorrect: false,
    });

    expect(db.insert().values).toHaveBeenCalledWith(
      expect.objectContaining({ timesCorrect: 0, timesWrong: 1 })
    );
  });

  it("returns an error when recording progress fails", async () => {
    const db = createDatabaseMock();
    db.insert.mockImplementation(() => {
      throw new Error("save failed");
    });

    const result = await new ProgressRepository(db as never).recordAnswer({
      questionId: "question-1",
      isCorrect: true,
    });

    expect(result).toEqual({ success: false, error: "save failed" });
  });

  it("calculates progress from completed and total questions", async () => {
    const db = createDatabaseMock();
    db.select.mockReturnValue({
      from: jest.fn().mockResolvedValue([{ completed: 2, total: 4 }]),
    });

    const result = await new ProgressRepository(db as never).getProgress();

    expect(result).toEqual({
      success: true,
      data: { completed: 2, total: 4, percentage: 50 },
    });
  });

  it("returns zero progress when there are no questions", async () => {
    const db = createDatabaseMock();
    db.select.mockReturnValue({
      from: jest.fn().mockResolvedValue([{ completed: 0, total: 0 }]),
    });

    const result = await new ProgressRepository(db as never).getProgress();

    expect(result).toEqual({
      success: true,
      data: { completed: 0, total: 0, percentage: 0 },
    });
  });

  it("returns an error when progress loading fails", async () => {
    const db = createDatabaseMock();
    db.select.mockImplementation(() => {
      throw new Error("load failed");
    });

    const result = await new ProgressRepository(db as never).getProgress();

    expect(result).toEqual({ success: false, error: "load failed" });
  });
});
