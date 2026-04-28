import {
  bigint,
  bigserial,
  boolean,
  date,
  inet,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: bigserial("id", { mode: "bigint" }).primaryKey(),
  openid: varchar("openid", { length: 64 }).notNull().unique(),
  unionId: varchar("union_id", { length: 64 }),
  mobile: varchar("mobile", { length: 32 }),
  status: varchar("status", { length: 16 }).notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  userId: bigint("user_id", { mode: "bigint" }).primaryKey().references(() => users.id, { onDelete: "cascade" }),
  nickname: varchar("nickname", { length: 64 }),
  avatarUrl: text("avatar_url"),
  gender: integer("gender"),
  province: varchar("province", { length: 64 }),
  city: varchar("city", { length: 64 }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  lastLoginIp: inet("last_login_ip"),
});

export const userSettings = pgTable("user_settings", {
  userId: bigint("user_id", { mode: "bigint" }).primaryKey().references(() => users.id, { onDelete: "cascade" }),
  currentBankId: bigint("current_bank_id", { mode: "bigint" }),
  examDate: date("exam_date"),
  randomQuestionCount: integer("random_question_count").notNull().default(20),
  isNightMode: boolean("is_night_mode").notNull().default(false),
  autoNextQuestion: boolean("auto_next_question").notNull().default(true),
  autoSaveWrongQuestion: boolean("auto_save_wrong_question").notNull().default(true),
  retryWrongLimit: integer("retry_wrong_limit").notNull().default(100),
  questionFontScale: numeric("question_font_scale", { precision: 4, scale: 2 }).notNull().default("1.00"),
  questionLayoutMode: varchar("question_layout_mode", { length: 16 }).notNull().default("smart"),
  videoHttpPlayEnabled: boolean("video_http_play_enabled").notNull().default(false),
  videoAutoplayNext: boolean("video_autoplay_next").notNull().default(true),
  videoSeekStepSeconds: integer("video_seek_step_seconds").notNull().default(15),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
