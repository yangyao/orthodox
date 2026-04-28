import { success, validate } from "@/lib/api-utils";
import { z } from "zod";
import { getProductStats, type DashboardRange } from "@/lib/dashboard-stats";

const querySchema = z.object({
  range: z.enum(["7d", "30d"]).default("7d"),
  productType: z.enum(["bank", "material"]).optional(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const result = validate(querySchema, Object.fromEntries(searchParams));
  if ("error" in result) return result.error;

  const { range, productType } = result.data;
  const data = await getProductStats(range as DashboardRange, productType);

  return success({
    range,
    productRanking: data.productRanking,
    rechargeAmountFen: data.rechargeAmountFen,
    paymentMethods: data.paymentMethods,
  });
}
