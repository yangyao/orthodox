CREATE TABLE "order_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_id" bigint NOT NULL,
	"product_id" bigint NOT NULL,
	"sku_id" bigint NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit_price_fen" integer NOT NULL,
	"total_price_fen" integer NOT NULL,
	"snapshot" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"order_no" varchar(32) NOT NULL,
	"user_id" bigint NOT NULL,
	"order_type" varchar(16) NOT NULL,
	"status" varchar(16) DEFAULT 'pending' NOT NULL,
	"total_amount_fen" integer NOT NULL,
	"pay_amount_fen" integer NOT NULL,
	"currency" char(3) DEFAULT 'CNY' NOT NULL,
	"expired_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_no_unique" UNIQUE("order_no")
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_catalog_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."catalog_products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_sku_id_product_skus_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."product_skus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;