import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. 排除所有 API 路由
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 2. 獲取 Session (僅對頁面請求)
  const session = await auth();
  const isLoggedIn = !!session;

  // 3. 登錄頁面邏輯
  if (pathname === "/login") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 4. 未登錄重定向 (排除靜態資源)
  if (!isLoggedIn && !pathname.startsWith("/_next") && pathname !== "/favicon.ico") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// 這裡的 matcher 保持簡單，邏輯交給上面的 if 判斷
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
