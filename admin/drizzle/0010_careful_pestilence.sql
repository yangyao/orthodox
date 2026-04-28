CREATE TABLE "resource_items" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"pack_id" bigint NOT NULL,
	"title" varchar(255) NOT NULL,
	"type" varchar(16) NOT NULL,
	"url" text NOT NULL,
	"content" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_packs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"bank_id" bigint,
	"title" varchar(255) NOT NULL,
	"cover_url" text,
	"description" text,
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "resource_items" ADD CONSTRAINT "resource_items_pack_id_resource_packs_id_fk" FOREIGN KEY ("pack_id") REFERENCES "public"."resource_packs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_packs" ADD CONSTRAINT "resource_packs_bank_id_question_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."question_banks"("id") ON DELETE no action ON UPDATE no action;