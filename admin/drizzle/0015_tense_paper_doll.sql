CREATE TABLE "activation_code_redemptions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"activation_code_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"order_id" bigint,
	"redeem_type" varchar(16) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activation_codes" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(32) NOT NULL,
	"sku_id" bigint NOT NULL,
	"batch_no" varchar(32),
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone,
	"redeemed_by" bigint,
	"redeemed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "activation_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "activation_code_redemptions" ADD CONSTRAINT "activation_code_redemptions_activation_code_id_activation_codes_id_fk" FOREIGN KEY ("activation_code_id") REFERENCES "public"."activation_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_code_redemptions" ADD CONSTRAINT "activation_code_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_code_redemptions" ADD CONSTRAINT "activation_code_redemptions_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_codes" ADD CONSTRAINT "activation_codes_sku_id_product_skus_id_fk" FOREIGN KEY ("sku_id") REFERENCES "public"."product_skus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activation_codes" ADD CONSTRAINT "activation_codes_redeemed_by_users_id_fk" FOREIGN KEY ("redeemed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;