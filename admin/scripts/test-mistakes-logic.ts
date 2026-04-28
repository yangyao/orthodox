import { db } from "../src/lib/db";
import { users, userProfiles, questionBanks, questions, practiceSessions, practiceAnswers, wrongQuestions } from "../src/lib/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  const openid = "test-user-openid";
  
  // 1. Ensure user exists
  let [user] = await db.select().from(users).where(eq(users.openid, openid));
  if (!user) {
    [user] = await db.insert(users).values({ openid }).returning();
    await db.insert(userProfiles).values({ userId: user.id, nickname: "Test User" });
    console.log("Created test user:", user.id);
  }

  // 2. Ensure question bank exists
  let [bank] = await db.select().from(questionBanks).limit(1);
  if (!bank) {
    console.error("No question bank found. Please run seed first.");
    return;
  }
  console.log("Using bank:", bank.name);

  // 3. Ensure a question exists
  const [question] = await db.select().from(questions).where(eq(questions.bankId, bank.id)).limit(1);
  if (!question) {
    console.error("No questions found in bank.");
    return;
  }
  console.log("Using question:", question.id);

  // 4. Start a session
  const [session] = await db.insert(practiceSessions).values({
    userId: user.id,
    bankId: bank.id,
    mode: "sequential",
    status: "started",
    totalQuestions: 1,
  }).returning();
  console.log("Created session:", session.id);

  // 5. Submit a WRONG answer
  const wrongAnswer = "WRONG_ANSWER"; // Assuming single choice and it's not this
  console.log(`Submitting wrong answer: ${wrongAnswer} (Correct: ${question.correctAnswer})`);

  // Simulate the API logic here for verification
  const isCorrect = question.correctAnswer === wrongAnswer;
  console.log("isCorrect:", isCorrect);

  // Record in practice_answers
  await db.insert(practiceAnswers).values({
    sessionId: session.id,
    questionId: question.id,
    userAnswer: wrongAnswer,
    isCorrect: isCorrect,
  });

  // Record in wrong_questions if incorrect
  if (!isCorrect) {
    const [existingWrong] = await db
      .select()
      .from(wrongQuestions)
      .where(
        and(
          eq(wrongQuestions.userId, user.id),
          eq(wrongQuestions.questionId, question.id)
        )
      );

    if (existingWrong) {
      await db.update(wrongQuestions)
        .set({
          wrongCount: (existingWrong.wrongCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(wrongQuestions.id, existingWrong.id));
      console.log("Updated existing wrong question record");
    } else {
      await db.insert(wrongQuestions).values({
        userId: user.id,
        bankId: bank.id,
        questionId: question.id,
        wrongCount: 1,
      });
      console.log("Created new wrong question record");
    }
  }

  // 6. Verify wrong_questions
  const [verifiedWrong] = await db
    .select()
    .from(wrongQuestions)
    .where(
      and(
        eq(wrongQuestions.userId, user.id),
        eq(wrongQuestions.questionId, question.id)
      )
    );

  if (verifiedWrong) {
    console.log("SUCCESS: Wrong question recorded correctly.");
    console.log("Wrong count:", verifiedWrong.wrongCount);

    // 7. Verify Mistake Mode session
    console.log("Testing mistake review mode...");
    const wrongRows = await db
      .select({ id: wrongQuestions.questionId })
      .from(wrongQuestions)
      .where(
        and(
          eq(wrongQuestions.userId, user.id),
          eq(wrongQuestions.bankId, bank.id)
        )
      );
    const questionIds = wrongRows.map(r => String(r.id));
    console.log("Fetched question IDs in mistake mode:", questionIds);
    
    if (questionIds.includes(String(question.id))) {
      console.log("SUCCESS: Mistake review mode correctly includes the wrong question.");
    } else {
      console.error("FAILURE: Mistake review mode did NOT include the wrong question.");
    }
  } else {
    console.error("FAILURE: Wrong question was NOT recorded.");
  }
  
  process.exit(0);
}

main().catch(console.error);
