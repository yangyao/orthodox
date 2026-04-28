import { NextRequest } from "next/server";
import { authenticateUser } from "@/lib/user-auth";
import { success, error } from "@/lib/api-utils";
import { ensureWallet, RECHARGE_OPTIONS } from "@/lib/wallet-utils";
import { db } from "@/lib/db";
import { walletLedgerEntries } from "@/lib/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const account = await ensureWallet(auth.userId);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(walletLedgerEntries)
    .where(eq(walletLedgerEntries.userId, auth.userId));

  return success({
    balanceFen: account.balanceFen,
    balanceDisplay: (account.balanceFen / 100).toFixed(2),
    rechargeOptions: RECHARGE_OPTIONS,
    ledgerEntryCount: count,
  });
}
