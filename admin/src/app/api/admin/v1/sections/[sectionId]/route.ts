import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { bankSections } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";
import { success, error, notFound, validate } from "@/lib/api-utils";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  sectionType: z.enum(["chapter", "section", "unit"]).optional(),
  sortOrder: z.number().int().optional(),
  isTrial: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const { sectionId } = await params;
  const body = await request.json();
  const result = validate(updateSchema, body);
  if ("error" in result) return result.error;

  const [updated] = await db
    .update(bankSections)
    .set(result.data)
    .where(eq(bankSections.id, BigInt(sectionId)))
    .returning();

  if (!updated) return notFound();
  return success(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sectionId: string }> }
) {
  const { sectionId } = await params;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(bankSections)
    .where(eq(bankSections.parentId, BigInt(sectionId)));

  if (Number(count) > 0) {
    return error("该章节下存在子章节，请先删除子章节", 409);
  }

  const [deleted] = await db
    .delete(bankSections)
    .where(eq(bankSections.id, BigInt(sectionId)))
    .returning();

  if (!deleted) return notFound();
  return success(deleted);
}
