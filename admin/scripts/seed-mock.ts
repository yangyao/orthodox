import { db } from "../src/lib/db";
import { questionBanks, questions, mockPapers, mockPaperQuestions } from "../src/lib/schema";
import { eq } from "drizzle-orm";

async function main() {
  // 1. Get a bank
  const [bank] = await db.select().from(questionBanks).limit(1);
  if (!bank) {
    console.error("No bank found");
    return;
  }

  // 2. Get some questions
  const bankQuestions = await db.select().from(questions).where(eq(questions.bankId, bank.id)).limit(5);
  if (bankQuestions.length === 0) {
    console.error("No questions found for bank", bank.id);
    return;
  }

  // 3. Create a mock paper
  const [paper] = await db.insert(mockPapers).values({
    bankId: bank.id,
    title: "Test Mock Paper 1",
    durationMinutes: 60,
    totalQuestions: bankQuestions.length,
    status: "published",
  }).returning();

  console.log("Created paper:", paper.id);

  // 4. Add questions to paper
  for (let i = 0; i < bankQuestions.length; i++) {
    await db.insert(mockPaperQuestions).values({
      paperId: paper.id,
      questionId: bankQuestions[i].id,
      sortOrder: i,
      score: "2.00",
    });
  }

  console.log("Added", bankQuestions.length, "questions to paper");
  process.exit(0);
}

main().catch(console.error);
