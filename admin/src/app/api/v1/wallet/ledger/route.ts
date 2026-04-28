import { NextRequest } from "next/server";
import { authenticateUser } from "@/lib/user-auth";
import { success, parsePagination } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { walletLedgerEntries } from "@/lib/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { searchParams } = new URL(request.url);
  const { page, pageSize, offset } = parsePagination(searchParams);

  const where = eq(walletLedgerEntries.userId, auth.userId);

  const items = await db
    .select()
    .from(walletLedgerEntries)
    .where(where)
    .orderBy(desc(walletLedgerEntries.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(walletLedgerEntries)
    .where(where);

  return success({ items, page, pageSize, total: count });
}
