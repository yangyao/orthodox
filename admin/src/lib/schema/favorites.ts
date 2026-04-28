import {
  bigserial,
  bigint,
  pgTable,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { questionBanks } from "./question-banks";
import { questions } from "./questions";

export const favorites = pgTable("favorites", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: bigint("user_id", { mode: "bigint" }).notNull().references(() => users.id),
  bankId: bigint("bank_id", { mode: "bigint" }).notNull().references(() => questionBanks.id),
  questionId: bigint("question_id", { mode: "bigint" }).notNull().references(() => questions.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userQuestionIdx: uniqueIndex("favorites_user_question_idx").on(table.userId, table.questionId),
}));
