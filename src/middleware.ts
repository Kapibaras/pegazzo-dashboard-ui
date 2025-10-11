import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from 'jose';
import CONSTANTS from "@/config/constants";
import VARIABLES from "@/config/variables";

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  const isPublicRoute = CONSTANTS.AUTH.PUBLIC_ROUTES.some(route =>
    pathname.startsWith(route)
  );

  const session = request.cookies.get("session")?.value;

  let isLoggedIn = false;
  if (session) {
    try {
      await jwtVerify(session, new TextEncoder().encode(VARIABLES.NEXT_SESSION_SECRET));
      isLoggedIn = true;
    } catch (error) {
      isLoggedIn = false;
    }
  }

  if (!isPublicRoute && !isLoggedIn) {
    const redirectUrl = new URL(CONSTANTS.AUTH.LOGIN_ROUTE, origin);
    redirectUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoggedIn && pathname === CONSTANTS.AUTH.LOGIN_ROUTE) {
    return NextResponse.redirect(new URL(CONSTANTS.AUTH.HOME_ROUTE, origin));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|webp)$).*)",
  ],
};
