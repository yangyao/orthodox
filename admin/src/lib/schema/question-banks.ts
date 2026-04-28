import { bigserial, bigint, boolean, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { bankCategories } from "./bank-categories";

export const questionBanks = pgTable("question_banks", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  categoryId: bigint("category_id", { mode: "bigint" }).notNull().references(() => bankCategories.id),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),
  coverUrl: text("cover_url"),
  description: text("description"),
  status: varchar("status", { length: 16 }).notNull().default("draft"),
  saleType: varchar("sale_type", { length: 16 }).notNull().default("paid"),
  defaultValidDays: integer("default_valid_days"),
  sortOrder: integer("sort_order").notNull().default(0),
  isRecommended: boolean("is_recommended").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
