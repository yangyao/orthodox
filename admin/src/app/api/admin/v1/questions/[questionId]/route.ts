import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { questions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { success, notFound, validate } from "@/lib/api-utils";
import { z } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params;
  const [row] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, BigInt(questionId)));
  if (!row) return notFound("题目不存在");
  return success(row);
}

const updateSchema = z.object({
  sectionId: z.number().int().positive().optional().nullable(),
  stem: z.string().min(1).optional(),
  options: z.array(z.object({ label: z.string(), text: z.string() })).optional().nullable(),
  correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
  explanation: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  sourceLabel: z.string().max(128).optional(),
  sortOrder: z.number().int().optional(),
  status: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  const { questionId } = await params;
  const body = await request.json();
  const result = validate(updateSchema, body);
  if ("error" in result) return result.error;

  const values: Record<string, unknown> = { ...result.data, updatedAt: new Date() };
  if (result.data.sectionId !== undefined) {
    values.sectionId = result.data.sectionId ? BigInt(result.data.sectionId) : null;
  }

  const [updated] = await db
    .update(questions)
    .set(values)
    .where(eq(questions.id, BigInt(questionId)))
    .returning();

  if (!updated) return notFound();
  return success(updated);
}
