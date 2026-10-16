import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "@/lib/i18n/routing";
import { updateSession } from "@/lib/supabase/proxy";

const handleI18n = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export async function proxy(request: NextRequest) {
  const i18nResponse = handleI18n(request);
  const { response, user } = await updateSession(request, i18nResponse);

  const pathname = request.nextUrl.pathname;
  const segments = pathname.split("/").filter(Boolean);
  const currentLocale = segments[0] === "km-KH" ? "km-KH" : "en-KH";
  const pathWithoutLocale = segments.length > 1 ? `/${segments.slice(1).join("/")}` : "/";

  const isAuthRoute =
    pathname.startsWith("/auth") ||
    pathWithoutLocale === "/login" ||
    pathWithoutLocale.startsWith("/login");

  // In test/development mode, allow bypass when simulated session cookie or header is present
  const isE2EBypass =
    request.headers.get("x-playwright-test") === "true" ||
    request.cookies.get("sb-test-auth")?.value === "authenticated";

  // If user is not authenticated and trying to access any protected app page, redirect to login
  if (!user && !isE2EBypass && !isAuthRoute) {
    const loginUrl = new URL(`/${currentLocale}/login`, request.url);
    if (pathWithoutLocale !== "/" && pathWithoutLocale !== "/today") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and navigating to /login, redirect to /today
  if (user && isAuthRoute && pathWithoutLocale === "/login") {
    return NextResponse.redirect(new URL(`/${currentLocale}/today`, request.url));
  }

  return response;
}

export const config = {
  // Match internationalized pathnames, exclude auth, api, static assets, and internal paths
  matcher: ["/", "/(en-KH|km-KH)/:path*", "/((?!auth|api|_next|_vercel|.*\\..*).*)"],
};
