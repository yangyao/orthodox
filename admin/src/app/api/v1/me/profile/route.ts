import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { success, validate } from "@/lib/api-utils";
import { z } from "zod";

const profileSchema = z.object({
  nickname: z.string().max(64).optional(),
  avatarUrl: z.string().max(500).optional(),
  gender: z.number().int().min(0).max(2).optional(),
  province: z.string().max(64).optional(),
  city: z.string().max(64).optional(),
});

export async function PATCH(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const result = validate(profileSchema, body);
  if ("error" in result) return result.error;

  const updates = result.data;
  if (Object.keys(updates).length === 0) {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, auth.userId));
    return success(profile);
  }

  const [updated] = await db
    .update(userProfiles)
    .set(updates)
    .where(eq(userProfiles.userId, auth.userId))
    .returning();

  return success(updated);
}
