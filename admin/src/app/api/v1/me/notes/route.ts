import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { notes, questions, questionBanks } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { parsePagination, paginate } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { page, pageSize, offset } = parsePagination(request.nextUrl.searchParams);
  const bankId = request.nextUrl.searchParams.get("bankId");

  let query = db
    .select({
      id: notes.id,
      bankId: notes.bankId,
      bankName: questionBanks.name,
      questionId: notes.questionId,
      questionStem: questions.stem,
      content: notes.content,
      updatedAt: notes.updatedAt,
    })
    .from(notes)
    .innerJoin(questions, eq(notes.questionId, questions.id))
    .innerJoin(questionBanks, eq(notes.bankId, questionBanks.id))
    .where(eq(notes.userId, auth.userId))
    .orderBy(desc(notes.updatedAt))
    .limit(pageSize)
    .offset(offset);

  if (bankId) {
    // @ts-ignore
    query = query.where(eq(notes.bankId, BigInt(bankId)));
  }

  const results = await query;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(notes)
    .where(eq(notes.userId, auth.userId));

  return paginate(
    results.map((n) => ({
      ...n,
      id: String(n.id),
      bankId: String(n.bankId),
      questionId: String(n.questionId),
    })),
    page,
    pageSize,
    Number(count)
  );
}
