import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mockPaperQuestions, mockPapers } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { success, notFound, validate } from "@/lib/api-utils";
import { z } from "zod";

async function refreshPaperStats(paperId: bigint) {
  const { sql } = await import("drizzle-orm");
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ paperId: string; questionId: string }> }
) {
  const { paperId, questionId } = await params;
  const paperIdBig = BigInt(paperId);
  const questionIdBig = BigInt(questionId);

  const body = await request.json();
  const schema = z.object({
    score: z.number().min(0).optional(),
    sortOrder: z.number().int().optional(),
  });
  const result = validate(schema, body);
  if ("error" in result) return result.error;

  const values: Record<string, unknown> = {};
  if (result.data.score !== undefined) values.score = String(result.data.score);
  if (result.data.sortOrder !== undefined) values.sortOrder = result.data.sortOrder;

  const [updated] = await db
    .update(mockPaperQuestions)
    .set(values)
    .where(and(eq(mockPaperQuestions.paperId, paperIdBig), eq(mockPaperQuestions.questionId, questionIdBig)))
    .returning();

  if (!updated) return notFound();

  await refreshPaperStats(paperIdBig);
  const [paper] = await db.select().from(mockPapers).where(eq(mockPapers.id, paperIdBig));
  return success(paper);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ paperId: string; questionId: string }> }
) {
  const { paperId, questionId } = await params;
  const paperIdBig = BigInt(paperId);
  const questionIdBig = BigInt(questionId);

  const [deleted] = await db
    .delete(mockPaperQuestions)
    .where(and(eq(mockPaperQuestions.paperId, paperIdBig), eq(mockPaperQuestions.questionId, questionIdBig)))
    .returning();

  if (!deleted) return notFound();

  const { sql } = await import("drizzle-orm");
  const [stats] = await db
    .select({
      count: sql<number>`count(*)`,
      totalScore: sql<string>`coalesce(sum(mpq.score), 0)`,
    })
    .from(mockPaperQuestions)
    .where(eq(mockPaperQuestions.paperId, paperIdBig));

  await db
    .update(mockPapers)
    .set({
      totalQuestions: Number(stats.count),
      totalScore: Math.round(Number(stats.totalScore)),
      updatedAt: new Date(),
    })
    .where(eq(mockPapers.id, paperIdBig));

  return success(deleted);
}
