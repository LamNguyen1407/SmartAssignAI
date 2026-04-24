import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from 'jwt-decode'
import { toast } from "react-toastify";

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken")?.value || null;
  const refreshToken = req.cookies.get("refreshToken")?.value || null;
  const decode: any = accessToken ? jwtDecode(accessToken) : null;

  const pathname = req.nextUrl.pathname;

  const protectedRoutes = ["/files", "/chat", "/profile"];
  const publicRoutes = ["/login", "/register"];
  const adminRoutes = ["/dashboard"];

  if (publicRoutes.some((path) => pathname.startsWith(path))) {
    if (accessToken) {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }

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
    const check = decode && (decode.role === 'admin' || decode.role === 'lecture');
    if (!check) {
      const errorUrl = new URL("/403", req.url);
      return NextResponse.redirect(errorUrl);
    }
  }

  return NextResponse.next();
}
