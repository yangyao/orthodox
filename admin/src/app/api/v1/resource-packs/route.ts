import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { resourcePacks } from "@/lib/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { parsePagination, paginate } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { page, pageSize, offset } = parsePagination(request.nextUrl.searchParams);
  const bankId = request.nextUrl.searchParams.get("bankId");

  const whereConditions = [eq(resourcePacks.status, "active")];
  if (bankId) {
    whereConditions.push(eq(resourcePacks.bankId, BigInt(bankId)));
  }

  const results = await db
    .select()
    .from(resourcePacks)
    .where(and(...whereConditions))
    .orderBy(desc(resourcePacks.sortOrder), desc(resourcePacks.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(resourcePacks)
    .where(and(...whereConditions));

  return paginate(
    results.map((rp) => ({
      ...rp,
      id: String(rp.id),
      bankId: rp.bankId ? String(rp.bankId) : null,
    })),
    page,
    pageSize,
    Number(count)
  );
}
