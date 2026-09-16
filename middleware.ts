import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-at-least-32-characters-long",
);

const protectedRoutes = [
  "/dashboard",
  "/tasks",
  "/notifications",
  "/profile",
  "/admin",
];
const adminRoutes = ["/admin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("taskflow_session")?.value;

  let session: any = null;
  if (token) {
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      session = verified.payload;
    } catch (e) {
      session = null;
    }
  }

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminPath = adminRoutes.some((route) => pathname.startsWith(route));

  // 1. Unauthenticated users access protected paths -> Redirect to /login
  if (isProtected && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Non-admin users access admin paths -> Redirect to /dashboard
  if (isAdminPath && session?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 3. Authenticated users access auth pages -> Redirect to /dashboard
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tasks/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
