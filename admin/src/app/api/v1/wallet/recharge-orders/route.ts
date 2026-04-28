import { NextRequest } from "next/server";
import { authenticateUser } from "@/lib/user-auth";
import { success, error, validate } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { RECHARGE_OPTIONS, type RechargeOptionCode } from "@/lib/wallet-utils";
import { z } from "zod";

function generateOrderNo(): string {
  const now = new Date();
  const pad = (n: number, w: number) => String(n).padStart(w, "0");
  const ts = `${now.getFullYear()}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}${pad(now.getHours(), 2)}${pad(now.getMinutes(), 2)}${pad(now.getSeconds(), 2)}`;
  const rand = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
  return `RCH-${ts}-${rand}`;
}

const schema = z.object({
  optionCode: z.enum(
    RECHARGE_OPTIONS.map((o) => o.optionCode) as [RechargeOptionCode, ...RechargeOptionCode[]],
    { message: "请选择有效的充值档位" },
  ),
});

export async function POST(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const result = validate(schema, body);
  if ("error" in result) return result.error;

  const option = RECHARGE_OPTIONS.find((o) => o.optionCode === result.data.optionCode);
  if (!option) return error("无效的充值档位", 400);

  const orderNo = generateOrderNo();
  const expiredAt = new Date(Date.now() + 30 * 60 * 1000);

  try {
    const [order] = await db
      .insert(orders)
      .values({
        orderNo,
        userId: auth.userId,
        orderType: "recharge",
        totalAmountFen: option.amountFen,
        payAmountFen: option.amountFen,
        expiredAt,
      })
      .returning();

    return success({
      orderId: order.id,
      orderNo: order.orderNo,
      payAmountFen: order.payAmountFen,
      rechargeOption: option,
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.message?.includes("unique") && e.message?.includes("order_no")) {
      return error("订单号冲突，请重试", 500);
    }
    throw e;
  }
}
