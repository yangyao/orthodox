import { db } from "./admin/src/lib/db";
import { questionBanks } from "./admin/src/lib/schema";

async function checkBanks() {
  const allBanks = await db.select().from(questionBanks);
  console.log("Total banks in DB:", allBanks.length);
  allBanks.forEach(b => {
    console.log(`- ID: ${b.id}, Name: ${b.name}, Status: ${b.status}, isRecommended: ${b.isRecommended}`);
  });
  process.exit(0);
}

checkBanks().catch(err => {
  console.error(err);
  process.exit(1);
});
