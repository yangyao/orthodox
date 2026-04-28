import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { favorites, questions } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { checkEntitlement } from "@/lib/bank-auth";
import { success, error } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const questionId = BigInt(id);

  const [favorite] = await db
    .select()
    .from(favorites)
    .where(
      and(
        eq(favorites.userId, auth.userId),
        eq(favorites.questionId, questionId)
      )
    );

  return success({ isFavorite: !!favorite });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const questionId = BigInt(id);

  // Need bankId to check entitlement and create favorite
  const [question] = await db
    .select({ bankId: questions.bankId })
    .from(questions)
    .where(eq(questions.id, questionId));

  if (!question) return error("Question not found", 404);

  // Check entitlement
  const entitlement = await checkEntitlement(auth.userId, question.bankId);
  if (!entitlement.hasAccess) return entitlement.error!;

  const [existing] = await db
    .select()
    .from(favorites)
    .where(
      and(
        eq(favorites.userId, auth.userId),
        eq(favorites.questionId, questionId)
      )
    );

  if (existing) {
    await db
      .delete(favorites)
      .where(eq(favorites.id, existing.id));
    return success({ isFavorite: false });
  } else {
    await db.insert(favorites).values({
      userId: auth.userId,
      questionId,
      bankId: question.bankId,
    });
    return success({ isFavorite: true });
  }
}
