import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, userProfiles } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { authenticateUser } from "@/lib/user-auth";
import { success } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await authenticateUser(request);
  if ("error" in auth) return auth.error;

  const [user] = await db.select().from(users).where(eq(users.id, auth.userId));
  if (!user) return success(null);

  const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, auth.userId));

  return success({
    id: String(user.id),
    openid: user.openid,
    mobile: user.mobile,
    status: user.status,
    profile: profile
      ? {
          nickname: profile.nickname,
          avatarUrl: profile.avatarUrl,
          gender: profile.gender,
          province: profile.province,
          city: profile.city,
        }
      : null,
  });
}
