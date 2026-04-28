import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { practiceSessions, practiceAnswers, wrongQuestions, mockPapers } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { success, error } from "@/lib/api-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const sessionId = BigInt(id);

  const [session] = await db
    .select({
      id: practiceSessions.id,
      userId: practiceSessions.userId,
      bankId: practiceSessions.bankId,
      mode: practiceSessions.mode,
      status: practiceSessions.status,
      totalQuestions: practiceSessions.totalQuestions,
      correctCount: practiceSessions.correctCount,
      answeredCount: practiceSessions.answeredCount,
      createdAt: practiceSessions.createdAt,
      durationMinutes: mockPapers.durationMinutes,
    })
    .from(practiceSessions)
    .leftJoin(mockPapers, eq(practiceSessions.paperId, mockPapers.id))
    .where(
      and(
        eq(practiceSessions.id, sessionId),
        eq(practiceSessions.userId, auth.userId)
      )
    );

  if (!session) return error("会话不存在", 404);
  if (session.status === "finished") return error("会话已结束", 400);

  // Time check for mock
  if (session.mode === "mock" && session.durationMinutes) {
    const startTime = session.createdAt.getTime();
    const now = Date.now();
    const elapsedMinutes = (now - startTime) / (1000 * 60);
    // Even if expired, we allow finishing but maybe mark it? 
    // For now, let's just allow it but log it or something. 
    // The submit API already blocks if way over.
  }

  const score = session.totalQuestions > 0 
    ? (session.correctCount / session.totalQuestions) * 100 
    : 0;

  const now = new Date();
  const startTime = session.createdAt.getTime();
  const durationSeconds = Math.floor((now.getTime() - startTime) / 1000);

  const [updatedSession] = await db
    .update(practiceSessions)
    .set({
      status: "finished",
      score: score.toFixed(2),
      completedAt: now,
      durationSeconds: durationSeconds,
      updatedAt: now,
    })
    .where(eq(practiceSessions.id, sessionId))
    .returning();

  // If mock mode, sync mistakes to wrong_questions now
  if (session.mode === "mock") {
    const mistakes = await db
      .select({ questionId: practiceAnswers.questionId })
      .from(practiceAnswers)
      .where(
        and(
          eq(practiceAnswers.sessionId, sessionId),
          eq(practiceAnswers.isCorrect, false)
        )
      );

    for (const m of mistakes) {
      const [existingWrong] = await db
        .select()
        .from(wrongQuestions)
        .where(
          and(
            eq(wrongQuestions.userId, auth.userId),
            eq(wrongQuestions.questionId, m.questionId)
          )
        );

      if (existingWrong) {
        await db.update(wrongQuestions)
          .set({
            wrongCount: sql`${wrongQuestions.wrongCount} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(wrongQuestions.id, existingWrong.id));
      } else {
        await db.insert(wrongQuestions).values({
          userId: auth.userId,
          bankId: session.bankId,
          questionId: m.questionId,
          wrongCount: 1,
        });
      }
    }
  }

  return success({
    id: String(updatedSession.id),
    status: updatedSession.status,
    score: updatedSession.score,
    totalQuestions: updatedSession.totalQuestions,
    answeredCount: updatedSession.answeredCount,
    correctCount: updatedSession.correctCount,
  });
}
