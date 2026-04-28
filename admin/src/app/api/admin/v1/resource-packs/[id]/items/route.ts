import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { resourceItems } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { success, error, validate } from "@/lib/api-utils";
import { z } from "zod";

const createItemSchema = z.object({
  title: z.string().min(1).max(255),
  type: z.enum(["pdf", "link", "image"]),
  url: z.string().url(),
  content: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const packId = BigInt(id);
  const body = await request.json();
  const result = validate(createItemSchema, body);
  if ("error" in result) return result.error;

  const [created] = await db
    .insert(resourceItems)
    .values({
      ...result.data,
      packId,
    })
    .returning();

  return success({
    ...created,
    id: String(created.id),
    packId: String(created.packId),
  }, 201);
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const packId = BigInt(id);

  const items = await db
    .select()
    .from(resourceItems)
    .where(eq(resourceItems.packId, packId))
    .orderBy(asc(resourceItems.sortOrder), asc(resourceItems.createdAt));

  return success(items.map(item => ({
    ...item,
    id: String(item.id),
    packId: String(item.packId),
  })));
}
