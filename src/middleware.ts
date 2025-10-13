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
  let sessionPayload = null;

  if (session) {
    try {
      const secret = new TextEncoder().encode(VARIABLES.NEXT_SESSION_SECRET);
      const { payload } = await jwtVerify(session, secret);
      sessionPayload = payload;
    } catch (error) {
    }
  }
  
  const isLoggedIn = !!sessionPayload;

  if (!isPublicRoute && !isLoggedIn) {
    const redirectUrl = new URL(CONSTANTS.AUTH.LOGIN_ROUTE, origin);
    redirectUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoggedIn && pathname === CONSTANTS.AUTH.LOGIN_ROUTE) {
    return NextResponse.redirect(new URL(CONSTANTS.AUTH.HOME_ROUTE, origin));
  }
  
  const response = NextResponse.next();

  if (isLoggedIn && sessionPayload) {
    const userData = JSON.stringify({ 
      username: sessionPayload.username,
    });
    response.headers.set('X-User-Session', userData);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|webp)$).*)",
  ],
};