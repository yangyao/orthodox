import {
  bigserial,
  bigint,
  pgTable,
  timestamp,
  varchar,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { productSkus } from "./products";
import { users } from "./users";
import { orders } from "./orders";

export const activationCodes = pgTable("activation_codes", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  code: varchar("code", { length: 32 }).notNull().unique(), // ACT-XXXXXXXX-XXXX
  skuId: bigint("sku_id", { mode: "bigint" })
    .notNull()
    .references(() => productSkus.id),
  batchNo: varchar("batch_no", { length: 32 }),
  status: varchar("status", { length: 16 }).notNull().default("active"), // active / redeemed / expired / disabled
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  redeemedBy: bigint("redeemed_by", { mode: "bigint" }).references(() => users.id),
  redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activationCodeRedemptions = pgTable("activation_code_redemptions", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  activationCodeId: bigint("activation_code_id", { mode: "bigint" })
    .notNull()
    .references(() => activationCodes.id),
  userId: bigint("user_id", { mode: "bigint" })
    .notNull()
    .references(() => users.id),
  orderId: bigint("order_id", { mode: "bigint" }).references(() => orders.id), // 可选，如果是通过订单支付路径
  redeemType: varchar("redeem_type", { length: 16 }).notNull(), // direct / order
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
