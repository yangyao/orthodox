CREATE TABLE "bank_editions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"bank_id" bigint NOT NULL,
	"name" varchar(128) NOT NULL,
	"version_label" varchar(64),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_trial" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bank_sections" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"edition_id" bigint NOT NULL,
	"parent_id" bigint,
	"title" varchar(255) NOT NULL,
	"section_type" varchar(16) DEFAULT 'chapter' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"question_count" integer DEFAULT 0 NOT NULL,
	"is_trial" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bank_editions" ADD CONSTRAINT "bank_editions_bank_id_question_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."question_banks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bank_sections" ADD CONSTRAINT "bank_sections_edition_id_bank_editions_id_fk" FOREIGN KEY ("edition_id") REFERENCES "public"."bank_editions"("id") ON DELETE cascade ON UPDATE no action;