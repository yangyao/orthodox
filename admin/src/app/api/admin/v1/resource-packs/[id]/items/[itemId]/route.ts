import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { resourceItems } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { success, error, notFound, validate } from "@/lib/api-utils";
import { z } from "zod";

const updateItemSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  type: z.enum(["pdf", "link", "image"]).optional(),
  url: z.string().url().optional(),
  content: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params;
  const packId = BigInt(id);
  const itemPk = BigInt(itemId);
  const body = await request.json();
  const result = validate(updateItemSchema, body);
  if ("error" in result) return result.error;

  const [updated] = await db
    .update(resourceItems)
    .set({ ...result.data, updatedAt: new Date() })
    .where(and(eq(resourceItems.id, itemPk), eq(resourceItems.packId, packId)))
    .returning();

  if (!updated) return notFound();
  
  return success({
    ...updated,
    id: String(updated.id),
    packId: String(updated.packId),
  });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params;
  const packId = BigInt(id);
  const itemPk = BigInt(itemId);

  const [deleted] = await db
    .delete(resourceItems)
    .where(and(eq(resourceItems.id, itemPk), eq(resourceItems.packId, packId)))
    .returning();

  if (!deleted) return notFound();
  return success({ message: "Resource item deleted" });
}
