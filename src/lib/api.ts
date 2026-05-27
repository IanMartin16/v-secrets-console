import { getToken, clearToken } from "./auth";
import type {
  AuthResponse,
  Project,
  ProjectCreatePayload,
  ApiKeyCreateResponse,
  ApiKey,
  ApiKeyCreatePayload,
  Secret,
  SecretCreatePayload,
  SecretRevealResponse,
  UserProfile,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_VSECRETS_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_VSECRETS_API_URL is not configured");
}

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = options.auth === false ? null : getToken();

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
  } catch (err) {

    throw new Error(
      `Could not connect to V-Secrets API. Check CORS, API URL or Railway status. URL: ${API_URL}${path}`
    );
  }

  if (response.status === 401) {
    clearToken();
    window.location.href = "/login";
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

  return response.json();
}

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

export function getMe() {
  return apiRequest<UserProfile>("/users/me");
}

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

export function getApiKeys() {
  return apiRequest<ApiKey[]>("/api-keys");
}

export function createApiKey(payload: ApiKeyCreatePayload) {
  return apiRequest<ApiKeyCreateResponse>("/api-keys", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}