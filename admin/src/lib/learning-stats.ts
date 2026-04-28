import { db } from "./db";
import { practiceSessions, practiceAnswers, questionBanks } from "./schema";
import { eq, and, sql, gte, lte, desc } from "drizzle-orm";

export interface LearningStatsOverview {
  studyDurationMinutes: number;
  completedUnitsCount: number;
  studyDaysCount: number;
  totalAnsweredCount: number;
  overallAccuracy: number;
  currentPeriod: {
    studyDurationMinutes: number;
    completedUnitsCount: number;
    studyDaysCount: number;
    periodLabel: string;
  };
}

export async function getLearningStatsOverview(userId: bigint): Promise<LearningStatsOverview> {
  // 1. Overall stats
  const overallStats = await db
    .select({
      totalDurationSeconds: sql<number>`COALESCE(SUM(${practiceSessions.durationSeconds}), 0)`,
      completedCount: sql<number>`COUNT(*) FILTER (WHERE ${practiceSessions.status} = 'finished')`,
      studyDays: sql<number>`COUNT(DISTINCT DATE(${practiceSessions.createdAt}))`,
      totalAnswered: sql<number>`COALESCE(SUM(${practiceSessions.answeredCount}), 0)`,
      totalCorrect: sql<number>`COALESCE(SUM(${practiceSessions.correctCount}), 0)`,
    })
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, userId));

  const s = overallStats[0];
  const accuracy = s.totalAnswered > 0 ? (s.totalCorrect / s.totalAnswered) * 100 : 0;

  // 2. Current period stats (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const periodStats = await db
    .select({
      totalDurationSeconds: sql<number>`COALESCE(SUM(${practiceSessions.durationSeconds}), 0)`,
      completedCount: sql<number>`COUNT(*) FILTER (WHERE ${practiceSessions.status} = 'finished')`,
      studyDays: sql<number>`COUNT(DISTINCT DATE(${practiceSessions.createdAt}))`,
    })
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.userId, userId),
        gte(practiceSessions.createdAt, sevenDaysAgo)
      )
    );

  const p = periodStats[0];

  return {
    studyDurationMinutes: Math.floor(s.totalDurationSeconds / 60),
    completedUnitsCount: Number(s.completedCount),
    studyDaysCount: Number(s.studyDays),
    totalAnsweredCount: Number(s.totalAnswered),
    overallAccuracy: Number(accuracy.toFixed(2)),
    currentPeriod: {
      studyDurationMinutes: Math.floor(p.totalDurationSeconds / 60),
      completedUnitsCount: Number(p.completedCount),
      studyDaysCount: Number(p.studyDays),
      periodLabel: "近7日",
    },
  };
}

export interface DailyStat {
  date: string;
  durationSeconds: number;
  answeredCount: number;
}

export async function getDailyStats(
  userId: bigint,
  startDate: Date,
  endDate: Date
): Promise<DailyStat[]> {
  const stats = await db
    .select({
      date: sql<string>`DATE(${practiceSessions.createdAt})::text`,
      durationSeconds: sql<number>`SUM(${practiceSessions.durationSeconds})`,
      answeredCount: sql<number>`SUM(${practiceSessions.answeredCount})`,
    })
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.userId, userId),
        gte(practiceSessions.createdAt, startDate),
        lte(practiceSessions.createdAt, endDate)
      )
    )
    .groupBy(sql`DATE(${practiceSessions.createdAt})`)
    .orderBy(sql`DATE(${practiceSessions.createdAt})`);

  return stats.map(s => ({
    date: s.date,
    durationSeconds: Number(s.durationSeconds || 0),
    answeredCount: Number(s.answeredCount || 0),
  }));
}

export interface BankStats {
  answeredQuestionsCount: number;
  correctAnswersCount: number;
  accuracyRate: number;
  practiceSessionCount: number;
  mockExamCount: number;
  totalStudyDurationMinutes: number;
  lastStudiedAt: Date | null;
}

export async function getBankStats(userId: bigint, bankId: bigint): Promise<BankStats> {
  const stats = await db
    .select({
      answeredCount: sql<number>`COALESCE(SUM(${practiceSessions.answeredCount}), 0)`,
      correctCount: sql<number>`COALESCE(SUM(${practiceSessions.correctCount}), 0)`,
      practiceCount: sql<number>`COUNT(*) FILTER (WHERE ${practiceSessions.mode} != 'mock')`,
      mockCount: sql<number>`COUNT(*) FILTER (WHERE ${practiceSessions.mode} = 'mock')`,
      totalDurationSeconds: sql<number>`COALESCE(SUM(${practiceSessions.durationSeconds}), 0)`,
      lastStudiedAt: sql<Date | null>`MAX(${practiceSessions.updatedAt})`,
    })
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.bankId, bankId)
      )
    );

  const s = stats[0];
  const accuracy = s.answeredCount > 0 ? (s.correctCount / s.answeredCount) * 100 : 0;

  return {
    answeredQuestionsCount: Number(s.answeredCount),
    correctAnswersCount: Number(s.correctCount),
    accuracyRate: Number(accuracy.toFixed(2)),
    practiceSessionCount: Number(s.practiceCount),
    mockExamCount: Number(s.mockCount),
    totalStudyDurationMinutes: Math.floor(s.totalDurationSeconds / 60),
    lastStudiedAt: s.lastStudiedAt,
  };
}
