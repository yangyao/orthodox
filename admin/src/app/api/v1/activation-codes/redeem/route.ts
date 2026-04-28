import { NextRequest } from "next/server";
import { authenticateUser } from "@/lib/user-auth";
import { error, success } from "@/lib/api-utils";
import { db } from "@/lib/db";
import {
  activationCodes,
  activationCodeRedemptions,
  productSkus,
  catalogProducts,
  userBankEntitlements,
} from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { fulfillOrder } from "@/lib/fulfillment"; // Assuming fulfillOrder logic can be reused or similar

export async function POST(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { userId } = auth;
  const { code } = await request.json();

  if (!code) {
    return error("请输入激活码", 400);
  }

  try {
    return await db.transaction(async (tx) => {
      // 1. SELECT FOR UPDATE 锁定激活码记录
      const [activationCode] = await tx
        .select()
        .from(activationCodes)
        .where(eq(activationCodes.code, code))
        .for("update");

      if (!activationCode) {
        return error("激活码无效", 404);
      }

      // 2. 校验状态与过期
      if (activationCode.status !== "active") {
        return error("激活码已失效或已核销", 400);
      }

      if (activationCode.expiresAt && activationCode.expiresAt < new Date()) {
        return error("激活码已过期", 400);
      }

      // 3. 获取 SKU 及其产品类型
      const sku = await tx.query.productSkus.findFirst({
        where: eq(productSkus.id, activationCode.skuId),
      });

      if (!sku) {
        return error("关联商品不存在", 404);
      }

      const product = await tx.query.catalogProducts.findFirst({
        where: eq(catalogProducts.id, sku.productId),
      });

      if (!product) {
        return error("关联产品不存在", 404);
      }

      // 4. 更新激活码状态
      await tx
        .update(activationCodes)
        .set({
          status: "redeemed",
          redeemedBy: userId,
          redeemedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(activationCodes.id, activationCode.id));

      // 5. 记录核销流水
      await tx.insert(activationCodeRedemptions).values({
        activationCodeId: activationCode.id,
        userId: userId,
        redeemType: "direct",
      });

      // 6. 发放权益
      if (product.productType === "bank") {
        const validityDays = sku.validityDays || 365;
        const expiresAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

        await tx
          .insert(userBankEntitlements)
          .values({
            userId,
            bankId: product.refId,
            status: "active",
            expiresAt: expiresAt,
          })
          .onConflictDoUpdate({
            target: [userBankEntitlements.userId, userBankEntitlements.bankId],
            set: {
              status: "active",
              expiresAt: expiresAt,
              updatedAt: new Date(),
            },
          });
      } else if (product.productType === "material") {
        // Material pack entitlement logic (placeholder for now as in fulfillOrder)
        console.log(`Granting material entitlement ${product.refId} to user ${userId}`);
      }

      return success({
        message: "兑换成功",
        productTitle: product.title,
        skuTitle: sku.title,
      });
    });
  } catch (err) {
    console.error("Redeem Activation Code Error:", err);
    return error("系统繁忙", 500);
  }
}
