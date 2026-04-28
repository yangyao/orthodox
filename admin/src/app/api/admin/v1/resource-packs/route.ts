import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { resourcePacks } from "@/lib/schema";
import { eq, and, desc, sql, ilike } from "drizzle-orm";
import { success, error, validate, parsePagination, paginate } from "@/lib/api-utils";
import { z } from "zod";

const createSchema = z.object({
  bankId: z.string().optional().nullable(),
  title: z.string().min(1).max(255),
  coverUrl: z.string().url().optional().nullable().or(z.literal("")),
  description: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
  sortOrder: z.number().int().default(0),
});

export async function GET(request: NextRequest) {
  const { page, pageSize, offset } = parsePagination(request.nextUrl.searchParams);
  const status = request.nextUrl.searchParams.get("status");
  const bankId = request.nextUrl.searchParams.get("bankId");
  const keyword = request.nextUrl.searchParams.get("keyword");

  const conditions = [];
  if (status) conditions.push(eq(resourcePacks.status, status));
  if (bankId) conditions.push(eq(resourcePacks.bankId, BigInt(bankId)));
  if (keyword) conditions.push(ilike(resourcePacks.title, `%${keyword}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(resourcePacks)
    .where(where);

  const rows = await db
    .select()
    .from(resourcePacks)
    .where(where)
    .orderBy(desc(resourcePacks.sortOrder), desc(resourcePacks.createdAt))
    .limit(pageSize)
    .offset(offset);

  return paginate(
    rows.map((rp) => ({
      ...rp,
      id: String(rp.id),
      bankId: rp.bankId ? String(rp.bankId) : null,
    })),
    page,
    pageSize,
    Number(count)
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = validate(createSchema, body);
  if ("error" in result) return result.error;

  const [created] = await db
    .insert(resourcePacks)
    .values({
      ...result.data,
      bankId: result.data.bankId ? BigInt(result.data.bankId) : null,
    })
    .returning();
  
  return success({
    ...created,
    id: String(created.id),
    bankId: created.bankId ? String(created.bankId) : null,
  }, 201);
}
