export type AuthResponse = {
  access_token: string;
  refresh_token?: string;
  token_type?: string;
};

export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_verified: boolean;
  plan: string;
  created_at: string;
  limits?: {
    projects: number | null;
    secrets_per_project: number | null;
    api_keys: number | null;
    requests_per_minute: number | null;
    monthly_requests: number | null;
  };
  usage?: {
    projects: number;
    secrets: number;
    api_keys: number;
  };
};

export type Project = {
  id: string;
  owner_id?: string;
  name: string;
  description?: string;
  environment: string;
  color?: string;
  created_at: string;
  updated_at: string;
  secret_count?: number;
};

export type ProjectCreatePayload = {
  name: string;
  description?: string;
  environment?: string;
};

export type Secret = {
  id?: string;
  key: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  version?: number;
};

export type SecretCreatePayload = {
  key: string;
  value: string;
  description?: string;
};

export type SecretRevealResponse = {
  key: string;
  value: string;
};

export type ApiKey = {
  id: string;
  name: string;
  key_prefix?: string;
  project_id?: string | null;
  scopes: string[];
  expires_at?: string | null;
  created_at?: string;
  last_used_at?: string | null;
  is_active?: boolean;
};

export type ApiKeyCreatePayload = {
  name: string;
  expires_in_days?: number | null;
  project_id?: string | null;
  scopes: string[];
};

export type ApiKeyCreateResponse = {
  id?: string;
  name?: string;
  api_key: string;
  key_prefix?: string;
  scopes?: string[];
  expires_at?: string | null;
};

export type AuditLog = {
  id: string;
  user_id?: string | null;
  project_id?: string | null;
  secret_id?: string | null;
  action: string;
  resource_type: string;
  resource_id?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  api_key_id?: string | null;
  request_method?: string | null;
  request_path?: string | null;
  status_code?: number | null;
  event_metadata?: {
    duration_ms?: number;
    auth_method?: string;
    [key: string]: unknown;
  } | null;
  created_at: string;
};

export type ProjectUpdateInput = {
  name?: string;
  description?: string;
  environment?: string;
  color?: string;
};