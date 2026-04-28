import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mockPapers } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { success, error } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const paperId = BigInt(id);

  const [paper] = await db
    .select()
    .from(mockPapers)
    .where(eq(mockPapers.id, paperId));

  if (!paper) return error("Paper not found", 404);

  return success({
    ...paper,
    id: String(paper.id),
    bankId: String(paper.bankId),
  });
}
