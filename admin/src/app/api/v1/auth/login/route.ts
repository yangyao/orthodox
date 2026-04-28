import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, userProfiles, userSettings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { signToken } from "@/lib/jwt";
import { success, error, validate } from "@/lib/api-utils";
import { z } from "zod";

const loginSchema = z.object({
  code: z.string().min(1),
});

async function jscode2session(code: string) {
  const appid = process.env.WECHAT_APPID;
  const secret = process.env.WECHAT_SECRET;
  if (!appid || !secret) {
    throw new Error("WECHAT_APPID or WECHAT_SECRET not configured");
  }

  const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${encodeURIComponent(code)}&grant_type=authorization_code`;
  const res = await fetch(url);
  return res.json() as Promise<{ openid?: string; session_key?: string; errcode?: number; errmsg?: string }>;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = validate(loginSchema, body);
  if ("error" in result) return result.error;

  const wxRes = await jscode2session(result.data.code);
  if (wxRes.errcode || !wxRes.openid) {
    return error(wxRes.errmsg ?? "微信登录失败", 401);
  }

  const openid = wxRes.openid;

  // Find or create user
  let [user] = await db.select().from(users).where(eq(users.openid, openid));
  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    [user] = await db.insert(users).values({ openid }).returning();
    await db.insert(userProfiles).values({ userId: user.id });
    await db.insert(userSettings).values({ userId: user.id });
  } else {
    await db
      .update(userProfiles)
      .set({ lastLoginAt: new Date() })
      .where(eq(userProfiles.userId, user.id));
  }

  const token = await signToken(user.id);

  return success({
    token,
    user: {
      id: String(user.id),
      openid: user.openid,
      isNewUser,
    },
  });
}
