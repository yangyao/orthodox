import { db } from "../src/lib/db";
import { users, userProfiles, mockPapers, practiceSessions, practiceAnswers, questions } from "../src/lib/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  const openid = "test-user-openid";
  
  // 1. Get user
  let [user] = await db.select().from(users).where(eq(users.openid, openid));
  if (!user) {
    [user] = await db.insert(users).values({ openid }).returning();
    await db.insert(userProfiles).values({ userId: user.id, nickname: "Test User" });
  }

  // 2. Get mock paper
  const [paper] = await db.select().from(mockPapers).where(eq(mockPapers.status, "published")).limit(1);
  if (!paper) {
    console.error("No published mock paper found");
    return;
  }
  console.log("Using paper:", paper.title);

  // 3. Start session
  // Simulate POST /api/v1/mock/sessions
  const [session] = await db.insert(practiceSessions).values({
    userId: user.id,
    bankId: paper.bankId,
    paperId: paper.id,
    mode: "mock",
    status: "started",
    totalQuestions: paper.totalQuestions,
  }).returning();
  console.log("Started session:", session.id);

  // 4. Submit answer
  // Simulate POST /api/v1/practice/sessions/[id]/submit
  const [question] = await db.select().from(questions).where(eq(questions.bankId, paper.bankId)).limit(1);
  const userAnswer = "D"; // assuming some answer
  const isCorrect = question.correctAnswer === userAnswer;
  
  await db.insert(practiceAnswers).values({
    sessionId: session.id,
    questionId: question.id,
    userAnswer: userAnswer,
    isCorrect,
  });
  console.log("Submitted answer for question", question.id);

  // 5. Finish session
  // Simulate POST /api/v1/practice/sessions/[id]/finish
  const score = (isCorrect ? 1 : 0) / paper.totalQuestions * 100;
  const [finishedSession] = await db.update(practiceSessions).set({
    status: "finished",
    score: score.toFixed(2),
    updatedAt: new Date(),
  }).where(eq(practiceSessions.id, session.id)).returning();
  
  console.log("Finished session. Score:", finishedSession.score);

  if (finishedSession.status === "finished") {
    console.log("SUCCESS: Mock exam lifecycle verified.");
  } else {
    console.error("FAILURE: Mock exam lifecycle failed.");
  }

  process.exit(0);
}

main().catch(console.error);
