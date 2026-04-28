import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mockPapers } from "@/lib/schema";
import { eq, ilike, and, desc, sql } from "drizzle-orm";
import { success, paginate, parsePagination, validate, error } from "@/lib/api-utils";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1).max(255),
  paperYear: z.number().int().optional().nullable(),
  durationMinutes: z.number().int().min(1),
  passingScore: z.number().int().optional().nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bankId: string }> }
) {
  const { bankId } = await params;
  const { page, pageSize, offset } = parsePagination(request.nextUrl.searchParams);

  const status = request.nextUrl.searchParams.get("status");
  const keyword = request.nextUrl.searchParams.get("keyword");

  const conditions = [eq(mockPapers.bankId, BigInt(bankId))];
  if (status) conditions.push(eq(mockPapers.status, status));
  if (keyword) conditions.push(ilike(mockPapers.title, `%${keyword}%`));

  const where = and(...conditions);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(mockPapers)
    .where(where);

  const rows = await db
    .select()
    .from(mockPapers)
    .where(where)
    .orderBy(desc(mockPapers.createdAt))
    .limit(pageSize)
    .offset(offset);

  return paginate(rows, page, pageSize, Number(count));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bankId: string }> }
) {
  const { bankId } = await params;
  const body = await request.json();
  const result = validate(createSchema, body);
  if ("error" in result) return result.error;

  const values = {
    bankId: BigInt(bankId),
    title: result.data.title,
    paperYear: result.data.paperYear ?? null,
    durationMinutes: result.data.durationMinutes,
    passingScore: result.data.passingScore ?? null,
    status: result.data.status,
  };

  const [created] = await db.insert(mockPapers).values(values).returning();
  return success(created, 201);
}
