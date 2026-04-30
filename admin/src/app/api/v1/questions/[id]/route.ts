import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { questions } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { success, notFound } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const questionId = BigInt(id);

  const [question] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, questionId));

  if (!question) return notFound("题目不存在");

  return success({
    id: String(question.id),
    bankId: String(question.bankId),
    questionType: question.questionType,
    stem: question.stem,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    difficulty: question.difficulty,
  });
}
