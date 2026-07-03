import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Demo auth gate: any visit without the `acb_auth` cookie is bounced to /login.
 * The login form sets that cookie for ANY credentials (see app/login/page.tsx),
 * so "everything passes" — this only guarantees the login screen is the entry point.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = req.cookies.get("acb_auth")?.value === "1";
  const isLogin = pathname === "/login";

  if (!authed && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (authed && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and static files (anything with a dot).
  matcher: ["/((?!api|_next/static|_next/image|.*\\..*).*)"],
};
