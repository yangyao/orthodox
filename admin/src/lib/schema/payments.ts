import {
  bigserial,
  bigint,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { orders } from "./orders";

export const paymentTransactions = pgTable("payment_transactions", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  orderId: bigint("order_id", { mode: "bigint" })
    .notNull()
    .references(() => orders.id),
  paymentMethod: varchar("payment_method", { length: 16 }).notNull(), // wechat / wallet / code
  paymentNo: varchar("payment_no", { length: 64 }).notNull().unique(), // Internal transaction NO
  providerTradeNo: varchar("provider_trade_no", { length: 128 }).unique(), // WeChat Pay Transaction ID
  amountFen: integer("amount_fen").notNull(),
  status: varchar("status", { length: 16 }).notNull().default("pending"), // pending / success / failed / closed
  providerPayload: jsonb("provider_payload"),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  statusPaidAtIdx: index("payment_txns_status_paid_at_idx").on(table.status, table.paidAt),
  methodStatusPaidAtIdx: index("payment_txns_method_status_paid_at_idx").on(table.paymentMethod, table.status, table.paidAt),
}));
