import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { questions, bankSections } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { success, error, validate } from "@/lib/api-utils";
import { z } from "zod";

const questionItemSchema = z.object({
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

const importSchema = z.object({
  sectionId: z.number().int().positive().optional(),
  items: z.array(questionItemSchema).min(1).max(500),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bankId: string }> }
) {
  const { bankId } = await params;
  const body = await request.json();
  const result = validate(importSchema, body);
  if ("error" in result) return result.error;

  const { items, sectionId: defaultSectionId } = result.data;

  const errors: { index: number; message: string }[] = [];

  const values = items.map((item, index) => {
    const sid = item.sectionId ?? defaultSectionId ?? null;
    return {
      bankId: BigInt(bankId),
      sectionId: sid ? BigInt(sid) : null,
      questionType: item.questionType,
      stem: item.stem,
      options: item.options ?? null,
      correctAnswer: item.correctAnswer,
      explanation: item.explanation ?? null,
      difficulty: item.difficulty,
      sourceLabel: item.sourceLabel ?? null,
      sortOrder: item.sortOrder,
    };
  });

  try {
    const inserted = await db.insert(questions).values(values).returning();

    const affectedSections = new Set<string>();
    for (const v of values) {
      if (v.sectionId) affectedSections.add(String(v.sectionId));
    }

    for (const sid of affectedSections) {
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(questions)
        .where(eq(questions.sectionId, BigInt(sid)));
      await db
        .update(bankSections)
        .set({ questionCount: Number(count) })
        .where(eq(bankSections.id, BigInt(sid)));
    }

    return success({ created: inserted.length, errors });
  } catch (e) {
    return error(`导入失败: ${e instanceof Error ? e.message : "未知错误"}`, 500);
  }
}
