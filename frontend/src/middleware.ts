import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value || null;

   const pathname = req.nextUrl.pathname;

  // Danh sách route cần bảo vệ
  const protectedRoutes = ["/files", "/chat", "/profile"];
  const publicRoutes = ["/login", "/register"];

  // Nếu người dùng đã đăng nhập và cố gắng truy cập trang công khai, chuyển hướng họ đến trang chính
  if (publicRoutes.some((path) => pathname.startsWith(path))) {
    if (accessToken) {
      const homeUrl = new URL("/", req.url);
      return NextResponse.redirect(homeUrl);
    }
  }

  if (protectedRoutes.some((path) => pathname.startsWith(path)) || pathname === "/") {
    if (!accessToken) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}
