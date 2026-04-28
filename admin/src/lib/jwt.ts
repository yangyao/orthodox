import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret-change-me");

export async function signToken(userId: bigint): Promise<string> {
  return new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { sub: payload.sub as string };
  } catch {
    return null;
  }
}
