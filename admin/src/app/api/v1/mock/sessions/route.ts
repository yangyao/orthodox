import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { practiceSessions, mockPapers, mockPaperQuestions } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { checkEntitlement } from "@/lib/bank-auth";
import { success, error, validate } from "@/lib/api-utils";
import { z } from "zod";

const startMockSessionSchema = z.object({
  paperId: z.string().or(z.number()).transform(v => BigInt(v)),
});

export async function POST(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const validation = validate(startMockSessionSchema, body);
  if ("error" in validation) return validation.error;

  const { paperId } = validation.data;

  // 1. Verify paper exists
  const [paper] = await db
    .select()
    .from(mockPapers)
    .where(eq(mockPapers.id, paperId));

  if (!paper) return error("试卷不存在", 404);

  // 2. Check entitlement
  const entitlement = await checkEntitlement(auth.userId, paper.bankId);
  if (!entitlement.hasAccess) return entitlement.error!;

  // 3. Get paper questions
  const paperQuestions = await db
    .select({ questionId: mockPaperQuestions.questionId })
    .from(mockPaperQuestions)
    .where(eq(mockPaperQuestions.paperId, paperId))
    .orderBy(asc(mockPaperQuestions.sortOrder));

  const questionIds = paperQuestions.map(q => String(q.questionId));

  if (questionIds.length === 0) {
    return error("该试卷下没有题目", 400);
  }

  // 3. Create session
  const [session] = await db.insert(practiceSessions).values({
    userId: auth.userId,
    bankId: paper.bankId,
    paperId: paperId,
    mode: "mock",
    status: "started",
    totalQuestions: questionIds.length,
    answeredCount: 0,
    correctCount: 0,
  }).returning();

  return success({
    sessionId: String(session.id),
    questionIds,
    totalQuestions: session.totalQuestions,
    durationMinutes: paper.durationMinutes,
  });
}
