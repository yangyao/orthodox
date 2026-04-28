import { success, validate } from "@/lib/api-utils";
import { z } from "zod";
import { getLearningStats, type DashboardRange } from "@/lib/dashboard-stats";

const querySchema = z.object({
  range: z.enum(["7d", "30d"]).default("7d"),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = validate(querySchema, Object.fromEntries(searchParams));
  if ("error" in result) return result.error;

  const range = result.data.range as DashboardRange;
  const data = await getLearningStats(range);

  return success({
    range,
    cards: data.cards,
    trends: data.trends,
  });
}
