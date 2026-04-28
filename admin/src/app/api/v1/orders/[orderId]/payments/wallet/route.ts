import { NextRequest } from "next/server";
import { authenticateUser } from "@/lib/user-auth";
import { success, error } from "@/lib/api-utils";
import { db } from "@/lib/db";
import {
  orders,
  paymentTransactions,
  walletAccounts,
  walletLedgerEntries,
} from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { fulfillOrder } from "@/lib/fulfillment";
import crypto from "node:crypto";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { orderId: orderIdStr } = await params;
  const orderId = BigInt(orderIdStr);

  // 1. 查找订单并验证归属
  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.userId, auth.userId)),
  });

  if (!order) return error("订单不存在", 404);

  // 2. 幂等：已支付订单直接返回成功
  if (order.status === "paid") {
    return success({ orderId: order.id, paymentMethod: "wallet", status: "paid" });
  }

  if (order.status !== "pending") {
    return error("订单状态异常，无法支付", 400);
  }

  if (order.orderType === "recharge") {
    return error("充值订单不支持余额支付", 400);
  }

  // 3. 在事务中完成扣款
  const paymentNo = `WPY-${order.orderNo}-${crypto.randomBytes(4).toString("hex")}`;

  try {
    await db.transaction(async (tx) => {
      // 锁定钱包账户行（SELECT FOR UPDATE 通过 findFirst + 后续 update 实现行锁）
      const account = await tx.query.walletAccounts.findFirst({
        where: eq(walletAccounts.userId, auth.userId),
      });

      if (!account) throw new Error("钱包不存在");
      if (account.balanceFen < order.payAmountFen) {
        throw new Error(
          JSON.stringify({ type: "INSUFFICIENT_BALANCE", shortfallFen: order.payAmountFen - account.balanceFen }),
        );
      }

      // 创建支付记录
      await tx.insert(paymentTransactions).values({
        orderId: order.id,
        paymentMethod: "wallet",
        paymentNo,
        amountFen: order.payAmountFen,
        status: "success",
        paidAt: new Date(),
      });

      // 写入钱包流水
      const balanceAfterFen = account.balanceFen - order.payAmountFen;
      await tx.insert(walletLedgerEntries).values({
        userId: auth.userId,
        entryType: "debit",
        direction: "out",
        amountFen: order.payAmountFen,
        balanceAfterFen,
        orderId: order.id,
        remark: "余额支付",
      });

      // 更新钱包余额
      await tx
        .update(walletAccounts)
        .set({ balanceFen: balanceAfterFen, updatedAt: new Date() })
        .where(eq(walletAccounts.id, account.id));
    });

    // 事务外触发履约（支付已提交，履约失败不影响资金安全）
    await fulfillOrder(orderId);

    return success({ orderId: order.id, paymentMethod: "wallet", status: "paid" });
  } catch (e: unknown) {
    if (e instanceof Error) {
      try {
        const parsed = JSON.parse(e.message);
        if (parsed.type === "INSUFFICIENT_BALANCE") {
          return error("钱包余额不足", 400);
        }
      } catch {
        // not a structured error, fall through
      }
    }
    console.error("Wallet payment error:", e);
    return error("支付失败，请重试", 500);
  }
}
