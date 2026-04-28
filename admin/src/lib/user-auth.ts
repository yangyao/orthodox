import { NextRequest } from "next/server";
import { verifyToken } from "./jwt";
import { error } from "./api-utils";

interface AuthResult {
  userId: bigint;
}

interface AuthError {
  error: ReturnType<typeof error>;
}

export async function authenticateUser(
  request: NextRequest
): Promise<AuthResult | AuthError> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: error("未登录", 401, 401) };
  }

  const token = authHeader.slice(7);
  const payload = await verifyToken(token);
  if (!payload?.sub) {
    return { error: error("登录已过期", 401, 401) };
  }

  return { userId: BigInt(payload.sub) };
}
