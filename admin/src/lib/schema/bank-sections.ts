import { bigserial, bigint, boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { bankEditions } from "./bank-editions";

export const bankSections = pgTable("bank_sections", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  editionId: bigint("edition_id", { mode: "bigint" }).notNull().references(() => bankEditions.id, { onDelete: "cascade" }),
  parentId: bigint("parent_id", { mode: "bigint" }),
  title: varchar("title", { length: 255 }).notNull(),
  sectionType: varchar("section_type", { length: 16 }).notNull().default("chapter"),
  sortOrder: integer("sort_order").notNull().default(0),
  questionCount: integer("question_count").notNull().default(0),
  isTrial: boolean("is_trial").notNull().default(false),
});
