import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { bankEditions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { success, notFound, validate } from "@/lib/api-utils";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  versionLabel: z.string().max(64).optional(),
  sortOrder: z.number().int().optional(),
  isTrial: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ editionId: string }> }
) {
  const { editionId } = await params;
  const [row] = await db
    .select()
    .from(bankEditions)
    .where(eq(bankEditions.id, BigInt(editionId)));
  if (!row) return notFound();
  return success(row);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ editionId: string }> }
) {
  const { editionId } = await params;
  const body = await request.json();
  const result = validate(updateSchema, body);
  if ("error" in result) return result.error;

  const [updated] = await db
    .update(bankEditions)
    .set(result.data)
    .where(eq(bankEditions.id, BigInt(editionId)))
    .returning();

  if (!updated) return notFound();
  return success(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ editionId: string }> }
) {
  const { editionId } = await params;
  const [deleted] = await db
    .delete(bankEditions)
    .where(eq(bankEditions.id, BigInt(editionId)))
    .returning();

  if (!deleted) return notFound();
  return success(deleted);
}
