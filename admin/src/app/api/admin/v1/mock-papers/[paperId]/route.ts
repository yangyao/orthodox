import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mockPapers, mockPaperQuestions, questions } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { success, notFound, validate } from "@/lib/api-utils";
import { z } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ paperId: string }> }
) {
  const { paperId } = await params;
  const [paper] = await db
    .select()
    .from(mockPapers)
    .where(eq(mockPapers.id, BigInt(paperId)));
  if (!paper) return notFound("试卷不存在");

  const paperQuestions = await db
    .select({
      questionId: mockPaperQuestions.questionId,
      sortOrder: mockPaperQuestions.sortOrder,
      score: mockPaperQuestions.score,
      questionType: questions.questionType,
      stem: questions.stem,
      options: questions.options,
    })
    .from(mockPaperQuestions)
    .innerJoin(questions, eq(mockPaperQuestions.questionId, questions.id))
    .where(eq(mockPaperQuestions.paperId, BigInt(paperId)))
    .orderBy(asc(mockPaperQuestions.sortOrder));

  return success({ ...paper, questions: paperQuestions });
}

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  paperYear: z.number().int().optional().nullable(),
  durationMinutes: z.number().int().min(1).optional(),
  passingScore: z.number().int().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ paperId: string }> }
) {
  const { paperId } = await params;
  const body = await request.json();
  const result = validate(updateSchema, body);
  if ("error" in result) return result.error;

  const values = { ...result.data, updatedAt: new Date() };

  const [updated] = await db
    .update(mockPapers)
    .set(values)
    .where(eq(mockPapers.id, BigInt(paperId)))
    .returning();

  if (!updated) return notFound();
  return success(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ paperId: string }> }
) {
  const { paperId } = await params;
  const [deleted] = await db
    .delete(mockPapers)
    .where(eq(mockPapers.id, BigInt(paperId)))
    .returning();
  if (!deleted) return notFound();
  return success(deleted);
}
