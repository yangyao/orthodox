import {
  bigserial,
  bigint,
  pgTable,
  timestamp,
  varchar,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { questionBanks } from "./question-banks";

export const userBankEntitlements = pgTable("user_bank_entitlements", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  userId: bigint("user_id", { mode: "bigint" }).notNull().references(() => users.id),
  bankId: bigint("bank_id", { mode: "bigint" }).notNull().references(() => questionBanks.id),
  status: varchar("status", { length: 32 }).notNull().default("active"), // active, expired, revoked
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userBankIdx: uniqueIndex("user_bank_entitlement_idx").on(table.userId, table.bankId),
}));
