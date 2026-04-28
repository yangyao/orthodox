import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { bankCategories } from "@/lib/schema";
import { asc } from "drizzle-orm";
import { success, error, validate } from "@/lib/api-utils";
import { z } from "zod";

const createSchema = z.object({
  code: z.string().min(1).max(32),
  name: z.string().min(1).max(64),
  sortOrder: z.number().int().default(0),
  isVisible: z.boolean().default(true),
});

export async function GET() {
  const rows = await db.select().from(bankCategories).orderBy(asc(bankCategories.sortOrder));
  return success(rows);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = validate(createSchema, body);
  if ("error" in result) return result.error;

  try {
    const [created] = await db.insert(bankCategories).values(result.data).returning();
    return success(created, 201);
  } catch (e: unknown) {
    if (e instanceof Error && "code" in e && (e as { code: string }).code === "23505") {
      return error("分类编码已存在", 409);
    }
    throw e;
  }
}
