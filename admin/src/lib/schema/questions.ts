import {
  bigserial,
  bigint,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";
import { questionBanks } from "./question-banks";
import { bankSections } from "./bank-sections";

export const questions = pgTable(
  "questions",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    bankId: bigint("bank_id", { mode: "bigint" }).notNull().references(() => questionBanks.id),
    sectionId: bigint("section_id", { mode: "bigint" }).references(() => bankSections.id),
    questionType: varchar("question_type", { length: 16 }).notNull(),
    stem: text("stem").notNull(),
    options: jsonb("options").$type<{ label: string; text: string }[] | null>(),
    correctAnswer: jsonb("correct_answer").notNull().$type<string | string[]>(),
    explanation: text("explanation"),
    difficulty: smallint("difficulty").notNull().default(1),
    sourceLabel: varchar("source_label", { length: 128 }),
    sortOrder: integer("sort_order").notNull().default(0),
    status: varchar("status", { length: 16 }).notNull().default("published"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_questions_bank_section").on(table.bankId, table.sectionId, table.sortOrder),
  ]
);
