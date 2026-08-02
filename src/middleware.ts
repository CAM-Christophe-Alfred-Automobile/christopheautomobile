import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySession } from "@/lib/auth";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/api/admin/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const isValid = await verifySession(token);

  if (!isValid) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ success: false, error: "Non authentifié" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
