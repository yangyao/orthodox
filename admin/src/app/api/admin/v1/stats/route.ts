import { db } from "@/lib/db";
import { orders, questionBanks, questions, users } from "@/lib/schema";
import { sql } from "drizzle-orm";
import { success } from "@/lib/api-utils";

export async function GET() {
  const [banks] = await db
    .select({ count: sql<number>`count(*)` })
    .from(questionBanks);

  const [q] = await db
    .select({ count: sql<number>`count(*)` })
    .from(questions);

  const [u] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users);

  const [o] = await db
    .select({ count: sql<number>`count(*)` })
    .from(orders);

  return success({
    bankCount: Number(banks.count),
    questionCount: Number(q.count),
    userCount: Number(u.count),
    orderCount: Number(o.count),
  });
}
