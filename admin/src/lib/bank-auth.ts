import { db } from "./db";
import { userBankEntitlements } from "./schema";
import { and, eq, gte, or, isNull } from "drizzle-orm";
import { error } from "./api-utils";
import { NextResponse } from "next/server";

export async function checkEntitlement(
  userId: bigint,
  bankId: bigint
): Promise<{ hasAccess: boolean; error?: NextResponse }> {
  const [entitlement] = await db
    .select()
    .from(userBankEntitlements)
    .where(
      and(
        eq(userBankEntitlements.userId, userId),
        eq(userBankEntitlements.bankId, bankId),
        eq(userBankEntitlements.status, "active"),
        or(
          isNull(userBankEntitlements.expiresAt),
          gte(userBankEntitlements.expiresAt, new Date())
        )
      )
    );

  if (!entitlement) {
    return {
      hasAccess: false,
      error: error("您还没有开通该题库或题库已过期", 403, 40301),
    };
  }

  return { hasAccess: true };
}
