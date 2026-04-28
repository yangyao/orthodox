import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { bankEditions } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { success, error, validate } from "@/lib/api-utils";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1).max(128),
  versionLabel: z.string().max(64).optional(),
  sortOrder: z.number().int().default(0),
  isTrial: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ bankId: string }> }
) {
  const { bankId } = await params;
  const rows = await db
    .select()
    .from(bankEditions)
    .where(eq(bankEditions.bankId, BigInt(bankId)))
    .orderBy(asc(bankEditions.sortOrder));
  return success(rows);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bankId: string }> }
) {
  const { bankId } = await params;
  const body = await request.json();
  const result = validate(createSchema, body);
  if ("error" in result) return result.error;

  const [created] = await db
    .insert(bankEditions)
    .values({ ...result.data, bankId: BigInt(bankId) })
    .returning();
  return success(created, 201);
}
