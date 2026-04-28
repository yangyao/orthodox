import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { wrongQuestions } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { success, error } from "@/lib/api-utils";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const mistakeId = BigInt(id);

  const result = await db
    .delete(wrongQuestions)
    .where(
      and(
        eq(wrongQuestions.id, mistakeId),
        eq(wrongQuestions.userId, auth.userId)
      )
    )
    .returning();

  if (result.length === 0) {
    return error("记录不存在或无权操作", 404);
  }

  return success({ message: "删除成功" });
}
