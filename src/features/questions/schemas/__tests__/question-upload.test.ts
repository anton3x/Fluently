import { questionsImportSchema } from "../question-upload";

const validQuestion = {
  type: "word",
  text: "hello",
  phonetic: "həˈləʊ",
  cefrLevel: "A1",
  options: [
    { language: "pt", text: "ola", isCorrect: true },
    { language: "pt", text: "oi", isCorrect: false },
    { language: "pt", text: "tchau", isCorrect: false },
    { language: "pt", text: "adeus", isCorrect: false },
    { language: "es", text: "hola", isCorrect: true },
    { language: "es", text: "adios", isCorrect: false },
    { language: "es", text: "buenas", isCorrect: false },
    { language: "es", text: "saludos", isCorrect: false },
    { language: "fr", text: "bonjour", isCorrect: true },
    { language: "fr", text: "salut", isCorrect: false },
    { language: "fr", text: "au revoir", isCorrect: false },
    { language: "fr", text: "merci", isCorrect: false },
    { language: "de", text: "hallo", isCorrect: true },
    { language: "de", text: "tschuss", isCorrect: false },
    { language: "de", text: "danke", isCorrect: false },
    { language: "de", text: "bitte", isCorrect: false },
    { language: "it", text: "ciao", isCorrect: true },
    { language: "it", text: "salve", isCorrect: false },
    { language: "it", text: "arrivederci", isCorrect: false },
    { language: "it", text: "grazie", isCorrect: false },
  ],
};

function parseQuestion(overrides: object = {}) {
  return questionsImportSchema.safeParse([
    {
      ...validQuestion,
      ...overrides,
    },
  ]);
}

describe("questionsImportSchema", () => {
  it("accepts a valid question import", () => {
    const result = parseQuestion();

    expect(result.success).toBe(true);
  });

  it("trims question and option text", () => {
    const result = parseQuestion({
      text: "  hello  ",
      phonetic: "  həˈləʊ  ",
      options: [
        { ...validQuestion.options[0], text: "  ola  " },
        ...validQuestion.options.slice(1),
      ],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0]).toMatchObject({ text: "hello", phonetic: "həˈləʊ" });
      expect(result.data[0].options[0].text).toBe("ola");
    }
  });

  it("requires at least one question", () => {
    expect(questionsImportSchema.safeParse([]).success).toBe(false);
  });

  it("requires exactly four options for every language", () => {
    expect(parseQuestion({ options: validQuestion.options.slice(0, 19) }).success).toBe(false);
    expect(
      parseQuestion({
        options: validQuestion.options.map((option, index) =>
          index === 4 ? { ...option, language: "pt" } : option
        ),
      }).success
    ).toBe(false);
  });

  it.each([
    ["type", { type: "phrase" }],
    ["CEFR level", { cefrLevel: "C3" }],
    ["language", { options: [{ language: "en", text: "hello", isCorrect: true }] }],
  ])("rejects an invalid %s", (_, override) => {
    expect(parseQuestion(override).success).toBe(false);
  });

  it("rejects empty text", () => {
    expect(parseQuestion({ text: "   " }).success).toBe(false);
    expect(
      parseQuestion({
        options: [{ ...validQuestion.options[0], text: "   " }, ...validQuestion.options.slice(1)],
      }).success
    ).toBe(false);
  });

  it("rejects duplicate options for the same language", () => {
    const duplicate = { language: "pt", text: "ola", isCorrect: false };

    const result = parseQuestion({
      options: [validQuestion.options[0], duplicate, ...validQuestion.options.slice(1, 19)],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ message: "questions.import.duplicateOption" }),
        ])
      );
    }
  });

  it("allows the same text in different languages", () => {
    const result = parseQuestion({
      options: validQuestion.options.map((option, index) =>
        index === 0 || index === 4 ? { ...option, text: "hello" } : option
      ),
    });

    expect(result.success).toBe(true);
  });

  it("requires exactly one correct option per language", () => {
    const noCorrect = parseQuestion({
      options: [
        { language: "pt", text: "ola", isCorrect: false },
        ...validQuestion.options.slice(1),
      ],
    });
    const multipleCorrect = parseQuestion({
      options: [
        ...validQuestion.options.map((option, index) =>
          index === 1 ? { ...option, isCorrect: true } : option
        ),
      ],
    });

    expect(noCorrect.success).toBe(false);
    expect(multipleCorrect.success).toBe(false);
  });

  it("validates multiple imported questions", () => {
    const result = questionsImportSchema.safeParse([
      validQuestion,
      { ...validQuestion, text: "world" },
    ]);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
  });
});
