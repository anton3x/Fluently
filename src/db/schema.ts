import { relations, sql } from "drizzle-orm";
import { check, integer, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";

export const questionTypes = ["word", "sentence"] as const;
export type QuestionType = (typeof questionTypes)[number];

export const cefrLevels = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type CEFRLevel = (typeof cefrLevels)[number];

export const languages = ["pt", "es", "fr", "de", "it", "en"] as const;
export type Language = (typeof languages)[number];

export const questions = sqliteTable(
  "questions",
  {
    id: text("id").primaryKey(),

    type: text("type", {
      enum: questionTypes,
    }).notNull(),

    text: text("text").notNull(),

    phonetic: text("phonetic").notNull(),

    cefrLevel: text("cefr_level", {
      enum: cefrLevels,
    }).notNull(),

    createdAt: integer("created_at", {
      mode: "timestamp",
    }).notNull(),
  },
  (table) => [
    check("questions_type_check", sql`${table.type} IN ('word', 'sentence')`),
    check(
      "questions_cefr_level_check",
      sql`${table.cefrLevel} IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')`
    ),
  ]
);

export type Question = typeof questions.$inferInsert;

export const questionOptions = sqliteTable(
  "question_options",
  {
    id: text("id").primaryKey(),

    questionId: text("question_id")
      .notNull()
      .references(() => questions.id),

    language: text("language", {
      enum: languages,
    }).notNull(),

    text: text("text").notNull(),

    isCorrect: integer("is_correct", {
      mode: "boolean",
    })
      .notNull()
      .default(false),

    createdAt: integer("created_at", {
      mode: "timestamp",
    }).notNull(),

    updatedAt: integer("updated_at", {
      mode: "timestamp",
    }).notNull(),
  },
  (table) => [
    check(
      "question_options_language_check",
      sql`${table.language} IN ('pt', 'es', 'fr', 'de', 'it')`
    ),
    check("question_options_is_correct_check", sql`${table.isCorrect} IN (0, 1)`),
    unique("question_options_question_language_text").on(
      table.questionId,
      table.language,
      table.text
    ),
  ]
);

export type QuestionOption = typeof questionOptions.$inferInsert;

export const questionProgress = sqliteTable("question_progress", {
  questionId: text("question_id")
    .primaryKey()
    .references(() => questions.id),

  timesSeen: integer("times_seen").notNull().default(0),

  timesCorrect: integer("times_correct").notNull().default(0),

  timesWrong: integer("times_wrong").notNull().default(0),

  lastAnsweredAt: integer("last_answered_at", {
    mode: "timestamp",
  }),
});

export const dailyActivity = sqliteTable("daily_activity", {
  id: integer("id").primaryKey({ autoIncrement: true }),

  date: text("date").notNull(),

  questionsAnswered: integer("questions_answered").notNull().default(0),

  timesCorrect: integer("times_correct").notNull().default(0),

  timesWrong: integer("times_wrong").notNull().default(0),

  createdAt: integer("created_at", {
    mode: "timestamp",
  }).notNull(),

  updatedAt: integer("updated_at", {
    mode: "timestamp",
  }).notNull(),
});

export type DailyActivity = typeof dailyActivity.$inferInsert;

export type QuestionProgress = typeof questionProgress.$inferInsert;

export const questionsRelations = relations(questions, ({ many, one }) => ({
  options: many(questionOptions),
  progress: one(questionProgress),
}));

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
  question: one(questions, {
    fields: [questionOptions.questionId],
    references: [questions.id],
  }),
}));

export const questionProgressRelations = relations(questionProgress, ({ one }) => ({
  question: one(questions, {
    fields: [questionProgress.questionId],
    references: [questions.id],
  }),
}));
