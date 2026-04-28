import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/schema";
import { eq, and, desc, like, sql } from "drizzle-orm";
import { paginate, parsePagination } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { page, pageSize, offset } = parsePagination(searchParams);

  // Lazy close expired orders
  await db
    .update(orders)
    .set({ status: "closed", cancelledAt: new Date() })
    .where(
      and(
        eq(orders.status, "pending"),
        sql`${orders.expiredAt} < now()`
      )
    );

  const conditions = [];
  const status = searchParams.get("status");
  const orderType = searchParams.get("orderType");
  const userId = searchParams.get("userId");
  const keyword = searchParams.get("keyword");

  if (status && status !== "all") conditions.push(eq(orders.status, status));
  if (orderType) conditions.push(eq(orders.orderType, orderType));
  if (userId) conditions.push(eq(orders.userId, BigInt(userId)));
  if (keyword) conditions.push(like(orders.orderNo, `%${keyword}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const items = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Fetch order items
  const orderIds = items.map((o) => o.id);
  const allItems = orderIds.length > 0
    ? await db.select().from(orderItems).where(sql`${orderItems.orderId} = ANY(${orderIds})`)
    : [];

  const itemsByOrderId = new Map<string, typeof allItems>();
  for (const oi of allItems) {
    const key = String(oi.orderId);
    if (!itemsByOrderId.has(key)) itemsByOrderId.set(key, []);
    itemsByOrderId.get(key)!.push(oi);
  }

  const itemsWithDetails = items.map((o) => ({
    ...o,
    items: itemsByOrderId.get(String(o.id)) ?? [],
  }));

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(where);

  return paginate(itemsWithDetails, page, pageSize, Number(count));
}
