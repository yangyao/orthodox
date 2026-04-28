import { bigint, bigserial, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const admins = pgTable("admins", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 16 }).notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
