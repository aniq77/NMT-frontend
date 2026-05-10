import { type NextRequest, NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

const AUTH_ROUTES = ["/login", "/register", "/verify-email"];

function isAuthRoute(pathname: string): boolean {
  // Strip locale prefix if present (e.g. /en/login → /login)
  const withoutLocale = pathname.replace(/^\/(uk|en)/, "") || "/";
  return AUTH_ROUTES.some((r) => withoutLocale === r || withoutLocale.startsWith(`${r}/`));
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAccessToken = request.cookies.has("access_token");

  // Let next-intl handle locale routing first
  const intlResponse = intlMiddleware(request);

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname) && hasAccessToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (!isAuthRoute(pathname) && !hasAccessToken) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|favicon\\.ico|.*\\..*).*)",
  ],
};
