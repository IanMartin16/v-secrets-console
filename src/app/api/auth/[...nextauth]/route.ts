// app/api/auth/[...nextauth]/route.ts
// This is the catch-all route that NextAuth uses for its endpoints:
// /api/auth/signin, /api/auth/callback/github, /api/auth/signout, etc.
// It just re-exports the handlers from auth.ts.

import { handlers } from "@/auth";
export const { GET, POST } = handlers;