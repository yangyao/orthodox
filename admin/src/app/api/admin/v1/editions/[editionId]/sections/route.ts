import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { bankSections } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { success, validate } from "@/lib/api-utils";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(255),
  parentId: z.number().int().positive().optional().nullable(),
  sectionType: z.enum(["chapter", "section", "unit"]).default("chapter"),
  sortOrder: z.number().int().default(0),
  isTrial: z.boolean().default(false),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ editionId: string }> }
) {
  const { editionId } = await params;
  const rows = await db
    .select()
    .from(bankSections)
    .where(eq(bankSections.editionId, BigInt(editionId)))
    .orderBy(asc(bankSections.sortOrder));
  return success(rows);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ editionId: string }> }
) {
  const { editionId } = await params;
  const body = await request.json();
  const result = validate(createSchema, body);
  if ("error" in result) return result.error;

  const [created] = await db
    .insert(bankSections)
    .values({
      ...result.data,
      editionId: BigInt(editionId),
      parentId: result.data.parentId ? BigInt(result.data.parentId) : null,
    })
    .returning();
  return success(created, 201);
}
