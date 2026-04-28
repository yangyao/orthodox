import { NextRequest } from "next/server";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { paginate, parsePagination } from "@/lib/api-utils";
import { userProfiles, users } from "@/lib/schema";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const { page, pageSize, offset } = parsePagination(searchParams);

  const status = searchParams.get("status");
  const keyword = searchParams.get("keyword");
  const conditions = [];

  if (status) {
    conditions.push(eq(users.status, status));
  }

  if (keyword) {
    conditions.push(
      or(
        ilike(users.openid, `%${keyword}%`),
        ilike(users.mobile, `%${keyword}%`),
        ilike(userProfiles.nickname, `%${keyword}%`)
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const items = await db
    .select({
      id: users.id,
      openid: users.openid,
      mobile: users.mobile,
      status: users.status,
      createdAt: users.createdAt,
      nickname: userProfiles.nickname,
      avatarUrl: userProfiles.avatarUrl,
      province: userProfiles.province,
      city: userProfiles.city,
      lastLoginAt: userProfiles.lastLoginAt,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(where)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset(offset);

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .where(where);

  return paginate(items, page, pageSize, Number(count));
}
