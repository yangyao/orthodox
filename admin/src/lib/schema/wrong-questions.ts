import {
  bigserial,
  bigint,
  integer,
  pgTable,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { questionBanks } from "./question-banks";
import { questions } from "./questions";

export const wrongQuestions = pgTable("wrong_questions", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: bigint("user_id", { mode: "bigint" }).notNull().references(() => users.id),
  bankId: bigint("bank_id", { mode: "bigint" }).notNull().references(() => questionBanks.id),
  questionId: bigint("question_id", { mode: "bigint" }).notNull().references(() => questions.id),
  wrongCount: integer("wrong_count").notNull().default(1),
  masteryCount: integer("mastery_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
