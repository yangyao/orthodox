import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { wrongQuestions, questions, questionBanks } from "@/lib/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { success, parsePagination, paginate } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { page, pageSize, offset } = parsePagination(request.nextUrl.searchParams);
  const bankId = request.nextUrl.searchParams.get("bankId");

  const conditions = [eq(wrongQuestions.userId, auth.userId)];
  
  if (bankId && bankId !== "undefined" && bankId !== "null") {
    try {
      conditions.push(eq(wrongQuestions.bankId, BigInt(bankId)));
    } catch (e) {
      console.error("Invalid bankId for mistakes:", bankId);
    }
  }

  const query = db
    .select({
      id: wrongQuestions.id,
      bankId: wrongQuestions.bankId,
      bankName: questionBanks.name,
      questionId: wrongQuestions.questionId,
      questionStem: questions.stem,
      wrongCount: wrongQuestions.wrongCount,
      masteryCount: wrongQuestions.masteryCount,
      updatedAt: wrongQuestions.updatedAt,
    })
    .from(wrongQuestions)
    .innerJoin(questions, eq(wrongQuestions.questionId, questions.id))
    .innerJoin(questionBanks, eq(wrongQuestions.bankId, questionBanks.id))
    .where(and(...conditions))
    .orderBy(desc(wrongQuestions.updatedAt))
    .limit(pageSize)
    .offset(offset);

  const mistakes = await query;

  // Total count
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(wrongQuestions)
    .where(and(...conditions));

  return paginate(
    mistakes.map((m) => ({
      ...m,
      id: String(m.id),
      bankId: String(m.bankId),
      questionId: String(m.questionId),
    })),
    page,
    pageSize,
    Number(count)
  );
}
