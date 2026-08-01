// auth.ts
// Auth.js v5 configuration — lives at the project root.
//
// Design decisions:
// 1. JWT session strategy (no database adapter needed — FastAPI owns the user table)
// 2. On successful OAuth/magic-link, we call our FastAPI /auth/oauth-provision endpoint
//    from the `jwt` callback. That endpoint returns an access_token compatible with
//    the existing password flow.
// 3. We stash that access_token in the JWT payload so the client-side SessionBridge
//    can copy it to localStorage (where lib/api.ts expects it).

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

// -----------------------------------------------------------------------------
// FastAPI provisioning bridge
// -----------------------------------------------------------------------------

type ProvisionedTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

async function provisionWithFastAPI(args: {
  provider: "github" | "magic_link";
  providerAccountId: string;
  email: string;
  name: string | null;
}): Promise<ProvisionedTokens | null> {
  const apiUrl = process.env.NEXT_PUBLIC_VSECRETS_API_URL;
  const secret = process.env.INTERNAL_PROVISION_SECRET;

  if (!apiUrl || !secret) {
    console.error("[auth] Missing NEXT_PUBLIC_VSECRETS_API_URL or INTERNAL_PROVISION_SECRET");
    return null;
  }

  try {
    const response = await fetch(`${apiUrl}/auth/oauth-provision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Internal-Auth": secret,
      },
      body: JSON.stringify({
        provider: args.provider,
        provider_account_id: args.providerAccountId,
        email: args.email,
        name: args.name,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error(`[auth] provision failed ${response.status}: ${text}`);
      return null;
    }

    return (await response.json()) as ProvisionedTokens;
  } catch (err) {
    console.error("[auth] provision network error:", err);
    return null;
  }
}

// -----------------------------------------------------------------------------
// NextAuth config
// -----------------------------------------------------------------------------

export const { handlers, signIn, signOut, auth } = NextAuth({
  // JWT sessions — no DB adapter; the FastAPI backend is the source of truth
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },

  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      // Request the user's primary email even if it's not public
      authorization: { params: { scope: "read:user user:email" } },
    }),
    // Note: Resend / magic-link provider intentionally omitted.
    // Auth.js email providers require a database adapter (for verification token
    // storage), which conflicts with the FastAPI-owned user model.
    //
    // Magic links are implemented via FastAPI directly:
    //   POST /auth/magic-link/request   → generate token, email via Resend
    //   POST /auth/magic-link/verify    → validate token, return access_token
    // The frontend calls those endpoints directly, bypassing Auth.js.
  ],

  pages: {
    signIn: "/login",
    error: "/auth/error",
  },

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) {
        console.warn("[auth] signIn rejected: no email from provider", { provider: account?.provider });
        return "/auth/error?reason=email_required";
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user && account) {
        const provisioned = await provisionWithFastAPI({
          provider: "github",
          providerAccountId: account.providerAccountId ?? user.id ?? user.email!,
          email: user.email!,
          name: user.name ?? null,
        });

        if (provisioned) {
          token.vsecretsAccessToken = provisioned.access_token;
          token.vsecretsRefreshToken = provisioned.refresh_token;
        } else {
          token.provisioningFailed = true;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.vsecretsAccessToken) {
        (session as typeof session & { accessToken?: string }).accessToken =
          token.vsecretsAccessToken as string;
      }
      if (token.provisioningFailed) {
        (session as typeof session & { provisioningFailed?: boolean }).provisioningFailed = true;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
  },

  trustHost: true,
});
