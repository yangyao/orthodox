import "dotenv/config";
import { db } from "../src/lib/db";
import { practiceSessions, practiceAnswers, questions, users, questionBanks } from "../src/lib/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🚀 Starting practice logic test...");

  // 1. Get a test user
  let [user] = await db.select().from(users).limit(1);
  if (!user) {
    console.log("📝 No user found, creating test user...");
    [user] = await db.insert(users).values({ openid: "test-user-openid" }).returning();
  }
  console.log(`✅ Using test user: ${user.openid}`);

  // 2. Get a test question bank
  const [bank] = await db.select().from(questionBanks).limit(1);
  if (!bank) {
    console.error("❌ No question bank found in DB.");
    return;
  }
  console.log(`✅ Found test bank: ${bank.name}`);

  // 3. Create a session
  console.log("📝 Creating practice session...");
  const [session] = await db.insert(practiceSessions).values({
    userId: user.id,
    bankId: bank.id,
    status: "started",
    totalQuestions: 10,
  }).returning();
  console.log(`✅ Session created: ${session.id}`);

  // 4. Get a question from this bank
  const [question] = await db.select().from(questions).where(eq(questions.bankId, bank.id)).limit(1);
  if (!question) {
    console.warn("⚠️ No questions found for this bank. Skipping answer submission test.");
  } else {
    console.log(`📝 Submitting answer for question: ${question.id}`);
    const isCorrect = true; // Mock correctness
    await db.insert(practiceAnswers).values({
      sessionId: session.id,
      questionId: question.id,
      userAnswer: question.correctAnswer,
      isCorrect,
    });
    console.log("✅ Answer recorded.");

    // Update session
    await db.update(practiceSessions)
      .set({
        answeredCount: 1,
        correctCount: 1,
      })
      .where(eq(practiceSessions.id, session.id));
    console.log("✅ Session counts updated.");
  }

  // 5. Cleanup (optional)
  // console.log("🧹 Cleaning up test data...");
  // await db.delete(practiceSessions).where(eq(practiceSessions.id, session.id));
  
  console.log("🎉 Test completed successfully!");
}

main().catch(console.error);
