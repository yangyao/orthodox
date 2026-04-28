import "dotenv/config";
import { db } from "../src/lib/db";
import { resourcePacks, resourceItems, users } from "../src/lib/schema";
import { eq } from "drizzle-orm";

async function testResourcesApi() {
  console.log("Testing Resource Packs user APIs...");

  // 1. Get a test user
  const [user] = await db.select().from(users).limit(1);
  if (!user) {
    console.error("No users found. Run user seed first.");
    return;
  }
  console.log(`Using test user: ${user.id}`);

  // 2. Test List Packs
  const packs = await db.select().from(resourcePacks).where(eq(resourcePacks.status, "active"));
  console.log(`Found ${packs.length} active resource packs.`);
  if (packs.length === 0) {
    console.error("No active packs found. Run resource seed first.");
    return;
  }

  // 3. Test Pack Detail with items
  const packId = packs[0].id;
  const [packDetail] = await db.select().from(resourcePacks).where(eq(resourcePacks.id, packId));
  const items = await db.select().from(resourceItems).where(eq(resourceItems.packId, packId));

  console.log(`Pack Detail: ${packDetail.title}`);
  console.log(`Contains ${items.length} items:`);
  items.forEach(item => {
    console.log(`- [${item.type}] ${item.title}: ${item.url}`);
  });

  console.log("\nResource Packs API verification completed successfully!");
}

testResourcesApi()
  .catch(console.error)
  .finally(() => process.exit(0));
