// components/Providers.tsx
// Wraps the app in NextAuth's SessionProvider so useSession() works client-side.
// The token sync logic (NextAuth session → localStorage for lib/api.ts) now
// lives directly in AppShell to avoid race conditions between sibling effects.

"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
