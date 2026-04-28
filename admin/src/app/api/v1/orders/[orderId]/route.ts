import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { success, notFound } from "@/lib/api-utils";
import { authenticateUser } from "@/lib/user-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { orderId } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, BigInt(orderId)));

  if (!order || order.userId !== auth.userId) return notFound("订单不存在");

  // Lazy close expired
  if (order.status === "pending" && order.expiredAt && new Date(order.expiredAt) < new Date()) {
    const [updated] = await db
      .update(orders)
      .set({ status: "closed", cancelledAt: new Date() })
      .where(eq(orders.id, order.id))
      .returning();
    Object.assign(order, updated);
  }

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

  return success({ ...order, items });
}
