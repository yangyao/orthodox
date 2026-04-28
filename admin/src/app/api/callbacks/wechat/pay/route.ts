import { NextRequest, NextResponse } from "next/server";
import { getWeChatPayInstance } from "@/lib/wechat-pay";
import { db } from "@/lib/db";
import { paymentTransactions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { fulfillOrder } from "@/lib/fulfillment";

export async function POST(request: NextRequest) {
  const wechatPay = getWeChatPayInstance();
  const bodyText = await request.text();
  
  const headers = {
    timestamp: request.headers.get("wechatpay-timestamp") || "",
    nonce: request.headers.get("wechatpay-nonce") || "",
    signature: request.headers.get("wechatpay-signature") || "",
    serial: request.headers.get("wechatpay-serial") || "",
  };

  // 1. 验证签名 (需要微信支付公钥，通常需要先从 API 获取并缓存)
  // 注意：此处假设 WECHAT_PLATFORM_PUBLIC_KEY 已在环境变量中
  const publicKey = process.env.WECHAT_PLATFORM_PUBLIC_KEY?.replace(/\\n/g, "\n");
  
  if (!publicKey) {
    console.error("Missing WECHAT_PLATFORM_PUBLIC_KEY");
    return NextResponse.json({ code: "FAIL", message: "Internal Error" }, { status: 500 });
  }

  const isValid = wechatPay.verifySignature({
    ...headers,
    body: bodyText,
  }, publicKey);

  if (!isValid) {
    console.error("Invalid WeChat Pay Webhook Signature");
    return NextResponse.json({ code: "FAIL", message: "Sign Error" }, { status: 401 });
  }

  // 2. 解密资源
  try {
    const { resource } = JSON.parse(bodyText);
    const decryptData = wechatPay.decryptResource<{
      out_trade_no: string;
      transaction_id: string;
      trade_state: string;
      success_time: string;
      [key: string]: any;
    }>({
      ciphertext: resource.ciphertext,
      nonce: resource.nonce,
      associatedData: resource.associated_data,
    });

    const { out_trade_no, transaction_id, trade_state } = decryptData;

    // 3. 处理支付成功
    if (trade_state === "SUCCESS") {
      const txn = await db.query.paymentTransactions.findFirst({
        where: eq(paymentTransactions.paymentNo, out_trade_no),
      });

      if (txn && txn.status !== "success") {
        await db.transaction(async (tx) => {
          // 更新交易状态
          await tx.update(paymentTransactions)
            .set({
              status: "success",
              providerTradeNo: transaction_id,
              providerPayload: decryptData,
              paidAt: new Date(decryptData.success_time),
            })
            .where(eq(paymentTransactions.id, txn.id));

          // 触发履约
          await fulfillOrder(txn.orderId);
        });
      }
    }

    return NextResponse.json({ code: "SUCCESS", message: "OK" });
  } catch (err) {
    console.error("WeChat Pay Webhook Decrypt/Process Error:", err);
    return NextResponse.json({ code: "FAIL", message: "Process Error" }, { status: 500 });
  }
}
