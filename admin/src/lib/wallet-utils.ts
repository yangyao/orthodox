import { db } from "./db";
import { walletAccounts } from "./schema";
import { eq } from "drizzle-orm";

export const RECHARGE_OPTIONS = [
  { optionCode: "coins_6", coins: 6, amountFen: 600, label: "6 币" },
  { optionCode: "coins_30", coins: 30, amountFen: 3000, label: "30 币" },
  { optionCode: "coins_68", coins: 68, amountFen: 6800, label: "68 币" },
  { optionCode: "coins_128", coins: 128, amountFen: 12800, label: "128 币" },
  { optionCode: "coins_328", coins: 328, amountFen: 32800, label: "328 币" },
] as const;

export type RechargeOptionCode = (typeof RECHARGE_OPTIONS)[number]["optionCode"];

export async function ensureWallet(userId: bigint) {
  let account = await db.query.walletAccounts.findFirst({
    where: eq(walletAccounts.userId, userId),
  });
  if (!account) {
    const [created] = await db
      .insert(walletAccounts)
      .values({ userId, balanceFen: 0, frozenFen: 0 })
      .returning();
    account = created;
  }
  return account!;
}
