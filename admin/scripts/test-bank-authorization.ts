import "dotenv/config";
import { db } from "../src/lib/db";
import { users, userProfiles, questionBanks, userBankEntitlements, practiceSessions } from "../src/lib/schema";
import { eq, and } from "drizzle-orm";
import { checkEntitlement } from "../src/lib/bank-auth";

async function main() {
  console.log("Starting bank authorization test...");

  // 1. Setup test data
  let [user] = await db.select().from(users).limit(1);
  if (!user) {
    [user] = await db.insert(users).values({
      openid: "test_auth_user",
    }).returning();
    await db.insert(userProfiles).values({ userId: user.id, nickname: "Auth Tester" });
  }
  console.log("Using user:", user.id);

  let [bank] = await db.select().from(questionBanks).limit(1);
  if (!bank) {
    [bank] = await db.insert(questionBanks).values({
      name: "Test Auth Bank",
      code: "TEST_AUTH",
      categoryId: BigInt(1), // Assuming category 1 exists
    }).returning();
  }
  console.log("Using bank:", bank.id);

  // 2. Clean up existing entitlements
  await db.delete(userBankEntitlements).where(
    and(
      eq(userBankEntitlements.userId, user.id),
      eq(userBankEntitlements.bankId, bank.id)
    )
  );

  // 3. Test without entitlement
  console.log("Testing access without entitlement...");
  const result1 = await checkEntitlement(user.id, bank.id);
  if (!result1.hasAccess) {
    console.log("✓ Correctly denied access (status 403)");
  } else {
    console.error("✗ Error: Access should have been denied");
  }

  // 4. Test with entitlement
  console.log("Granting entitlement...");
  await db.insert(userBankEntitlements).values({
    userId: user.id,
    bankId: bank.id,
    status: "active",
  });

  console.log("Testing access with entitlement...");
  const result2 = await checkEntitlement(user.id, bank.id);
  if (result2.hasAccess) {
    console.log("✓ Correctly granted access");
  } else {
    console.error("✗ Error: Access should have been granted");
  }

  // 5. Test with expired entitlement
  console.log("Updating entitlement to expired...");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  await db.update(userBankEntitlements)
    .set({ expiresAt: yesterday })
    .where(
      and(
        eq(userBankEntitlements.userId, user.id),
        eq(userBankEntitlements.bankId, bank.id)
      )
    );

  console.log("Testing access with expired entitlement...");
  const result3 = await checkEntitlement(user.id, bank.id);
  if (!result3.hasAccess) {
    console.log("✓ Correctly denied access (expired)");
  } else {
    console.error("✗ Error: Access should have been denied (expired)");
  }

  // 6. Test with revoked/inactive status
  console.log("Updating entitlement to revoked...");
  await db.update(userBankEntitlements)
    .set({ status: "revoked", expiresAt: null })
    .where(
      and(
        eq(userBankEntitlements.userId, user.id),
        eq(userBankEntitlements.bankId, bank.id)
      )
    );

  console.log("Testing access with revoked entitlement...");
  const result4 = await checkEntitlement(user.id, bank.id);
  if (!result4.hasAccess) {
    console.log("✓ Correctly denied access (revoked)");
  } else {
    console.error("✗ Error: Access should have been denied (revoked)");
  }

  console.log("Bank authorization test completed.");
}

main().catch(console.error).finally(() => process.exit());
