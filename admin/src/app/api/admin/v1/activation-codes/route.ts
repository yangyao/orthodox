import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { activationCodes, productSkus, users } from "@/lib/schema";
import { eq, and, like, desc, count, sql } from "drizzle-orm";
import { success } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const batchNo = searchParams.get("batchNo");
  const status = searchParams.get("status");
  const code = searchParams.get("code");

  const offset = (page - 1) * pageSize;

  const filters = [];
  if (batchNo) filters.push(eq(activationCodes.batchNo, batchNo));
  if (status) filters.push(eq(activationCodes.status, status));
  if (code) filters.push(like(activationCodes.code, `%${code}%`));

  const whereClause = filters.length > 0 ? and(...filters) : undefined;

  // 1. 获取总数
  const [totalResult] = await db
    .select({ total: count() })
    .from(activationCodes)
    .where(whereClause);

  // 2. 获取列表 (带关联数据)
  const items = await db.query.activationCodes.findMany({
    where: whereClause,
    orderBy: [desc(activationCodes.createdAt)],
    limit: pageSize,
    offset: offset,
    with: {
      // Drizzle relations must be defined for this to work
    }
  });

  // 如果没有定义 relations，手动 join 或单独查询
  // 此处简单起见直接返回列表，后续可优化 relations
  
  return success({
    items,
    total: totalResult.total,
    page,
    pageSize,
  });
}
