CREATE TABLE "payment_transactions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_id" bigint NOT NULL,
	"payment_method" varchar(16) NOT NULL,
	"payment_no" varchar(64) NOT NULL,
	"provider_trade_no" varchar(128),
	"amount_fen" integer NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"provider_payload" jsonb,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "payment_transactions_payment_no_unique" UNIQUE("payment_no"),
	CONSTRAINT "payment_transactions_provider_trade_no_unique" UNIQUE("provider_trade_no")
);
--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;