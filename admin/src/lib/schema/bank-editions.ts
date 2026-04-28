import { bigserial, bigint, boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { questionBanks } from "./question-banks";

export const bankEditions = pgTable("bank_editions", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  bankId: bigint("bank_id", { mode: "bigint" }).notNull().references(() => questionBanks.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 128 }).notNull(),
  versionLabel: varchar("version_label", { length: 64 }),
  sortOrder: integer("sort_order").notNull().default(0),
  isTrial: boolean("is_trial").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
});
