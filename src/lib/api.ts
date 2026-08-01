import { getSession, signOut } from "next-auth/react";
import type {
  AuthResponse,
  Project,
  ProjectUpdateInput,
  ProjectCreatePayload,
  ApiKeyCreateResponse,
  ApiKey,
  ApiKeyCreatePayload,
  Secret,
  SecretCreatePayload,
  SecretRevealResponse,
  UserProfile,
  AuditLog,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_VSECRETS_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_VSECRETS_API_URL is not configured");
}

// -----------------------------------------------------------------------------
// Access token: single source of truth
// -----------------------------------------------------------------------------
//
// The token comes from the NextAuth session, never from localStorage.
// getSession() hits /api/auth/session, which runs the `jwt` callback in auth.ts,
// which silently refreshes the FastAPI token when it's close to expiring.
//
// Why this matters: mirroring the token into localStorage created a second copy
// that could go stale. On iOS Safari (bfcache freezes and restores pages with
// old JS state) the stale copy kept getting written back after a 401, producing
// a redirect loop. With one source of truth, a restored page's first API call
// fetches a live token and self-heals.

type SessionWithToken = {
  accessToken?: string;
  tokenExpired?: boolean;
};

// Small cache so a burst of calls doesn't hit /api/auth/session repeatedly.
// 60s is safe: auth.ts refreshes at 28 min against a 30 min expiry, so a
// cached token always has at least a 2 minute margin left.
let tokenCache: { value: string; cachedAt: number } | null = null;
const TOKEN_CACHE_MS = 60_000;

async function getAccessToken(): Promise<string | null> {
  if (tokenCache && Date.now() - tokenCache.cachedAt < TOKEN_CACHE_MS) {
    return tokenCache.value;
  }

  const session = (await getSession()) as SessionWithToken | null;
  const token = session?.accessToken ?? null;

  tokenCache = token ? { value: token, cachedAt: Date.now() } : null;
  return token;
}

/** Drop the cached token. Call after sign-out or on any 401. */
export function invalidateTokenCache() {
  tokenCache = null;
}

// -----------------------------------------------------------------------------
// Request wrapper
// -----------------------------------------------------------------------------

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = options.auth === false ? null : await getAccessToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      `Could not connect to V-Secrets API. Check CORS, API URL or Railway status. URL: ${API_URL}${path}`
    );
  }

  if (response.status === 401) {
    // The session is dead server-side. Clear the cache and destroy the NextAuth
    // cookie — otherwise the middleware still sees a session and bounces /login
    // back to /dashboard. signOut handles the navigation.
    invalidateTokenCache();
    void signOut({ callbackUrl: "/login" });
    throw new Error("Session expired. Please sign in again.");
  }

  if (!response.ok) {
    let message = "Request failed";

    try {
      const error = await response.json();
      message =
        typeof error.detail === "string"
          ? error.detail
          : JSON.stringify(error.detail) || message;
    } catch {
      // ignore parse error
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

// -----------------------------------------------------------------------------
// Auth
// -----------------------------------------------------------------------------
//
// register() still calls FastAPI directly — it creates the account. The session
// is then established by signIn("password") in the register page.
//
// login() is kept for reference but is no longer called by the UI: password
// sign-in goes through NextAuth's Credentials provider, which calls
// POST /auth/login server-side (see auth.ts).

export function register(payload: {
  email: string;
  password: string;
  full_name: string;
}) {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

export function login(payload: { email: string; password: string }) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });
}

// -----------------------------------------------------------------------------
// Users
// -----------------------------------------------------------------------------

export function getMe() {
  return apiRequest<UserProfile>("/users/me");
}

// -----------------------------------------------------------------------------
// Projects
// -----------------------------------------------------------------------------

export function getProjects() {
  return apiRequest<Project[]>("/projects");
}

export function createProject(payload: ProjectCreatePayload) {
  return apiRequest<Project>("/projects", {
    method: "POST",
    body: JSON.stringify({
      environment: "production",
      ...payload,
    }),
  });
}

export function updateProject(projectId: string, payload: ProjectUpdateInput) {
  return apiRequest<Project>(`/projects/${projectId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

// -----------------------------------------------------------------------------
// Secrets
// -----------------------------------------------------------------------------

export function getProjectSecrets(projectId: string) {
  return apiRequest<Secret[]>(`/projects/${projectId}/secrets`);
}

export function createSecret(projectId: string, payload: SecretCreatePayload) {
  return apiRequest<Secret>(`/projects/${projectId}/secrets`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function revealSecret(projectId: string, key: string) {
  return apiRequest<SecretRevealResponse>(
    `/projects/${projectId}/secrets/${encodeURIComponent(key)}/reveal`,
    {
      method: "POST",
    }
  );
}

// -----------------------------------------------------------------------------
// API keys
// -----------------------------------------------------------------------------

export function getApiKeys() {
  return apiRequest<ApiKey[]>("/api-keys");
}

export function createApiKey(payload: ApiKeyCreatePayload) {
  return apiRequest<ApiKeyCreateResponse>("/api-keys", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function revokeApiKey(apiKeyId: string) {
  return apiRequest<void>(`/users/me/api-keys/${apiKeyId}`, {
    method: "DELETE",
  });
}

// -----------------------------------------------------------------------------
// Audit
// -----------------------------------------------------------------------------

export function getAuditLogs(limit = 50) {
  return apiRequest<AuditLog[]>(`/audit-logs?limit=${limit}`);
}
