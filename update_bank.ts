import { db } from "./admin/src/lib/db";
import { questionBanks } from "./admin/src/lib/schema";
import { eq } from "drizzle-orm";

async function makeRecommended() {
  await db.update(questionBanks)
    .set({ isRecommended: true })
    .where(eq(questionBanks.id, BigInt(1)));
  console.log("Bank 1 is now recommended");
  process.exit(0);
}

makeRecommended().catch(err => {
  console.error(err);
  process.exit(1);
});
