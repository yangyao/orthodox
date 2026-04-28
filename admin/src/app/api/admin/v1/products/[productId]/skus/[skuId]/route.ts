import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { productSkus } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { success, notFound, validate } from "@/lib/api-utils";
import { z } from "zod";

const updateSkuSchema = z.object({
  title: z.string().min(1).max(128).optional(),
  priceFen: z.number().int().positive().optional(),
  originalPriceFen: z.number().int().positive().optional().nullable(),
  validityDays: z.number().int().positive().optional().nullable(),
  wechatPayEnabled: z.boolean().optional(),
  walletPayEnabled: z.boolean().optional(),
  activationEnabled: z.boolean().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string; skuId: string }> }
) {
  const { productId, skuId } = await params;
  const body = await request.json();
  const result = validate(updateSkuSchema, body);
  if ("error" in result) return result.error;

  const [updated] = await db
    .update(productSkus)
    .set(result.data)
    .where(and(eq(productSkus.id, BigInt(skuId)), eq(productSkus.productId, BigInt(productId))))
    .returning();

  if (!updated) return notFound("SKU 不存在");
  return success(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ productId: string; skuId: string }> }
) {
  const { productId, skuId } = await params;
  const [deleted] = await db
    .delete(productSkus)
    .where(and(eq(productSkus.id, BigInt(skuId)), eq(productSkus.productId, BigInt(productId))))
    .returning();

  if (!deleted) return notFound("SKU 不存在");
  return success(deleted);
}
