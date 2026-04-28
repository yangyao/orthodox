CREATE TABLE "admins" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"username" varchar(64) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" varchar(16) DEFAULT 'admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admins_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"user_id" bigint PRIMARY KEY NOT NULL,
	"nickname" varchar(64),
	"avatar_url" text,
	"gender" integer,
	"province" varchar(64),
	"city" varchar(64),
	"last_login_at" timestamp with time zone,
	"last_login_ip" "inet"
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" bigint PRIMARY KEY NOT NULL,
	"current_bank_id" bigint,
	"exam_date" date,
	"random_question_count" integer DEFAULT 20 NOT NULL,
	"is_night_mode" boolean DEFAULT false NOT NULL,
	"auto_next_question" boolean DEFAULT true NOT NULL,
	"auto_save_wrong_question" boolean DEFAULT true NOT NULL,
	"retry_wrong_limit" integer DEFAULT 100 NOT NULL,
	"question_font_scale" numeric(4, 2) DEFAULT '1.00' NOT NULL,
	"question_layout_mode" varchar(16) DEFAULT 'smart' NOT NULL,
	"video_http_play_enabled" boolean DEFAULT false NOT NULL,
	"video_autoplay_next" boolean DEFAULT true NOT NULL,
	"video_seek_step_seconds" integer DEFAULT 15 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"openid" varchar(64) NOT NULL,
	"union_id" varchar(64),
	"mobile" varchar(32),
	"status" varchar(16) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_openid_unique" UNIQUE("openid")
);
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;