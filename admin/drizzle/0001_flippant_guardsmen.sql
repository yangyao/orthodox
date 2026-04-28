CREATE TABLE "bank_categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"code" varchar(32) NOT NULL,
	"name" varchar(64) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_visible" boolean DEFAULT true NOT NULL,
	CONSTRAINT "bank_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "question_banks" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"category_id" bigint NOT NULL,
	"code" varchar(64) NOT NULL,
	"name" varchar(128) NOT NULL,
	"subtitle" varchar(255),
	"cover_url" text,
	"description" text,
	"status" varchar(16) DEFAULT 'draft' NOT NULL,
	"sale_type" varchar(16) DEFAULT 'paid' NOT NULL,
	"default_valid_days" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_recommended" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_banks_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "question_banks" ADD CONSTRAINT "question_banks_category_id_bank_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."bank_categories"("id") ON DELETE no action ON UPDATE no action;