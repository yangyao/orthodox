import { bigserial, boolean, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const bankCategories = pgTable("bank_categories", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  name: varchar("name", { length: 64 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isVisible: boolean("is_visible").notNull().default(true),
});
