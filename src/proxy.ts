import { NextResponse, type NextRequest } from "next/server";
import { isOpenMode } from "@/lib/auth/mode";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/token";

// Runs before every request to the private areas (and /login).
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // AUTH_MODE=open: no login barrier. The locked-mode code below is untouched.
  if (isOpenMode()) {
    if (pathname === "/login") return NextResponse.redirect(new URL("/os", request.url));
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname === "/login") {
    return session ? NextResponse.redirect(new URL("/os", request.url)) : NextResponse.next();
  }

  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    const res = NextResponse.redirect(login);
    // Clear a stale/revoked cookie so it isn't re-checked on every request.
    if (request.cookies.has(SESSION_COOKIE)) res.cookies.delete(SESSION_COOKIE);
    return res;
  }

  if (pathname.startsWith("/admin") && session.role !== "owner") {
    return NextResponse.redirect(new URL("/os", request.url));
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = {
  matcher: ["/os/:path*", "/sim/:path*", "/lab/:path*", "/admin/:path*", "/login"],
};
