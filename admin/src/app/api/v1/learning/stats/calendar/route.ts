import { NextRequest } from "next/server";
import { authenticateUser } from "@/lib/user-auth";
import { success } from "@/lib/api-utils";
import { getDailyStats } from "@/lib/learning-stats";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subDays, format, addMonths, subMonths } from "date-fns";

export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const searchParams = request.nextUrl.searchParams;
  const granularity = searchParams.get("granularity") || "day";
  const anchorDateStr = searchParams.get("anchorDate");
  const anchorDate = anchorDateStr ? new Date(anchorDateStr) : new Date();

  let startDate: Date;
  let endDate: Date;

  if (granularity === "day") {
    // Show last 7 days for day granularity trend
    startDate = subDays(anchorDate, 6);
    endDate = anchorDate;
  } else if (granularity === "week") {
    // Show last 4 weeks
    startDate = startOfWeek(subDays(anchorDate, 21));
    endDate = endOfWeek(anchorDate);
  } else if (granularity === "month") {
    // Show last 6 months
    startDate = startOfMonth(subMonths(anchorDate, 5));
    endDate = endOfMonth(anchorDate);
  } else {
    startDate = startOfMonth(anchorDate);
    endDate = endOfMonth(anchorDate);
  }

  const dailyStats = await getDailyStats(auth.userId, startDate, endDate);

  // Calendar data (always for the month of anchorDate)
  const calStart = startOfMonth(anchorDate);
  const calEnd = endOfMonth(anchorDate);
  const monthStats = await getDailyStats(auth.userId, calStart, calEnd);

  // Format response
  // 1. Series (trends)
  // 2. Calendar (day-by-day in the month)

  return success({
    series: dailyStats,
    calendar: monthStats,
    meta: {
      granularity,
      anchorDate: format(anchorDate, "yyyy-MM-dd"),
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd"),
    }
  });
}
