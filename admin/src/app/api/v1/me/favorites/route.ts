import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { favorites, questions, questionBanks } from "@/lib/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { parsePagination, paginate } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { page, pageSize, offset } = parsePagination(request.nextUrl.searchParams);
  const bankId = request.nextUrl.searchParams.get("bankId");

  const conditions = [eq(favorites.userId, auth.userId)];
  if (bankId && bankId !== "undefined") {
    conditions.push(eq(favorites.bankId, BigInt(bankId)));
  }

  const where = and(...conditions);

  const results = await db
    .select({
      id: favorites.id,
      bankId: favorites.bankId,
      bankName: questionBanks.name,
      questionId: favorites.questionId,
      questionStem: questions.stem,
      createdAt: favorites.createdAt,
    })
    .from(favorites)
    .innerJoin(questions, eq(favorites.questionId, questions.id))
    .innerJoin(questionBanks, eq(favorites.bankId, questionBanks.id))
    .where(where)
    .orderBy(desc(favorites.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(favorites)
    .where(where);

  return paginate(
    results.map((f) => ({
      ...f,
      id: String(f.id),
      bankId: String(f.bankId),
      questionId: String(f.questionId),
    })),
    page,
    pageSize,
    Number(count)
  );
}
