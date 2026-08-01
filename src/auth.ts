// auth.ts
// Auth.js v5 configuration — lives at the project root.
//
// Two providers, one session model:
//   1. GitHub OAuth  → provisions the user via FastAPI /auth/oauth-provision
//   2. Credentials   → delegates to FastAPI /auth/login (existing password flow)
//
// Both end up with the same FastAPI access_token stored in the NextAuth JWT,
// which means middleware sees a consistent session regardless of how the user
// signed in. AppShell syncs that token into localStorage for lib/api.ts.

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";

// -----------------------------------------------------------------------------
// FastAPI bridges
// -----------------------------------------------------------------------------

type ProvisionedTokens = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

function getApiUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_VSECRETS_API_URL;
  if (!url) {
    console.error("[auth] Missing NEXT_PUBLIC_VSECRETS_API_URL");
    return null;
  }
  return url;
}

/** OAuth path: create-or-fetch the user in FastAPI, get back tokens. */
async function provisionWithFastAPI(args: {
  provider: "github";
  providerAccountId: string;
  email: string;
  name: string | null;
}): Promise<ProvisionedTokens | null> {
  const apiUrl = getApiUrl();
  const secret = process.env.INTERNAL_PROVISION_SECRET;

  if (!apiUrl || !secret) {
    console.error("[auth] Missing API URL or INTERNAL_PROVISION_SECRET");
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

/** Password path: validate credentials against the existing FastAPI endpoint. */
async function loginWithFastAPI(
  email: string,
  password: string,
): Promise<{ tokens: ProvisionedTokens; profile: { id?: string; full_name?: string } } | null> {
  const apiUrl = getApiUrl();
  if (!apiUrl) return null;

  try {
    const loginRes = await fetch(`${apiUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!loginRes.ok) {
      // 401 = bad credentials, 403 = inactive account. Both are "no".
      return null;
    }

    const tokens = (await loginRes.json()) as ProvisionedTokens;

    // Fetch the profile so the session carries a name and id
    let profile: { id?: string; full_name?: string } = {};
    try {
      const meRes = await fetch(`${apiUrl}/users/me`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
        cache: "no-store",
      });
      if (meRes.ok) {
        profile = await meRes.json();
      }
    } catch {
      // Non-fatal — session still works without the profile
    }

    return { tokens, profile };
  } catch (err) {
    console.error("[auth] login network error:", err);
    return null;
  }
}

// -----------------------------------------------------------------------------
// NextAuth config
// -----------------------------------------------------------------------------

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },

  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: { params: { scope: "read:user user:email" } },
    }),

    Credentials({
      id: "password",
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const result = await loginWithFastAPI(email, password);
        if (!result) return null;

        // Whatever we return here lands in the `user` arg of the jwt callback
        return {
          id: result.profile.id ?? email,
          email,
          name: result.profile.full_name ?? null,
          vsecretsAccessToken: result.tokens.access_token,
          vsecretsRefreshToken: result.tokens.refresh_token,
        };
      },
    }),

    // Note: Resend / magic-link provider intentionally omitted.
    // Auth.js email providers require a database adapter, which conflicts with
    // the FastAPI-owned user model. Magic links will be implemented via FastAPI
    // and surfaced here as a second Credentials-style provider.
  ],

  pages: {
    signIn: "/login",
    error: "/auth/error",
  },

  callbacks: {
    async signIn({ user, account }) {
      // Credentials provider already validated everything in authorize()
      if (account?.provider === "password") return true;

      // OAuth providers must give us an email
      if (!user.email) {
        console.warn("[auth] signIn rejected: no email from provider", {
          provider: account?.provider,
        });
        return "/auth/error?reason=email_required";
      }
      return true;
    },

    async jwt({ token, user, account }) {
      // `user` and `account` are only present on the initial sign-in
      if (!user || !account) return token;

      if (account.provider === "password") {
        // Tokens were already fetched inside authorize()
        const u = user as typeof user & {
          vsecretsAccessToken?: string;
          vsecretsRefreshToken?: string;
        };
        token.vsecretsAccessToken = u.vsecretsAccessToken;
        token.vsecretsRefreshToken = u.vsecretsRefreshToken;
        return token;
      }

      if (account.provider === "github") {
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
        (session as typeof session & { provisioningFailed?: boolean }).provisioningFailed =
          true;
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
