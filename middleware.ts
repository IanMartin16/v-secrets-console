// middleware.ts (project root)
// First line of defense: redirect unauthenticated users away from console routes.
// This runs on the edge before the page renders.
//
// SECURITY NOTE (CVE-2025-29927): Middleware alone is bypassable by spoofing the
// x-middleware-subrequest header. We rely on defense-in-depth:
//   1. This middleware — first filter, redirects unauth users
//   2. AppShell client check — verifies auth again on mount
//   3. lib/api.ts — rejects any 401 from FastAPI and clears the session
// If any single layer is bypassed, the others still hold.

import { auth } from "@/auth";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/auth/verify-request",
  "/auth/error",
];

const PUBLIC_PREFIXES = [
  "/api/auth", // NextAuth's own endpoints
  "/_next",    // Next internals
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  if (isPublicPath(nextUrl.pathname)) {
    // If a logged-in user visits /login or /register, bounce them to /dashboard
    if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return; // allow
  }

  // Non-public route + not logged in → redirect to login
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    // Preserve the intended destination so we can send them back after auth
    if (nextUrl.pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    }
    return Response.redirect(loginUrl);
  }

  // Logged in and requesting a private route → allow
  return;
});

export const config = {
  // Run on everything except static assets and the health endpoints
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)).*)",
  ],
};
