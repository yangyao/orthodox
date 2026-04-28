import { NextRequest } from "next/server";
import { authenticateUser } from "@/lib/user-auth";
import { success } from "@/lib/api-utils";
import { getLearningStatsOverview } from "@/lib/learning-stats";

export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const stats = await getLearningStatsOverview(auth.userId);

  return success(stats);
}
