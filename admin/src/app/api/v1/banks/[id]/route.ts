import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { questionBanks, userBankEntitlements, bankCategories } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { success, notFound } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser(request);
  const userId = "userId" in auth ? auth.userId : null;

  const { id } = await params;
  const bankId = BigInt(id);

  const [bank] = await db
    .select({
      id: questionBanks.id,
      categoryId: questionBanks.categoryId,
      name: questionBanks.name,
      subtitle: questionBanks.subtitle,
      coverUrl: questionBanks.coverUrl,
      description: questionBanks.description,
      saleType: questionBanks.saleType,
      categoryName: bankCategories.name,
      isOpened: userId 
        ? sql<boolean>`EXISTS (
            SELECT 1 FROM ${userBankEntitlements} 
            WHERE ${userBankEntitlements.userId} = ${userId} 
            AND ${userBankEntitlements.bankId} = ${questionBanks.id}
            AND ${userBankEntitlements.status} = 'active'
            AND (${userBankEntitlements.expiresAt} IS NULL OR ${userBankEntitlements.expiresAt} >= NOW())
          )`
        : sql<boolean>`false`,
    })
    .from(questionBanks)
    .leftJoin(bankCategories, eq(questionBanks.categoryId, bankCategories.id))
    .where(eq(questionBanks.id, bankId));

  if (!bank) return notFound("题库不存在");

  return success(bank);
}
