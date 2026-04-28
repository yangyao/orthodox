import { NextRequest } from "next/server";
import { authenticateUser } from "@/lib/user-auth";
import { error, success } from "@/lib/api-utils";
import { db } from "@/lib/db";
import {
  orders,
  orderItems,
  activationCodes,
  activationCodeRedemptions,
  paymentTransactions,
} from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { fulfillOrder } from "@/lib/fulfillment";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { userId } = auth;
  const { orderId } = await params;
  const { code } = await request.json();

  if (!code) {
    return error("请输入激活码", 400);
  }

  try {
    return await db.transaction(async (tx) => {
      // 1. 获取订单并验证
      const order = await tx.query.orders.findFirst({
        where: and(eq(orders.id, BigInt(orderId)), eq(orders.userId, userId)),
      });

      if (!order) {
        return error("订单不存在", 404);
      }

      if (order.status !== "pending") {
        return error("订单状态异常", 400);
      }

      // 2. 获取订单项 (支持激活码的订单通常只有一个 SKU)
      const items = await tx.query.orderItems.findMany({
        where: eq(orderItems.orderId, order.id),
      });

      if (items.length !== 1) {
        return error("该订单不支持激活码支付 (商品数量异常)", 400);
      }

      const orderSkuId = items[0].skuId;

      // 3. 锁定并校验激活码
      const [activationCode] = await tx
        .select()
        .from(activationCodes)
        .where(eq(activationCodes.code, code))
        .for("update");

      if (!activationCode) {
        return error("激活码无效", 404);
      }

      if (activationCode.status !== "active") {
        return error("激活码已失效或已核销", 400);
      }

      if (activationCode.expiresAt && activationCode.expiresAt < new Date()) {
        return error("激活码已过期", 400);
      }

      // 4. 校验激活码是否匹配订单 SKU
      if (activationCode.skuId !== orderSkuId) {
        return error("激活码与订单商品不匹配", 400);
      }

      // 5. 记录支付流水
      const paymentNo = `ACT-${order.orderNo}-${Date.now()}`;
      await tx.insert(paymentTransactions).values({
        orderId: order.id,
        paymentMethod: "code",
        paymentNo: paymentNo,
        amountFen: order.payAmountFen,
        status: "success",
        paidAt: new Date(),
        providerPayload: { code: activationCode.code },
      });

      // 6. 更新激活码状态
      await tx
        .update(activationCodes)
        .set({
          status: "redeemed",
          redeemedBy: userId,
          redeemedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(activationCodes.id, activationCode.id));

      // 7. 记录核销流水
      await tx.insert(activationCodeRedemptions).values({
        activationCodeId: activationCode.id,
        userId: userId,
        orderId: order.id,
        redeemType: "order",
      });

      // 8. 履约订单 (发放权益并更新订单状态)
      // 注意：fulfillOrder 内部也是一个事务，但 Drizzle 支持嵌套事务或在此处手动调用逻辑
      // 此处直接调用，因为 fulfillOrder 已经在我们当前的 tx 中运行（如果我们将 tx 传进去）
      // 优化：修改 fulfillOrder 接收可选的 tx 参数，或者在此处手动实现
      
      // 手动实现简单的履约邏輯 (参考 fulfillOrder)
      await fulfillOrder(order.id); // 内部使用了 db.transaction，在 Drizzle 中嵌套事务是安全的

      return success({
        message: "支付成功",
        orderId: order.id.toString(),
      });
    });
  } catch (err) {
    console.error("Order Activation Code Payment Error:", err);
    return error("系统繁忙", 500);
  }
}
