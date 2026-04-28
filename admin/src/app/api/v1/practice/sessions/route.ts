import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { practiceSessions, questions, questionBanks, bankSections, wrongQuestions } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { checkEntitlement } from "@/lib/bank-auth";
import { success, error, validate } from "@/lib/api-utils";
import { z } from "zod";

const startSessionSchema = z.object({
  bankId: z.string().or(z.number()).transform(v => BigInt(v)),
  sectionId: z.string().or(z.number()).optional().transform(v => v ? BigInt(v) : undefined),
  mode: z.enum(["sequential", "random", "mistake"]).default("sequential"),
});

export async function POST(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const validation = validate(startSessionSchema, body);
  if ("error" in validation) return validation.error;

  const { bankId, sectionId, mode } = validation.data;

  // Check entitlement
  const entitlement = await checkEntitlement(auth.userId, bankId);
  if (!entitlement.hasAccess) return entitlement.error!;

  // Verify bank exists
  const [bank] = await db.select().from(questionBanks).where(eq(questionBanks.id, bankId));
  if (!bank) return error("题库不存在", 404);

  // If sectionId provided, verify section exists
  if (sectionId) {
    const [section] = await db.select().from(bankSections).where(eq(bankSections.id, sectionId));
    if (!section) return error("章节不存在", 404);
  }

  let questionIds: string[] = [];

  if (mode === "mistake") {
    // Fetch from wrong_questions
    const wrongRows = await db
      .select({ id: wrongQuestions.questionId })
      .from(wrongQuestions)
      .where(
        and(
          eq(wrongQuestions.userId, auth.userId),
          eq(wrongQuestions.bankId, bankId)
        )
      );
    questionIds = wrongRows.map(r => String(r.id));
    
    if (questionIds.length === 0) {
      return error("错题集中暂时没有题目", 400);
    }
  } else {
    // Standard question fetch
    let qQuery = db.select({ id: questions.id }).from(questions).where(
      and(
        eq(questions.bankId, bankId),
        eq(questions.status, "published"),
        sectionId ? eq(questions.sectionId, sectionId) : undefined
      )
    );
    
    const questionRows = await qQuery;
    questionIds = questionRows.map(r => String(r.id));

    if (questionIds.length === 0) {
      return error("该题库或章节下没有题目", 400);
    }
  }

  // Create session
  const [session] = await db.insert(practiceSessions).values({
    userId: auth.userId,
    bankId,
    sectionId: sectionId || null,
    mode,
    status: "started",
    totalQuestions: questionIds.length,
    answeredCount: 0,
    correctCount: 0,
  }).returning();

  return success({
    sessionId: String(session.id),
    questionIds,
    totalQuestions: session.totalQuestions,
  });
}
