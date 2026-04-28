import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mockPapers, mockPaperQuestions, questions } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { success, notFound, validate, error } from "@/lib/api-utils";
import { z } from "zod";

async function refreshPaperStats(paperId: bigint) {
  const [stats] = await db
    .select({
      count: sql<number>`count(*)`,
      totalScore: sql<string>`coalesce(sum(mpq.score), 0)`,
    })
    .from(mockPaperQuestions)
    .where(eq(mockPaperQuestions.paperId, paperId));

  await db
    .update(mockPapers)
    .set({
      totalQuestions: Number(stats.count),
      totalScore: Math.round(Number(stats.totalScore)),
      updatedAt: new Date(),
    })
    .where(eq(mockPapers.id, paperId));
}

const addSchema = z.object({
  items: z.array(z.object({
    questionId: z.number().int().positive(),
    score: z.number().min(0).optional().default(1),
    sortOrder: z.number().int().optional().default(0),
  })).min(1).max(200),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ paperId: string }> }
) {
  const { paperId } = await params;
  const paperIdBig = BigInt(paperId);

  const [paper] = await db
    .select()
    .from(mockPapers)
    .where(eq(mockPapers.id, paperIdBig));
  if (!paper) return notFound("试卷不存在");

  const body = await request.json();
  const result = validate(addSchema, body);
  if ("error" in result) return result.error;

  // Verify all questions belong to this paper's bank
  const questionIds = result.data.items.map((item) => BigInt(item.questionId));
  const existing = await db
    .select({ id: questions.id })
    .from(questions)
    .where(and(eq(questions.bankId, paper.bankId), sql`${questions.id} IN ${questionIds}`));

  const validIds = new Set(existing.map((q) => String(q.id)));
  const invalidItems = result.data.items.filter((item) => !validIds.has(String(item.questionId)));
  if (invalidItems.length > 0) {
    return error(`题目 ${invalidItems.map((i) => i.questionId).join(", ")} 不属于该题库`, 400);
  }

  // Get max sortOrder
  const [maxSort] = await db
    .select({ maxSort: sql<number>`coalesce(max(sort_order), 0)` })
    .from(mockPaperQuestions)
    .where(eq(mockPaperQuestions.paperId, paperIdBig));

  const values = result.data.items.map((item, i) => ({
    paperId: paperIdBig,
    questionId: BigInt(item.questionId),
    sortOrder: maxSort.maxSort + i + 1,
    score: String(item.score),
  }));

  // Use onConflictDoNothing to skip duplicates
  const { sql: sqlModule } = await import("drizzle-orm");
  await db.insert(mockPaperQuestions).values(values).onConflictDoNothing();

  await refreshPaperStats(paperIdBig);

  const [updated] = await db
    .select()
    .from(mockPapers)
    .where(eq(mockPapers.id, paperIdBig));

  return success(updated);
}
