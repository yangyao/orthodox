import { db } from "./db";
import {
  orders,
  orderItems,
  userBankEntitlements,
  catalogProducts,
  walletAccounts,
  walletLedgerEntries,
  paymentTransactions,
} from "./schema";
import { eq } from "drizzle-orm";

export async function fulfillOrder(orderId: bigint, paymentTxnId?: bigint) {
  return await db.transaction(async (tx) => {
    const order = await tx.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) throw new Error(`Order ${orderId} not found`);
    if (order.status === "paid") return;

    if (order.orderType === "recharge") {
      // 充值订单：入账到钱包
      const account = await tx.query.walletAccounts.findFirst({
        where: eq(walletAccounts.userId, order.userId),
      });

      if (!account) throw new Error(`Wallet account not found for user ${order.userId}`);

      const balanceAfterFen = account.balanceFen + order.payAmountFen;

      await tx.update(walletAccounts)
        .set({ balanceFen: balanceAfterFen, updatedAt: new Date() })
        .where(eq(walletAccounts.id, account.id));

      await tx.insert(walletLedgerEntries).values({
        userId: order.userId,
        entryType: "recharge",
        direction: "in",
        amountFen: order.payAmountFen,
        balanceAfterFen,
        orderId: order.id,
        paymentTxnId: paymentTxnId ?? null,
        remark: "钱包充值",
      });
    } else {
      // 商品订单：发放权益
      const items = await tx.query.orderItems.findMany({
        where: eq(orderItems.orderId, orderId),
      });

      for (const item of items) {
        const product = await tx.query.catalogProducts.findFirst({
          where: eq(catalogProducts.id, item.productId),
        });

        if (!product) continue;

        if (product.productType === "bank") {
          const expiresAt = item.snapshot.validityDays
            ? new Date(Date.now() + item.snapshot.validityDays * 24 * 60 * 60 * 1000)
            : null;

          await tx.insert(userBankEntitlements).values({
            userId: order.userId,
            bankId: product.refId,
            status: "active",
            expiresAt: expiresAt,
          }).onConflictDoUpdate({
            target: [userBankEntitlements.userId, userBankEntitlements.bankId],
            set: {
              status: "active",
              expiresAt: expiresAt,
              updatedAt: new Date(),
            },
          });
        } else if (product.productType === "material") {
          console.log(`Fulfilling material pack ${product.refId} for user ${order.userId}`);
        }
      }
    }

    // 更新订单状态
    await tx.update(orders)
      .set({ status: "paid", paidAt: new Date() })
      .where(eq(orders.id, orderId));
  });
}
