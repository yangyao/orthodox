import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { success, error, notFound } from "@/lib/api-utils";
import { authenticateUser } from "@/lib/user-auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { orderId } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, BigInt(orderId)));

  if (!order || order.userId !== auth.userId) return notFound("订单不存在");

  if (order.status !== "pending") return error("订单状态不允许取消", 400);

  await db
    .update(orders)
    .set({ status: "cancelled", cancelledAt: new Date() })
    .where(eq(orders.id, order.id));

  return success({ orderId: order.id, status: "cancelled" });
}
