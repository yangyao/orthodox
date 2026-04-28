import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { questionBanks, bankCategories } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { success, error, notFound, validate } from "@/lib/api-utils";
import { z } from "zod";

const updateSchema = z.object({
  categoryId: z.number().int().positive().optional(),
  name: z.string().min(1).max(128).optional(),
  subtitle: z.string().max(255).optional(),
  coverUrl: z.string().url().optional().or(z.literal("")).optional(),
  description: z.string().optional(),
  saleType: z.enum(["paid", "free"]).optional(),
  defaultValidDays: z.number().int().positive().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isRecommended: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bankId: string }> }
) {
  const { bankId } = await params;

  const rows = await db
    .select({
      id: questionBanks.id,
      categoryId: questionBanks.categoryId,
      code: questionBanks.code,
      name: questionBanks.name,
      subtitle: questionBanks.subtitle,
      coverUrl: questionBanks.coverUrl,
      description: questionBanks.description,
      status: questionBanks.status,
      saleType: questionBanks.saleType,
      defaultValidDays: questionBanks.defaultValidDays,
      sortOrder: questionBanks.sortOrder,
      isRecommended: questionBanks.isRecommended,
      createdAt: questionBanks.createdAt,
      updatedAt: questionBanks.updatedAt,
      categoryName: bankCategories.name,
    })
    .from(questionBanks)
    .leftJoin(bankCategories, eq(questionBanks.categoryId, bankCategories.id))
    .where(eq(questionBanks.id, BigInt(bankId)));

  if (rows.length === 0) return notFound();
  return success(rows[0]);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ bankId: string }> }
) {
  const { bankId } = await params;
  const body = await request.json();
  const result = validate(updateSchema, body);
  if ("error" in result) return result.error;

  const values: Record<string, unknown> = { ...result.data, updatedAt: new Date() };
  if (result.data.categoryId) values.categoryId = BigInt(result.data.categoryId);

  const [updated] = await db
    .update(questionBanks)
    .set(values)
    .where(eq(questionBanks.id, BigInt(bankId)))
    .returning();

  if (!updated) return notFound();
  return success(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ bankId: string }> }
) {
  const { bankId } = await params;

  const [updated] = await db
    .update(questionBanks)
    .set({ status: "archived", updatedAt: new Date() })
    .where(eq(questionBanks.id, BigInt(bankId)))
    .returning();

  if (!updated) return notFound();
  return success(updated);
}
