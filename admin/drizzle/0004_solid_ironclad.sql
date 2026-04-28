CREATE TABLE "mock_paper_questions" (
	"paper_id" bigint NOT NULL,
	"question_id" bigint NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"score" numeric(8, 2) DEFAULT '1' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mock_papers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"bank_id" bigint NOT NULL,
	"title" varchar(255) NOT NULL,
	"paper_year" integer,
	"total_questions" integer DEFAULT 0 NOT NULL,
	"total_score" integer DEFAULT 0 NOT NULL,
	"passing_score" integer,
	"duration_minutes" integer NOT NULL,
	"status" varchar(16) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "mock_paper_questions" ADD CONSTRAINT "mock_paper_questions_paper_id_mock_papers_id_fk" FOREIGN KEY ("paper_id") REFERENCES "public"."mock_papers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_paper_questions" ADD CONSTRAINT "mock_paper_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mock_papers" ADD CONSTRAINT "mock_papers_bank_id_question_banks_id_fk" FOREIGN KEY ("bank_id") REFERENCES "public"."question_banks"("id") ON DELETE cascade ON UPDATE no action;