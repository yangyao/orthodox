import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { questionBanks, bankCategories } from "@/lib/schema";
import { eq, ilike, sql, and, desc } from "drizzle-orm";
import { success, error, validate, parsePagination, paginate } from "@/lib/api-utils";
import { z } from "zod";

const createSchema = z.object({
  categoryId: z.number().int().positive(),
  code: z.string().min(1).max(64),
  name: z.string().min(1).max(128),
  subtitle: z.string().max(255).optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  saleType: z.enum(["paid", "free"]).default("paid"),
  defaultValidDays: z.number().int().positive().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isRecommended: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  const { page, pageSize, offset } = parsePagination(request.nextUrl.searchParams);
  const status = request.nextUrl.searchParams.get("status");
  const categoryId = request.nextUrl.searchParams.get("categoryId");
  const keyword = request.nextUrl.searchParams.get("keyword");

  const conditions = [];
  if (status) conditions.push(eq(questionBanks.status, status));
  if (categoryId) conditions.push(eq(questionBanks.categoryId, BigInt(categoryId)));
  if (keyword) conditions.push(ilike(questionBanks.name, `%${keyword}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(questionBanks)
    .where(where);

  const rows = await db
    .select({
      id: questionBanks.id,
      categoryId: questionBanks.categoryId,
      code: questionBanks.code,
      name: questionBanks.name,
      subtitle: questionBanks.subtitle,
      coverUrl: questionBanks.coverUrl,
      status: questionBanks.status,
      saleType: questionBanks.saleType,
      sortOrder: questionBanks.sortOrder,
      isRecommended: questionBanks.isRecommended,
      createdAt: questionBanks.createdAt,
      categoryName: bankCategories.name,
    })
    .from(questionBanks)
    .leftJoin(bankCategories, eq(questionBanks.categoryId, bankCategories.id))
    .where(where)
    .orderBy(desc(questionBanks.createdAt))
    .limit(pageSize)
    .offset(offset);

  return paginate(rows, page, pageSize, Number(count));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = validate(createSchema, body);
  if ("error" in result) return result.error;

  try {
    const [created] = await db
      .insert(questionBanks)
      .values({
        ...result.data,
        categoryId: BigInt(result.data.categoryId),
      })
      .returning();
    return success(created, 201);
  } catch (e: unknown) {
    if (e instanceof Error && "code" in e && (e as { code: string }).code === "23505") {
      return error("题库编码已存在", 409);
    }
    throw e;
  }
}
