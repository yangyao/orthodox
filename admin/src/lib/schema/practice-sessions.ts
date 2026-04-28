import {
  bigserial,
  bigint,
  integer,
  numeric,
  pgTable,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { questionBanks } from "./question-banks";
import { bankSections } from "./bank-sections";
import { mockPapers } from "./mock-papers";

export const practiceSessions = pgTable("practice_sessions", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: bigint("user_id", { mode: "bigint" }).notNull().references(() => users.id),
  bankId: bigint("bank_id", { mode: "bigint" }).notNull().references(() => questionBanks.id),
  sectionId: bigint("section_id", { mode: "bigint" }).references(() => bankSections.id),
  paperId: bigint("paper_id", { mode: "bigint" }).references(() => mockPapers.id),
  mode: varchar("mode", { length: 32 }).notNull().default("sequential"), // sequential, random, mistake, mock
  status: varchar("status", { length: 16 }).notNull().default("started"), // started, finished
  score: numeric("score", { precision: 5, scale: 2 }),
  totalQuestions: integer("total_questions").notNull().default(0),
  answeredCount: integer("answered_count").notNull().default(0),
  correctCount: integer("correct_count").notNull().default(0),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("practice_sessions_user_id_idx").on(table.userId),
  bankIdIdx: index("practice_sessions_bank_id_idx").on(table.bankId),
  userIdCreatedAtIdx: index("practice_sessions_user_created_at_idx").on(table.userId, table.createdAt),
  userIdCompletedAtIdx: index("practice_sessions_user_completed_at_idx").on(table.userId, table.completedAt),
  userIdBankIdIdx: index("practice_sessions_user_bank_idx").on(table.userId, table.bankId),
}));
