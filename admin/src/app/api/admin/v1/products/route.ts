import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { catalogProducts, questionBanks } from "@/lib/schema";
import { eq, like, and, desc, sql } from "drizzle-orm";
import { success, paginate, parsePagination, validate, error } from "@/lib/api-utils";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { page, pageSize, offset } = parsePagination(searchParams);

  const conditions = [];
  const productType = searchParams.get("productType");
  const status = searchParams.get("status");
  const keyword = searchParams.get("keyword");

  if (productType) conditions.push(eq(catalogProducts.productType, productType));
  if (status) conditions.push(eq(catalogProducts.status, status));
  if (keyword) conditions.push(like(catalogProducts.title, `%${keyword}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const items = await db
    .select({
      id: catalogProducts.id,
      productType: catalogProducts.productType,
      refId: catalogProducts.refId,
      title: catalogProducts.title,
      coverUrl: catalogProducts.coverUrl,
      status: catalogProducts.status,
      createdAt: catalogProducts.createdAt,
      bankName: questionBanks.name,
    })
    .from(catalogProducts)
    .leftJoin(questionBanks, and(eq(catalogProducts.refId, questionBanks.id), eq(catalogProducts.productType, "bank")))
    .where(where)
    .orderBy(desc(catalogProducts.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(catalogProducts)
    .where(where);

  return paginate(items, page, pageSize, Number(count));
}

const createSchema = z.object({
  productType: z.enum(["bank", "material"]),
  refId: z.number().int().positive(),
  title: z.string().min(1).max(255),
  coverUrl: z.string().max(500).optional(),
  sellingPoints: z.array(z.string()).optional().default([]),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = validate(createSchema, body);
  if ("error" in result) return result.error;

  // Validate ref exists
  if (result.data.productType === "bank") {
    const [bank] = await db.select({ id: questionBanks.id }).from(questionBanks).where(eq(questionBanks.id, BigInt(result.data.refId)));
    if (!bank) return error("关联题库不存在", 400);
  }

  const [product] = await db
    .insert(catalogProducts)
    .values({ ...result.data, refId: BigInt(result.data.refId) })
    .returning();

  return success(product);
}
