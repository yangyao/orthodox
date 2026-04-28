import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { notes, questions } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { checkEntitlement } from "@/lib/bank-auth";
import { success, error, validate } from "@/lib/api-utils";
import { z } from "zod";

const upsertNoteSchema = z.object({
  content: z.string().max(1000),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const questionId = BigInt(id);

  const [note] = await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.userId, auth.userId),
        eq(notes.questionId, questionId)
      )
    );

  return success({ note: note?.content || "" });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const questionId = BigInt(id);

  const body = await request.json();
  const validation = validate(upsertNoteSchema, body);
  if ("error" in validation) return validation.error;

  const { content } = validation.data;

  // Need bankId to check entitlement and create note
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
    .from(notes)
    .where(
      and(
        eq(notes.userId, auth.userId),
        eq(notes.questionId, questionId)
      )
    );

  if (existing) {
    if (content.trim() === "") {
      await db.delete(notes).where(eq(notes.id, existing.id));
      return success({ message: "Note deleted" });
    }
    await db
      .update(notes)
      .set({ content, updatedAt: new Date() })
      .where(eq(notes.id, existing.id));
    return success({ message: "Note updated" });
  } else {
    if (content.trim() === "") return success({ message: "Empty note ignored" });

    await db.insert(notes).values({
      userId: auth.userId,
      questionId,
      bankId: question.bankId,
      content,
    });
    return success({ message: "Note created" });
  }
}
