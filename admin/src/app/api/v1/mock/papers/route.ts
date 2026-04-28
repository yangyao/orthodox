import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mockPapers } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { success, error, parsePagination, paginate } from "@/lib/api-utils";
import { sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { page, pageSize, offset } = parsePagination(request.nextUrl.searchParams);
  const bankId = request.nextUrl.searchParams.get("bankId");

  if (!bankId) return error("Missing bankId", 400);

  const papers = await db
    .select()
    .from(mockPapers)
    .where(
      and(
        eq(mockPapers.bankId, BigInt(bankId)),
        eq(mockPapers.status, "published")
      )
    )
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(mockPapers)
    .where(
      and(
        eq(mockPapers.bankId, BigInt(bankId)),
        eq(mockPapers.status, "published")
      )
    );

  return paginate(
    papers.map(p => ({
      ...p,
      id: String(p.id),
      bankId: String(p.bankId),
    })),
    page,
    pageSize,
    Number(count)
  );
}
