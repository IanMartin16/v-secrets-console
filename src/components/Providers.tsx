// components/Providers.tsx
// Wraps the app in NextAuth's SessionProvider so useSession() works client-side.
//
// refetchInterval keeps the session (and therefore the FastAPI access token)
// fresh while a tab stays open. Every tick calls the jwt callback in auth.ts,
// which silently refreshes the token via /auth/refresh before it expires.
// Without this, a tab left open for 30+ minutes would hit a 401 on the next
// API call even though the session cookie is still valid.

"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Access tokens live 30 min and refresh at 28 — poll well inside that
      refetchInterval={10 * 60} // seconds
      refetchOnWindowFocus
    >
      {children}
    </SessionProvider>
  );
}
