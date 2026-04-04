import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE = "cc-admin-auth";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /admin pages (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const authCookie = req.cookies.get(ADMIN_COOKIE);
    if (authCookie?.value !== "authenticated") {
      const loginUrl = new URL("/admin/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /clients/[slug] with token (checked via API, not middleware)
  // Token validation happens server-side in the page component
  // because we need to fetch the config from Blob storage

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
