import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from 'jwt-decode'
import { toast } from "react-toastify";

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value || null;
  const refreshToken = req.cookies.get("refreshToken")?.value || null;
  const decode: any = accessToken ? jwtDecode(accessToken) : null;

  const pathname = req.nextUrl.pathname;

  // Danh sách route cần bảo vệ
  const protectedRoutes = ["/files", "/chat", "/profile"];
  const publicRoutes = ["/login", "/register"];
  const adminRoutes = ["/dashboard"];

  // Nếu người dùng đã đăng nhập và cố gắng truy cập trang công khai, chuyển hướng họ đến trang chính
  if (publicRoutes.some((path) => pathname.startsWith(path))) {
    if (accessToken) {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }

  // Neu nguoi dung chua dang nhap, chuyen huong den trang login
  if (
    protectedRoutes.some((path) => pathname.startsWith(path)) ||
    pathname === "/"
  ) {
    if (!refreshToken && !accessToken) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (adminRoutes.some((path) => pathname.startsWith(path))) {
    const check = decode && (decode.role === 'admin');
    if (!check) {
      const errorUrl = new URL("/403", req.url);
      return NextResponse.redirect(errorUrl);
    }
  }

  return NextResponse.next();
}
