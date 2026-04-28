import {
  bigserial,
  bigint,
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const catalogProducts = pgTable("catalog_products", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  productType: varchar("product_type", { length: 16 }).notNull(), // bank / material
  refId: bigint("ref_id", { mode: "bigint" }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  coverUrl: text("cover_url"),
  sellingPoints: jsonb("selling_points").$type<string[]>().default([]),
  status: varchar("status", { length: 16 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const productSkus = pgTable("product_skus", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  productId: bigint("product_id", { mode: "bigint" }).notNull().references(() => catalogProducts.id, { onDelete: "cascade" }),
  skuCode: varchar("sku_code", { length: 64 }).notNull().unique(),
  title: varchar("title", { length: 128 }).notNull(),
  priceFen: integer("price_fen").notNull(),
  originalPriceFen: integer("original_price_fen"),
  validityDays: integer("validity_days"),
  wechatPayEnabled: boolean("wechat_pay_enabled").notNull().default(true),
  walletPayEnabled: boolean("wallet_pay_enabled").notNull().default(true),
  activationEnabled: boolean("activation_enabled").notNull().default(true),
  status: varchar("status", { length: 16 }).notNull().default("active"),
});
