import { NextRequest } from "next/server";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { paginate, parsePagination } from "@/lib/api-utils";
import { mockPapers, questionBanks } from "@/lib/schema";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { page, pageSize, offset } = parsePagination(searchParams);

  const status = searchParams.get("status");
  const keyword = searchParams.get("keyword");
  const bankId = searchParams.get("bankId");
  const conditions = [];

  if (status) {
    conditions.push(eq(mockPapers.status, status));
  }

  if (keyword) {
    conditions.push(ilike(mockPapers.title, `%${keyword}%`));
  }

  if (bankId) {
    conditions.push(eq(mockPapers.bankId, BigInt(bankId)));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const items = await db
    .select({
      id: mockPapers.id,
      bankId: mockPapers.bankId,
      bankName: questionBanks.name,
      title: mockPapers.title,
      paperYear: mockPapers.paperYear,
      totalQuestions: mockPapers.totalQuestions,
      totalScore: mockPapers.totalScore,
      passingScore: mockPapers.passingScore,
      durationMinutes: mockPapers.durationMinutes,
      status: mockPapers.status,
      createdAt: mockPapers.createdAt,
    })
    .from(mockPapers)
    .leftJoin(questionBanks, eq(questionBanks.id, mockPapers.bankId))
    .where(where)
    .orderBy(desc(mockPapers.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(mockPapers)
    .where(where);

  return paginate(items, page, pageSize, Number(count));
}
