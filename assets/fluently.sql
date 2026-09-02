
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY NOT NULL,
    type TEXT NOT NULL,
    text TEXT NOT NULL,
    phonetic TEXT,
    cefr_level TEXT NOT NULL,
    created_at INTEGER NOT NULL,

    CHECK (type IN ('word', 'sentence')),
    CHECK (cefr_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'))
);


CREATE TABLE IF NOT EXISTS question_options (
    id TEXT PRIMARY KEY NOT NULL,
    question_id TEXT NOT NULL,
    language TEXT NOT NULL,
    text TEXT NOT NULL,
    is_correct INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,

    FOREIGN KEY (question_id)
        REFERENCES questions(id),

    CHECK (language IN ('pt', 'es', 'fr', 'de', 'it')),
    CHECK (is_correct IN (0, 1)),

    UNIQUE (question_id, language, text)
);


CREATE TABLE IF NOT EXISTS question_progress (
    question_id TEXT PRIMARY KEY NOT NULL,
    times_seen INTEGER NOT NULL DEFAULT 0,
    times_correct INTEGER NOT NULL DEFAULT 0,
    times_wrong INTEGER NOT NULL DEFAULT 0,
    last_answered_at INTEGER,

    FOREIGN KEY (question_id)
        REFERENCES questions(id)
);


CREATE TABLE IF NOT EXISTS daily_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,             
    questions_answered INTEGER NOT NULL DEFAULT 0,
    times_correct INTEGER NOT NULL DEFAULT 0,
    times_wrong INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,

    UNIQUE (date)
);


CREATE INDEX IF NOT EXISTS idx_question_options_question_id
    ON question_options(question_id);

CREATE INDEX IF NOT EXISTS idx_question_options_question_language
    ON question_options(question_id, language);

CREATE INDEX IF NOT EXISTS idx_question_progress_question_id
    ON question_progress(question_id);

CREATE INDEX IF NOT EXISTS idx_daily_activity_date
    ON daily_activity(date);
