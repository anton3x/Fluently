CREATE TABLE `question_options` (
	`id` text PRIMARY KEY NOT NULL,
	`question_id` text NOT NULL,
	`language` text NOT NULL,
	`text` text NOT NULL,
	`is_correct` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "question_options_language_check" CHECK("question_options"."language" IN ('pt', 'es', 'fr', 'de', 'it')),
	CONSTRAINT "question_options_is_correct_check" CHECK("question_options"."is_correct" IN (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `question_options_question_language_text` ON `question_options` (`question_id`,`language`,`text`);--> statement-breakpoint
CREATE TABLE `question_progress` (
	`question_id` text PRIMARY KEY NOT NULL,
	`times_seen` integer DEFAULT 0 NOT NULL,
	`times_correct` integer DEFAULT 0 NOT NULL,
	`times_wrong` integer DEFAULT 0 NOT NULL,
	`last_answered_at` integer,
	FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`text` text NOT NULL,
	`phonetic` text,
	`cefr_level` text NOT NULL,
	`created_at` integer NOT NULL,
	CONSTRAINT "questions_type_check" CHECK("questions"."type" IN ('word', 'sentence')),
	CONSTRAINT "questions_cefr_level_check" CHECK("questions"."cefr_level" IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'))
);
