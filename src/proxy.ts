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

const DEV_BYPASS_TOKEN = "12345";

export default async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const hasAccessToken = request.cookies.has("access_token");
  const hasBypassToken = searchParams.get("token") === DEV_BYPASS_TOKEN;

  // Let next-intl handle locale routing first
  const intlResponse = intlMiddleware(request);

  if (hasBypassToken) return intlResponse;

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname) && hasAccessToken) {
    return NextResponse.redirect(new URL(`/?token=${DEV_BYPASS_TOKEN}`, request.url));
  }

  // Redirect unauthenticated users to login for protected routes
  if (!isAuthRoute(pathname) && !hasAccessToken) {
    return NextResponse.redirect(new URL(`/login?token=${DEV_BYPASS_TOKEN}`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: [
    "/((?!_next|_vercel|favicon\\.ico|.*\\..*).*)",
  ],
};
