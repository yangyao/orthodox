import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { userBankEntitlements } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { success, error } from "@/lib/api-utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; bankId: string }> }
) {
  const { userId, bankId } = await params;
  const userIdBI = BigInt(userId);
  const bankIdBI = BigInt(bankId);

  const result = await db
    .delete(userBankEntitlements)
    .where(
      and(
        eq(userBankEntitlements.userId, userIdBI),
        eq(userBankEntitlements.bankId, bankIdBI)
      )
    )
    .returning();

  if (result.length === 0) {
    return error("Entitlement not found", 404);
  }

  return success({ message: "Entitlement revoked" });
}
