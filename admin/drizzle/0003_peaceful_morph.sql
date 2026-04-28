CREATE TABLE "questions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"bank_id" bigint NOT NULL,
	"section_id" bigint,
	"question_type" varchar(16) NOT NULL,
	"stem" text NOT NULL,
	"options" jsonb,
	"correct_answer" jsonb NOT NULL,
	"explanation" text,
	"difficulty" smallint DEFAULT 1 NOT NULL,
	"source_label" varchar(128),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"status" varchar(16) DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_bank_id_question_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."question_banks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_section_id_bank_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."bank_sections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_questions_bank_section" ON "questions" USING btree ("bank_id","section_id","sort_order");