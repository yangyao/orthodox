import { bigserial, bigint, integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { questionBanks } from "./question-banks";

export const resourcePacks = pgTable("resource_packs", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  bankId: bigint("bank_id", { mode: "bigint" }).references(() => questionBanks.id),
  title: varchar("title", { length: 255 }).notNull(),
  coverUrl: text("cover_url"),
  description: text("description"),
  status: varchar("status", { length: 16 }).notNull().default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const resourceItems = pgTable("resource_items", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  packId: bigint("pack_id", { mode: "bigint" }).notNull().references(() => resourcePacks.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 16 }).notNull(), // pdf, link, image
  url: text("url").notNull(),
  content: text("content"), // Optional text content or link description
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
