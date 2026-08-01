// middleware.ts (project root)
// First line of defense: redirect unauthenticated users away from console routes.
// Security note (CVE-2025-29927): defense-in-depth applies — AppShell + lib/api
// also verify auth, so middleware bypass doesn't grant access.

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

type MaybeExtendedSession = {
  accessToken?: string;
} | null;

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth as MaybeExtendedSession;

  // "Fully authenticated" = has NextAuth session AND FastAPI access_token
  // If access_token is missing, the OAuth provisioning didn't complete, and
  // treating the user as logged-in would trap them in a redirect loop.
  const hasSession = !!session;
  const hasApiToken = !!session?.accessToken;
  const isFullyAuth = hasSession && hasApiToken;

  if (isPublicPath(nextUrl.pathname)) {
    // Only bounce fully-authenticated users away from /login and /register.
    // Users with a broken session (no access_token) need /login to retry.
    if (
      isFullyAuth &&
      (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")
    ) {
      return Response.redirect(new URL("/dashboard", nextUrl));
    }
    return; // allow
  }

  // Non-public route + not fully authenticated → redirect to login
  if (!isFullyAuth) {
    const loginUrl = new URL("/login", nextUrl);
    if (nextUrl.pathname !== "/") {
      loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    }
    return Response.redirect(loginUrl);
  }

  // Fully authenticated and requesting a private route → allow
  return;
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|fonts|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?)).*)",
  ],
};
