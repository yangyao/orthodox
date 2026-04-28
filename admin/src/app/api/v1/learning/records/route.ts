import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { practiceSessions, questionBanks } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { success, parsePagination, paginate } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { page, pageSize, offset } = parsePagination(request.nextUrl.searchParams);

  const history = await db
    .select({
      id: practiceSessions.id,
      bankId: practiceSessions.bankId,
      bankName: questionBanks.name,
      mode: practiceSessions.mode,
      status: practiceSessions.status,
      score: practiceSessions.score,
      totalQuestions: practiceSessions.totalQuestions,
      answeredCount: practiceSessions.answeredCount,
      correctCount: practiceSessions.correctCount,
      durationSeconds: practiceSessions.durationSeconds,
      createdAt: practiceSessions.createdAt,
      completedAt: practiceSessions.completedAt,
    })
    .from(practiceSessions)
    .innerJoin(questionBanks, eq(practiceSessions.bankId, questionBanks.id))
    .where(eq(practiceSessions.userId, auth.userId))
    .orderBy(desc(practiceSessions.createdAt))
    .limit(pageSize)
    .offset(offset);

  // For total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, auth.userId));

  return paginate(
    history.map((h) => ({
      ...h,
      id: String(h.id),
      bankId: String(h.bankId),
      // Map mode to recordType as per spec
      recordType: h.mode === "mock" ? "mock_exam" : "practice",
      title: h.mode === "mock" ? "模拟考试" : "练习记录", // Simple default title
      summary: `${h.answeredCount}/${h.totalQuestions} 题`,
    })),
    page,
    pageSize,
    Number(count)
  );
}
