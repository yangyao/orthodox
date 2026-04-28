import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { questions, bankSections } from "@/lib/schema";
import { eq, ilike, and, desc, sql } from "drizzle-orm";
import { success, paginate, parsePagination } from "@/lib/api-utils";
import { validate } from "@/lib/api-utils";
import { z } from "zod";

const createSchema = z.object({
  sectionId: z.number().int().positive().optional().nullable(),
  questionType: z.enum(["single", "multi", "judge", "fill"]),
  stem: z.string().min(1),
  options: z.array(z.object({ label: z.string(), text: z.string() })).optional().nullable(),
  correctAnswer: z.union([z.string(), z.array(z.string())]),
  explanation: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).default(1),
  sourceLabel: z.string().max(128).optional(),
  sortOrder: z.number().int().default(0),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bankId: string }> }
) {
  const { bankId } = await params;
  const { page, pageSize, offset } = parsePagination(request.nextUrl.searchParams);

  const sectionId = request.nextUrl.searchParams.get("sectionId");
  const questionType = request.nextUrl.searchParams.get("questionType");
  const difficulty = request.nextUrl.searchParams.get("difficulty");
  const keyword = request.nextUrl.searchParams.get("keyword");

  const conditions = [eq(questions.bankId, BigInt(bankId))];
  if (sectionId) conditions.push(eq(questions.sectionId, BigInt(sectionId)));
  if (questionType) conditions.push(eq(questions.questionType, questionType));
  if (difficulty) conditions.push(eq(questions.difficulty, Number(difficulty)));
  if (keyword) conditions.push(ilike(questions.stem, `%${keyword}%`));

  const where = and(...conditions);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(questions)
    .where(where);

  const rows = await db
    .select({
      id: questions.id,
      sectionId: questions.sectionId,
      questionType: questions.questionType,
      stem: questions.stem,
      difficulty: questions.difficulty,
      sourceLabel: questions.sourceLabel,
      sortOrder: questions.sortOrder,
      status: questions.status,
      createdAt: questions.createdAt,
      sectionTitle: bankSections.title,
    })
    .from(questions)
    .leftJoin(bankSections, eq(questions.sectionId, bankSections.id))
    .where(where)
    .orderBy(desc(questions.createdAt))
    .limit(pageSize)
    .offset(offset);

  return paginate(rows, page, pageSize, Number(count));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bankId: string }> }
) {
  const { bankId } = await params;
  const body = await request.json();
  const result = validate(createSchema, body);
  if ("error" in result) return result.error;

  const values = {
    bankId: BigInt(bankId),
    sectionId: result.data.sectionId ? BigInt(result.data.sectionId) : null,
    questionType: result.data.questionType,
    stem: result.data.stem,
    options: result.data.options ?? null,
    correctAnswer: result.data.correctAnswer,
    explanation: result.data.explanation ?? null,
    difficulty: result.data.difficulty,
    sourceLabel: result.data.sourceLabel ?? null,
    sortOrder: result.data.sortOrder,
  };

  const [created] = await db.insert(questions).values(values).returning();

  if (result.data.sectionId) {
    await refreshSectionCount(result.data.sectionId);
  }

  return success(created, 201);
}

async function refreshSectionCount(sectionId: number) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(questions)
    .where(eq(questions.sectionId, BigInt(sectionId)));

  await db
    .update(bankSections)
    .set({ questionCount: Number(count) })
    .where(eq(bankSections.id, BigInt(sectionId)));
}
