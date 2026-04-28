import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { bankCategories, questionBanks } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { success, error, notFound, validate } from "@/lib/api-utils";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(64).optional(),
  sortOrder: z.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await _request.json();
  const result = validate(updateSchema, body);
  if ("error" in result) return result.error;

  const [updated] = await db
    .update(bankCategories)
    .set(result.data)
    .where(eq(bankCategories.id, BigInt(id)))
    .returning();

  if (!updated) return notFound();
  return success(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(questionBanks)
    .where(eq(questionBanks.categoryId, BigInt(id)));

  if (Number(count) > 0) {
    return error("该分类下存在题库，无法删除", 409);
  }

  const [deleted] = await db
    .delete(bankCategories)
    .where(eq(bankCategories.id, BigInt(id)))
    .returning();

  if (!deleted) return notFound();
  return success(deleted);
}
