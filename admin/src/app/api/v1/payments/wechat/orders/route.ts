import { NextRequest } from "next/server";
import { authenticateUser } from "@/lib/user-auth";
import { error, success } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { orders, paymentTransactions, users } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { getWeChatPayInstance } from "@/lib/wechat-pay";
import crypto from "node:crypto";

export async function POST(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { userId } = auth;
  const body = await request.json();
  const { orderId } = body;

  if (!orderId) {
    return error("参数错误", 400);
  }

  // 1. 获取订单并验证权限
  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, BigInt(orderId)), eq(orders.userId, userId)),
  });

  if (!order) {
    return error("订单不存在", 404);
  }

  if (order.status !== "pending") {
    return error("订单状态异常", 400);
  }

  // 2. 获取用户 OpenID (WeChat Pay JSAPI 需要)
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user || !user.openid) {
    return error("用户未绑定微信", 400);
  }

  // 3. 调用微信支付下单接口 (JSAPI)
  const wechatPay = getWeChatPayInstance();
  const outTradeNo = `PAY-${order.orderNo}-${crypto.randomBytes(4).toString("hex")}`;
  
  const paymentBody = {
    appid: process.env.WECHAT_APPID,
    mchid: process.env.WECHAT_MCH_ID,
    description: `订单支付-${order.orderNo}`,
    out_trade_no: outTradeNo,
    notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/callbacks/wechat/pay`,
    amount: {
      total: order.payAmountFen,
      currency: "CNY",
    },
    payer: {
      openid: user.openid,
    },
  };

  try {
    const nonce = crypto.randomBytes(16).toString("hex");
    const timestamp = Math.floor(Date.now() / 1000);
    const authHeader = wechatPay.generateAuthorization(
      "POST",
      "/v3/pay/transactions/jsapi",
      JSON.stringify(paymentBody),
      nonce,
      timestamp
    );

    const response = await fetch("https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(paymentBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("WeChat Pay Order Error:", errorData);
      return error("发起支付失败", 500);
    }

    const { prepay_id } = await response.json();

    // 4. 记录本地支付交易
    await db.insert(paymentTransactions).values({
      orderId: order.id,
      paymentMethod: "wechat",
      paymentNo: outTradeNo,
      amountFen: order.payAmountFen,
      status: "pending",
    });

    // 5. 生成小程序支付参数
    const miniNonce = crypto.randomBytes(16).toString("hex");
    const miniTimestamp = String(Math.floor(Date.now() / 1000));
    const packageStr = `prepay_id=${prepay_id}`;
    
    const paySign = wechatPay.signJSAPI({
      appId: process.env.WECHAT_APPID!,
      timeStamp: miniTimestamp,
      nonceStr: miniNonce,
      package: packageStr,
    });

    return success({
      timeStamp: miniTimestamp,
      nonceStr: miniNonce,
      package: packageStr,
      signType: "RSA",
      paySign: paySign,
    });

  } catch (err) {
    console.error("WeChat Pay Exception:", err);
    return error("系统繁忙", 500);
  }
}
