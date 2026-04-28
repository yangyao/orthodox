import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { resourcePacks, resourceItems } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { success, error, notFound, validate } from "@/lib/api-utils";
import { z } from "zod";

const updateSchema = z.object({
  bankId: z.string().optional().nullable(),
  title: z.string().min(1).max(255).optional(),
  coverUrl: z.string().url().optional().nullable().or(z.literal("")).optional(),
  description: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
  sortOrder: z.number().int().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const packId = BigInt(id);

  const [pack] = await db
    .select()
    .from(resourcePacks)
    .where(eq(resourcePacks.id, packId));

  if (!pack) return notFound();

  const items = await db
    .select()
    .from(resourceItems)
    .where(eq(resourceItems.packId, packId))
    .orderBy(asc(resourceItems.sortOrder), asc(resourceItems.createdAt));

  return success({
    ...pack,
    id: String(pack.id),
    bankId: pack.bankId ? String(pack.bankId) : null,
    items: items.map(item => ({
      ...item,
      id: String(item.id),
      packId: String(item.packId),
    })),
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const packId = BigInt(id);
  const body = await request.json();
  const result = validate(updateSchema, body);
  if ("error" in result) return result.error;

  const values: any = { ...result.data, updatedAt: new Date() };
  if (result.data.bankId !== undefined) {
    values.bankId = result.data.bankId ? BigInt(result.data.bankId) : null;
  }

  const [updated] = await db
    .update(resourcePacks)
    .set(values)
    .where(eq(resourcePacks.id, packId))
    .returning();

  if (!updated) return notFound();
  
  return success({
    ...updated,
    id: String(updated.id),
    bankId: updated.bankId ? String(updated.bankId) : null,
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const packId = BigInt(id);

  // Soft delete by setting status to inactive, or hard delete?
  // Let's do hard delete for items (cascading) and packs for now as per schema
  const [deleted] = await db
    .delete(resourcePacks)
    .where(eq(resourcePacks.id, packId))
    .returning();

  if (!deleted) return notFound();
  return success({ message: "Resource pack deleted" });
}
