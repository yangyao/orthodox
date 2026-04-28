import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, catalogProducts, productSkus } from "@/lib/schema";
import { eq, and, desc, like, sql } from "drizzle-orm";
import { success, error, paginate, parsePagination, validate, notFound } from "@/lib/api-utils";
import { authenticateUser } from "@/lib/user-auth";
import { z } from "zod";

function generateOrderNo(): string {
  const now = new Date();
  const pad = (n: number, w: number) => String(n).padStart(w, "0");
  const ts = `${now.getFullYear()}${pad(now.getMonth() + 1, 2)}${pad(now.getDate(), 2)}${pad(now.getHours(), 2)}${pad(now.getMinutes(), 2)}${pad(now.getSeconds(), 2)}`;
  const rand = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
  return `ORD-${ts}-${rand}`;
}

const createSchema = z.object({
  orderType: z.enum(["bank", "material", "recharge"]),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    skuId: z.number().int().positive(),
    quantity: z.number().int().positive().default(1),
  })).min(1),
});

export async function POST(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const result = validate(createSchema, body);
  if ("error" in result) return result.error;

  const { orderType, items } = result.data;

  // Validate all SKUs
  const orderItemRows: {
    productId: bigint;
    skuId: bigint;
    quantity: number;
    unitPriceFen: number;
    totalPriceFen: number;
    snapshot: {
      title: string;
      priceFen: number;
      originalPriceFen: number | null;
      validityDays: number | null;
    };
  }[] = [];

  let totalAmountFen = 0;

  for (const item of items) {
    const [sku] = await db
      .select()
      .from(productSkus)
      .where(eq(productSkus.id, BigInt(item.skuId)));

    if (!sku) return error("SKU 不存在", 400);
    if (sku.productId !== BigInt(item.productId)) return error("SKU 不属于该商品", 400);
    if (sku.status !== "active") return error("SKU 已下架", 400);

    const snapshot = {
      title: sku.title,
      priceFen: sku.priceFen,
      originalPriceFen: sku.originalPriceFen,
      validityDays: sku.validityDays,
    };

    const unitPriceFen = sku.priceFen;
    const totalPriceFen = unitPriceFen * item.quantity;
    totalAmountFen += totalPriceFen;

    orderItemRows.push({
      productId: BigInt(item.productId),
      skuId: sku.id,
      quantity: item.quantity,
      unitPriceFen,
      totalPriceFen,
      snapshot,
    });
  }

  // Generate order no with retry
  let orderNo = generateOrderNo();
  let retries = 0;
  while (retries < 3) {
    try {
      const expiredAt = new Date(Date.now() + 30 * 60 * 1000);

      const [order] = await db.insert(orders).values({
        orderNo,
        userId: auth.userId,
        orderType,
        totalAmountFen,
        payAmountFen: totalAmountFen,
        expiredAt,
      }).returning();

      // Insert order items
      await db.insert(orderItems).values(
        orderItemRows.map((row) => ({
          orderId: order.id,
          productId: row.productId,
          skuId: row.skuId,
          quantity: row.quantity,
          unitPriceFen: row.unitPriceFen,
          totalPriceFen: row.totalPriceFen,
          snapshot: row.snapshot,
        }))
      );

      return success({
        orderId: order.id,
        orderNo: order.orderNo,
        status: order.status,
        payAmountFen: order.payAmountFen,
        expiresAt: order.expiredAt,
      });
    } catch (e: unknown) {
      if (e instanceof Error && e.message?.includes("unique") && e.message?.includes("order_no")) {
        orderNo = generateOrderNo();
        retries++;
        continue;
      }
      throw e;
    }
  }

  return error("订单号生成失败，请重试", 500);
}

export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, pageSize, offset } = parsePagination(searchParams);
  const status = searchParams.get("status");

  // Lazy close expired orders
  await db
    .update(orders)
    .set({ status: "closed", cancelledAt: new Date() })
    .where(
      and(
        eq(orders.userId, auth.userId),
        eq(orders.status, "pending"),
        sql`${orders.expiredAt} < now()`
      )
    );

  const conditions = [eq(orders.userId, auth.userId)];
  if (status && status !== "all") {
    conditions.push(eq(orders.status, status));
  }
  const where = and(...conditions);

  const items = await db
    .select()
    .from(orders)
    .where(where)
    .orderBy(desc(orders.createdAt))
    .limit(pageSize)
    .offset(offset);

  // Fetch order items for each order
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
