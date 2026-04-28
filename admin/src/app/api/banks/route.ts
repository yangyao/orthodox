import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { questionBanks, userBankEntitlements, bankCategories } from "@/lib/schema";
import { eq, and, or, isNull, gte, sql, desc } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { success, parsePagination, paginate } from "@/lib/api-utils";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(request: NextRequest) {
  console.log("API Hit: /api/v1/banks");
  // const auth = await authenticateUser(request);
  // const userId = "userId" in auth ? auth.userId : null;
  const userId = null;

  const { page, pageSize, offset } = parsePagination(request.nextUrl.searchParams);
  const categoryId = request.nextUrl.searchParams.get("categoryId");

  const conditions = [eq(questionBanks.status, "active")];
  if (categoryId) conditions.push(eq(questionBanks.categoryId, BigInt(categoryId)));

  const where = and(...conditions);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(questionBanks)
    .where(where);

  const query = db
    .select({
      id: questionBanks.id,
      categoryId: questionBanks.categoryId,
      name: questionBanks.name,
      subtitle: questionBanks.subtitle,
      coverUrl: questionBanks.coverUrl,
      saleType: questionBanks.saleType,
      isRecommended: questionBanks.isRecommended,
      categoryName: bankCategories.name,
      // Check if opened
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
    .where(where)
    .orderBy(desc(questionBanks.isRecommended), desc(questionBanks.sortOrder), desc(questionBanks.createdAt))
    .limit(pageSize)
    .offset(offset);

  const rows = await query;

  return paginate(rows, page, pageSize, Number(count));
}
