ALTER TABLE "practice_answers" ADD COLUMN "duration_seconds" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD COLUMN "duration_seconds" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "practice_sessions" ADD COLUMN "completed_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "practice_sessions_user_id_idx" ON "practice_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "practice_sessions_bank_id_idx" ON "practice_sessions" USING btree ("bank_id");--> statement-breakpoint
CREATE INDEX "practice_sessions_user_created_at_idx" ON "practice_sessions" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "practice_sessions_user_completed_at_idx" ON "practice_sessions" USING btree ("user_id","completed_at");--> statement-breakpoint
CREATE INDEX "practice_sessions_user_bank_idx" ON "practice_sessions" USING btree ("user_id","bank_id");