import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { userBankEntitlements, questionBanks } from "@/lib/schema";
import { eq, desc, and } from "drizzle-orm";
import { success, error } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: id } = await params;
  const userId = BigInt(id);

  const entitlements = await db
    .select({
      id: userBankEntitlements.id,
      bankId: userBankEntitlements.bankId,
      bankName: questionBanks.name,
      status: userBankEntitlements.status,
      expiresAt: userBankEntitlements.expiresAt,
      createdAt: userBankEntitlements.createdAt,
    })
    .from(userBankEntitlements)
    .innerJoin(questionBanks, eq(userBankEntitlements.bankId, questionBanks.id))
    .where(eq(userBankEntitlements.userId, userId))
    .orderBy(desc(userBankEntitlements.createdAt));

  return success(entitlements);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: id } = await params;
  const userId = BigInt(id);
  const body = await request.json();

  const { bankId, expiresAt, status } = body;

  if (!bankId) {
    return error("bankId is required", 400);
  }

  const bankIdBI = BigInt(bankId);

  const [existing] = await db
    .select()
    .from(userBankEntitlements)
    .where(
      and(
        eq(userBankEntitlements.userId, userId),
        eq(userBankEntitlements.bankId, bankIdBI)
      )
    );

  if (existing) {
    const [updated] = await db
      .update(userBankEntitlements)
      .set({
        status: status || "active",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        updatedAt: new Date(),
      })
      .where(eq(userBankEntitlements.id, existing.id))
      .returning();
    return success(updated);
  }

  const [inserted] = await db
    .insert(userBankEntitlements)
    .values({
      userId,
      bankId: bankIdBI,
      status: status || "active",
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    })
    .returning();

  return success(inserted);
}
