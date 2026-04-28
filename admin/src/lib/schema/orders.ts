import {
  bigserial,
  bigint,
  char,
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { catalogProducts } from "./products";
import { productSkus } from "./products";
import { users } from "./users";

export const orders = pgTable("orders", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  orderNo: varchar("order_no", { length: 32 }).notNull().unique(),
  userId: bigint("user_id", { mode: "bigint" }).notNull().references(() => users.id),
  orderType: varchar("order_type", { length: 16 }).notNull(), // bank / material / recharge
  status: varchar("status", { length: 16 }).notNull().default("pending"), // pending / paid / cancelled / closed / refunded
  totalAmountFen: integer("total_amount_fen").notNull(),
  payAmountFen: integer("pay_amount_fen").notNull(),
  currency: char("currency", { length: 3 }).notNull().default("CNY"),
  expiredAt: timestamp("expired_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  statusPaidAtIdx: index("orders_status_paid_at_idx").on(table.status, table.paidAt),
  orderTypePaidAtIdx: index("orders_type_paid_at_idx").on(table.orderType, table.paidAt),
  userIdCreatedAtIdx: index("orders_user_created_at_idx").on(table.userId, table.createdAt),
}));

export const orderItems = pgTable("order_items", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  orderId: bigint("order_id", { mode: "bigint" }).notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: bigint("product_id", { mode: "bigint" }).notNull().references(() => catalogProducts.id),
  skuId: bigint("sku_id", { mode: "bigint" }).notNull().references(() => productSkus.id),
  quantity: integer("quantity").notNull().default(1),
  unitPriceFen: integer("unit_price_fen").notNull(),
  totalPriceFen: integer("total_price_fen").notNull(),
  snapshot: jsonb("snapshot").notNull().$type<{
    title: string;
    priceFen: number;
    originalPriceFen: number | null;
    validityDays: number | null;
  }>(),
}, (table) => ({
  productIdIdx: index("order_items_product_id_idx").on(table.productId),
  orderIdIdx: index("order_items_order_id_idx").on(table.orderId),
}));
