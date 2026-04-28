CREATE TABLE "wallet_accounts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"balance_fen" integer DEFAULT 0 NOT NULL,
	"frozen_fen" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wallet_accounts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "wallet_ledger_entries" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"entry_type" varchar(16) NOT NULL,
	"direction" varchar(4) NOT NULL,
	"amount_fen" integer NOT NULL,
	"balance_after_fen" integer NOT NULL,
	"order_id" bigint,
	"payment_txn_id" bigint,
	"remark" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wallet_accounts" ADD CONSTRAINT "wallet_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_ledger_entries" ADD CONSTRAINT "wallet_ledger_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_ledger_entries" ADD CONSTRAINT "wallet_ledger_entries_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_ledger_entries" ADD CONSTRAINT "wallet_ledger_entries_payment_txn_id_payment_transactions_id_fk" FOREIGN KEY ("payment_txn_id") REFERENCES "public"."payment_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_wallet_accounts_user_id" ON "wallet_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_wallet_ledger_user_created" ON "wallet_ledger_entries" USING btree ("user_id","created_at");