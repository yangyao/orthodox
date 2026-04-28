import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { catalogProducts, productSkus, questionBanks } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { success, notFound, validate, error } from "@/lib/api-utils";
import { z } from "zod";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const [product] = await db
    .select()
    .from(catalogProducts)
    .where(eq(catalogProducts.id, BigInt(productId)));
  if (!product) return notFound("商品不存在");

  const skus = await db
    .select()
    .from(productSkus)
    .where(eq(productSkus.productId, product.id))
    .orderBy(asc(productSkus.priceFen));

  let bankName: string | null = null;
  if (product.productType === "bank") {
    const [bank] = await db
      .select({ name: questionBanks.name })
      .from(questionBanks)
      .where(eq(questionBanks.id, product.refId));
    bankName = bank?.name ?? null;
  }

  return success({ ...product, bankName, skus });
}

const updateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  coverUrl: z.string().max(500).optional().nullable(),
  sellingPoints: z.array(z.string()).optional(),
  status: z.enum(["active", "inactive", "archived"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const body = await request.json();
  const result = validate(updateSchema, body);
  if ("error" in result) return result.error;

  const [updated] = await db
    .update(catalogProducts)
    .set(result.data)
    .where(eq(catalogProducts.id, BigInt(productId)))
    .returning();

  if (!updated) return notFound("商品不存在");
  return success(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const [updated] = await db
    .update(catalogProducts)
    .set({ status: "archived" })
    .where(eq(catalogProducts.id, BigInt(productId)))
    .returning();

  if (!updated) return notFound("商品不存在");
  return success(updated);
}
