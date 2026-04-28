import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { practiceSessions, practiceAnswers, questions, wrongQuestions, mockPapers } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { success, error, validate } from "@/lib/api-utils";
import { z } from "zod";

const submitAnswerSchema = z.object({
  questionId: z.string().or(z.number()).transform(v => BigInt(v)),
  userAnswer: z.union([z.string(), z.array(z.string())]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const sessionId = BigInt(id);

  const body = await request.json();
  const validation = validate(submitAnswerSchema, body);
  if ("error" in validation) return validation.error;

  const { questionId, userAnswer } = validation.data;

  // 1. Verify session
  const [session] = await db
    .select({
      id: practiceSessions.id,
      userId: practiceSessions.userId,
      bankId: practiceSessions.bankId,
      mode: practiceSessions.mode,
      status: practiceSessions.status,
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
  if (session.status !== "started") return error("会话已结束", 400);

  // Check duration for mock mode
  if (session.mode === "mock" && session.durationMinutes) {
    const startTime = session.createdAt.getTime();
    const now = Date.now();
    const elapsedMinutes = (now - startTime) / (1000 * 60);
    if (elapsedMinutes > session.durationMinutes + 1) { // 1 min buffer
      return error("考试时间已到", 403);
    }
  }

  // 2. Get question and correct answer
  const [question] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, questionId));

  if (!question) return error("题目不存在", 404);

  // 3. Compare answers
  let isCorrect = false;
  const correct = question.correctAnswer;

  if (Array.isArray(correct) && Array.isArray(userAnswer)) {
    const sortedCorrect = [...correct].sort().join(",");
    const sortedUser = [...userAnswer].sort().join(",");
    isCorrect = sortedCorrect === sortedUser;
  } else if (typeof correct === "string" && typeof userAnswer === "string") {
    isCorrect = correct === userAnswer;
  }

  // 4. Record answer in practice_answers
  const [existingAnswer] = await db
    .select()
    .from(practiceAnswers)
    .where(
      and(
        eq(practiceAnswers.sessionId, sessionId),
        eq(practiceAnswers.questionId, questionId)
      )
    );

  if (existingAnswer) {
    const wasCorrect = existingAnswer.isCorrect;
    await db.update(practiceAnswers)
      .set({
        userAnswer,
        isCorrect,
        createdAt: new Date(),
      })
      .where(eq(practiceAnswers.id, existingAnswer.id));

    if (wasCorrect !== isCorrect) {
      await db.update(practiceSessions)
        .set({
          correctCount: sql`${practiceSessions.correctCount} + ${isCorrect ? 1 : -1}`,
          updatedAt: new Date(),
        })
        .where(eq(practiceSessions.id, sessionId));
    }
  } else {
    await db.insert(practiceAnswers).values({
      sessionId,
      questionId,
      userAnswer,
      isCorrect,
    });

    await db.update(practiceSessions)
      .set({
        answeredCount: sql`${practiceSessions.answeredCount} + 1`,
        correctCount: sql`${practiceSessions.correctCount} + ${isCorrect ? 1 : 0}`,
        updatedAt: new Date(),
      })
      .where(eq(practiceSessions.id, sessionId));
  }

  // 5. Update wrong_questions collection (Skip for mock mode until finished?)
  // Actually, usually mock results are separate, but if we want to reuse wrong_questions,
  // we might want to wait until the exam is finished to add them.
  // For now, let's follow the existing logic but maybe users don't want to see wrong questions
  // from mock exams in their daily mistake set immediately.
  // The spec doesn't say, so I'll keep it for now but omit from return if mock.

  if (!isCorrect && session.mode !== "mock") {
    const [existingWrong] = await db
      .select()
      .from(wrongQuestions)
      .where(
        and(
          eq(wrongQuestions.userId, auth.userId),
          eq(wrongQuestions.questionId, questionId)
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
        questionId: questionId,
        wrongCount: 1,
      });
    }
  } else if (session.mode === "mistake") {
    await db.update(wrongQuestions)
      .set({
        masteryCount: sql`${wrongQuestions.masteryCount} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(wrongQuestions.userId, auth.userId),
          eq(wrongQuestions.questionId, questionId)
        )
      );
  }

  if (session.mode === "mock") {
    return success({
      message: "答案已保存",
    });
  }

  return success({
    isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
  });
}
