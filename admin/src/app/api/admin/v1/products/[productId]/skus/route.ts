import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { catalogProducts, productSkus } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { success, notFound, validate, error } from "@/lib/api-utils";
import { z } from "zod";

const createSkuSchema = z.object({
  title: z.string().min(1).max(128),
  priceFen: z.number().int().positive(),
  originalPriceFen: z.number().int().positive().optional().nullable(),
  validityDays: z.number().int().positive().optional().nullable(),
  wechatPayEnabled: z.boolean().optional().default(true),
  walletPayEnabled: z.boolean().optional().default(true),
  activationEnabled: z.boolean().optional().default(true),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  const productIdBig = BigInt(productId);

  const [product] = await db
    .select()
    .from(catalogProducts)
    .where(eq(catalogProducts.id, productIdBig));
  if (!product) return notFound("商品不存在");

  const body = await request.json();
  const result = validate(createSkuSchema, body);
  if ("error" in result) return result.error;

  const skuCode = `SKU-${productId}-${Date.now()}`;

  const [sku] = await db
    .insert(productSkus)
    .values({
      productId: productIdBig,
      skuCode,
      ...result.data,
    })
    .returning();

  return success(sku);
}
