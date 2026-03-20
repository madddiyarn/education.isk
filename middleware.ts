import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { DEFAULT_LOCALE, SESSION_COOKIE_NAME } from "@/lib/constants";
import { isSupportedLocale } from "@/lib/locale";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];

  if (!maybeLocale || !isSupportedLocale(maybeLocale)) {
    const localeCookie = request.cookies.get("locale")?.value;
    const locale = localeCookie && isSupportedLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;

    return NextResponse.redirect(url);
  }

  if (pathname.includes("/dashboard") && !request.cookies.get(SESSION_COOKIE_NAME)?.value) {
    const url = request.nextUrl.clone();
    url.pathname = `/${maybeLocale}/login`;
    url.searchParams.set("next", pathname);

    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.cookies.set("locale", maybeLocale, { path: "/" });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
