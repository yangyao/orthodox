import { NextRequest } from "next/server";
import { authenticateUser } from "@/lib/user-auth";
import { error, success } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { orders, paymentTransactions } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { getWeChatPayInstance } from "@/lib/wechat-pay";
import { fulfillOrder } from "@/lib/fulfillment";
import crypto from "node:crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { userId } = auth;
  const { orderId } = await params;

  // 1. 获取最近的一次支付尝试
  const txn = await db.query.paymentTransactions.findFirst({
    where: eq(paymentTransactions.orderId, BigInt(orderId)),
    orderBy: [desc(paymentTransactions.createdAt)],
  });

  if (!txn || txn.paymentMethod !== "wechat") {
    return error("未找到相关支付记录", 404);
  }

  if (txn.status === "success") {
    return success({ status: "paid" });
  }

  // 2. 向微信支付查询状态
  const wechatPay = getWeChatPayInstance();
  const url = `/v3/pay/transactions/out-trade-no/${txn.paymentNo}?mchid=${process.env.WECHAT_MCH_ID}`;

  try {
    const nonce = crypto.randomBytes(16).toString("hex");
    const timestamp = Math.floor(Date.now() / 1000);
    const authHeader = wechatPay.generateAuthorization(
      "GET",
      url,
      "",
      nonce,
      timestamp
    );

    const response = await fetch(`https://api.mch.weixin.qq.com${url}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      return error("查询支付状态失败", 500);
    }

    const data = await response.json();
    const { trade_state, transaction_id, success_time } = data;

    // 3. 如果成功，更新本地状态并履约
    if (trade_state === "SUCCESS") {
      await db.transaction(async (tx) => {
        await tx.update(paymentTransactions)
          .set({
            status: "success",
            providerTradeNo: transaction_id,
            providerPayload: data,
            paidAt: success_time ? new Date(success_time) : new Date(),
          })
          .where(eq(paymentTransactions.id, txn.id));

        await fulfillOrder(txn.orderId);
      });

      return success({ status: "paid" });
    }

    return success({ status: "pending", trade_state });

  } catch (err) {
    console.error("WeChat Pay Query Exception:", err);
    return error("系统繁忙", 500);
  }
}
