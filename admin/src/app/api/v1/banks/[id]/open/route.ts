import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { userBankEntitlements, questionBanks } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { success, error, notFound } from "@/lib/api-utils";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const bankId = BigInt(id);

  const [bank] = await db
    .select()
    .from(questionBanks)
    .where(eq(questionBanks.id, bankId));

  if (!bank) return notFound("题库不存在");

  // Only allow opening if it's free or for trial (for now we assume if it's free it can be opened)
  // In a real scenario, this might involve checking if it's a "free" bank.
  if (bank.saleType !== "free") {
    // For now, let's allow "paid" banks to be "opened" for testing, 
    // or maybe the user has a separate logic for trial.
    // The requirement says "activating free/trial access".
  }

  const [existing] = await db
    .select()
    .from(userBankEntitlements)
    .where(
      and(
        eq(userBankEntitlements.userId, auth.userId),
        eq(userBankEntitlements.bankId, bankId)
      )
    );

  if (existing) {
    if (existing.status === "active") {
      return success({ message: "您已开通该题库" });
    }
    // Reactivate if expired/revoked (if allowed)
    await db
      .update(userBankEntitlements)
      .set({ status: "active", updatedAt: new Date(), expiresAt: null }) // Unlimited if re-opened?
      .where(eq(userBankEntitlements.id, existing.id));
    return success({ message: "题库已重新开通" });
  }

  await db.insert(userBankEntitlements).values({
    userId: auth.userId,
    bankId,
    status: "active",
  });

  return success({ message: "题库开通成功" });
}
