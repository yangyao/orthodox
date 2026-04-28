import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mockPapers, mockPaperQuestions, questions } from "@/lib/schema";
import { eq, and, sql, notInArray } from "drizzle-orm";
import { success, notFound, validate, error } from "@/lib/api-utils";
import { z } from "zod";

const drawSchema = z.object({
  sectionId: z.number().int().positive().optional(),
  questionType: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  count: z.number().int().min(1).max(200),
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
  const result = validate(drawSchema, body);
  if ("error" in result) return result.error;

  // Get existing question IDs in this paper
  const existing = await db
    .select({ questionId: mockPaperQuestions.questionId })
    .from(mockPaperQuestions)
    .where(eq(mockPaperQuestions.paperId, paperIdBig));

  const existingIds = existing.map((e) => e.questionId);

  // Build conditions
  const conditions = [eq(questions.bankId, paper.bankId)];
  if (result.data.sectionId) conditions.push(eq(questions.sectionId, BigInt(result.data.sectionId)));
  if (result.data.questionType) conditions.push(eq(questions.questionType, result.data.questionType));
  if (result.data.difficulty) conditions.push(eq(questions.difficulty, result.data.difficulty));
  if (existingIds.length > 0) {
    conditions.push(notInArray(questions.id, existingIds));
  }

  const where = and(...conditions);

  // Get available count
  const [{ available }] = await db
    .select({ available: sql<number>`count(*)` })
    .from(questions)
    .where(where);

  if (available === 0) {
    return error("没有符合条件的可抽题目", 400);
  }

  const drawCount = Math.min(result.data.count, Number(available));

  // Random draw using ORDER BY RANDOM()
  const drawn = await db
    .select({
      id: questions.id,
      questionType: questions.questionType,
      stem: questions.stem,
      difficulty: questions.difficulty,
    })
    .from(questions)
    .where(where)
    .orderBy(sql`RANDOM()`)
    .limit(drawCount);

  return success({
    items: drawn,
    availableCount: Number(available),
    drawCount,
    warning: drawCount < result.data.count
      ? `符合条件的题目仅 ${available} 道，不足 ${result.data.count} 道`
      : null,
  });
}
