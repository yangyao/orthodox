import {
  bigserial,
  bigint,
  integer,
  numeric,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { questionBanks } from "./question-banks";
import { questions } from "./questions";

export const mockPapers = pgTable("mock_papers", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  bankId: bigint("bank_id", { mode: "bigint" }).notNull().references(() => questionBanks.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  paperYear: integer("paper_year"),
  totalQuestions: integer("total_questions").notNull().default(0),
  totalScore: integer("total_score").notNull().default(0),
  passingScore: integer("passing_score"),
  durationMinutes: integer("duration_minutes").notNull(),
  status: varchar("status", { length: 16 }).notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mockPaperQuestions = pgTable("mock_paper_questions", {
  paperId: bigint("paper_id", { mode: "bigint" }).notNull().references(() => mockPapers.id, { onDelete: "cascade" }),
  questionId: bigint("question_id", { mode: "bigint" }).notNull().references(() => questions.id),
  sortOrder: integer("sort_order").notNull().default(0),
  score: numeric("score", { precision: 8, scale: 2 }).notNull().default("1"),
});
