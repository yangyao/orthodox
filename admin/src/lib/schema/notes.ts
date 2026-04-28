import {
  bigserial,
  bigint,
  pgTable,
  timestamp,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { questionBanks } from "./question-banks";
import { questions } from "./questions";

export const notes = pgTable("notes", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: bigint("user_id", { mode: "bigint" }).notNull().references(() => users.id),
  bankId: bigint("bank_id", { mode: "bigint" }).notNull().references(() => questionBanks.id),
  questionId: bigint("question_id", { mode: "bigint" }).notNull().references(() => questions.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userQuestionIdx: uniqueIndex("notes_user_question_idx").on(table.userId, table.questionId),
}));
