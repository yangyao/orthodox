import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { activationCodes, productSkus } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { error, success } from "@/lib/api-utils";
import crypto from "node:crypto";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous characters O, I, 0, 1
  const random = (len: number) => 
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `ACT-${random(8)}-${random(4)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skuId, count, batchNo, expiresAt } = body;

    if (!skuId || !count || count <= 0 || count > 1000) {
      return error("参数错误 (count 必须在 1-1000 之间)", 400);
    }

    // 1. 校验 SKU 存在且支持激活码
    const sku = await db.query.productSkus.findFirst({
      where: eq(productSkus.id, BigInt(skuId)),
    });

    if (!sku) {
      return error("SKU 不存在", 404);
    }

    if (!sku.activationEnabled) {
      return error("该 SKU 不支持激活码兑换", 400);
    }

    // 2. 批量生成激活码
    const codesToInsert = [];
    const generatedCodes = new Set<string>();

    while (generatedCodes.size < count) {
      const code = generateCode();
      if (!generatedCodes.has(code)) {
        generatedCodes.add(code);
        codesToInsert.push({
          code,
          skuId: BigInt(skuId),
          batchNo: batchNo || null,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          status: "active",
        });
      }
    }

    // 3. 写入数据库
    await db.insert(activationCodes).values(codesToInsert);

    return success({
      count: codesToInsert.length,
      batchNo,
      skuTitle: sku.title,
    });

  } catch (err) {
    console.error("Batch Generate Activation Codes Error:", err);
    return error("系统繁忙", 500);
  }
}
