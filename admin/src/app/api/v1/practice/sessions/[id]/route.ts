import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { practiceSessions, practiceAnswers } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { success, error } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const sessionId = BigInt(id);

  const [session] = await db
    .select()
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.id, sessionId),
        eq(practiceSessions.userId, auth.userId)
      )
    );

  if (!session) return error("会话不存在", 404);

  const answers = await db
    .select()
    .from(practiceAnswers)
    .where(eq(practiceAnswers.sessionId, sessionId));

  return success({
    ...session,
    id: String(session.id),
    userId: String(session.userId),
    bankId: String(session.bankId),
    sectionId: session.sectionId ? String(session.sectionId) : null,
    answers: answers.map((a) => ({
      ...a,
      id: String(a.id),
      sessionId: String(a.sessionId),
      questionId: String(a.questionId),
    })),
  });
}
