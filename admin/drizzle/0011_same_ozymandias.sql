CREATE TABLE "catalog_products" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"product_type" varchar(16) NOT NULL,
	"ref_id" bigint NOT NULL,
	"title" varchar(255) NOT NULL,
	"cover_url" text,
	"selling_points" jsonb DEFAULT '[]'::jsonb,
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_skus" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"product_id" bigint NOT NULL,
	"sku_code" varchar(64) NOT NULL,
	"title" varchar(128) NOT NULL,
	"price_fen" integer NOT NULL,
	"original_price_fen" integer,
	"validity_days" integer,
	"wechat_pay_enabled" boolean DEFAULT true NOT NULL,
	"wallet_pay_enabled" boolean DEFAULT true NOT NULL,
	"activation_enabled" boolean DEFAULT true NOT NULL,
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	CONSTRAINT "product_skus_sku_code_unique" UNIQUE("sku_code")
);
--> statement-breakpoint
ALTER TABLE "product_skus" ADD CONSTRAINT "product_skus_product_id_catalog_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."catalog_products"("id") ON DELETE cascade ON UPDATE no action;