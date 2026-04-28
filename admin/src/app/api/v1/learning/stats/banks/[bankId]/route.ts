import { NextRequest } from "next/server";
import { authenticateUser } from "@/lib/user-auth";
import { success, error } from "@/lib/api-utils";
import { getBankStats } from "@/lib/learning-stats";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bankId: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { bankId } = await params;
  if (!bankId) return error("题库ID缺失", 400);

  const stats = await getBankStats(auth.userId, BigInt(bankId));

  return success(stats);
}
