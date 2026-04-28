import {
  bigserial,
  bigint,
  boolean,
  integer,
  jsonb,
  pgTable,
  timestamp,
} from "drizzle-orm/pg-core";
import { practiceSessions } from "./practice-sessions";
import { questions } from "./questions";

export const practiceAnswers = pgTable("practice_answers", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  sessionId: bigint("session_id", { mode: "bigint" })
    .notNull()
    .references(() => practiceSessions.id, { onDelete: "cascade" }),
  questionId: bigint("question_id", { mode: "bigint" })
    .notNull()
    .references(() => questions.id),
  userAnswer: jsonb("user_answer").notNull().$type<string | string[]>(),
  isCorrect: boolean("is_correct").notNull(),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
