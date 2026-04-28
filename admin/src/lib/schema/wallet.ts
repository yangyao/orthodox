import {
  bigserial,
  bigint,
  integer,
  pgTable,
  index,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { orders } from "./orders";
import { paymentTransactions } from "./payments";

export const walletAccounts = pgTable(
  "wallet_accounts",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    userId: bigint("user_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    balanceFen: integer("balance_fen").notNull().default(0),
    frozenFen: integer("frozen_fen").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_wallet_accounts_user_id").on(table.userId),
  ],
);

export const walletLedgerEntries = pgTable(
  "wallet_ledger_entries",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    userId: bigint("user_id", { mode: "bigint" })
      .notNull()
      .references(() => users.id),
    entryType: varchar("entry_type", { length: 16 }).notNull(), // recharge / debit / refund
    direction: varchar("direction", { length: 4 }).notNull(), // in / out
    amountFen: integer("amount_fen").notNull(),
    balanceAfterFen: integer("balance_after_fen").notNull(),
    orderId: bigint("order_id", { mode: "bigint" }).references(() => orders.id),
    paymentTxnId: bigint("payment_txn_id", { mode: "bigint" }).references(
      () => paymentTransactions.id,
    ),
    remark: varchar("remark", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("idx_wallet_ledger_user_created")
      .on(table.userId, table.createdAt),
    index("idx_wallet_ledger_type_created")
      .on(table.entryType, table.createdAt),
  ],
);
