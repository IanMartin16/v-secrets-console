"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Check, Copy, ShieldAlert, Trash2 } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { createApiKey, getApiKeys, getMe, getProjects, revokeApiKey, rotateApiKey } from "@/lib/api";
import type { ApiKey, Project, UserProfile } from "@/lib/types";

import styles from "@/components/AppShell.module.css";

import { RotateCw } from "lucide-react";
import { RotateKeyModal } from "@/components/RotateKeyModal";

// Full scope catalogue, mirroring ALLOWED_API_KEY_SCOPES in the backend.
// The read/reveal split matters: `secrets:read` returns metadata only, while
// `secrets:reveal` is what actually decrypts a value.
const ALL_SCOPES = [
  {
    id: "projects:read",
    group: "Projects",
    description: "List projects and read their metadata",
  },
  {
    id: "projects:write",
    group: "Projects",
    description: "Create and update projects",
  },
  {
    id: "secrets:read",
    group: "Secrets",
    description: "List secret keys and metadata — values stay hidden",
  },
  {
    id: "secrets:reveal",
    group: "Secrets",
    description: "Decrypt and return secret values",
  },
  {
    id: "secrets:write",
    group: "Secrets",
    description: "Create new secrets and update existing ones",
  },
  {
    id: "secrets:delete",
    group: "Secrets",
    description: "Permanently remove secrets",
  },
  {
    id: "api_keys:write",
    group: "Runtime keys",
    description: "Issue and revoke other runtime keys",
    dangerous: true,
  },
];

const SCOPE_GROUPS = ["Projects", "Secrets", "Runtime keys"];

// Presets cover the common shapes; "custom" unlocks the full checkbox grid.
const SCOPE_PRESETS: Record<string, { label: string; hint: string; scopes: string[] }> = {
  inventory: {
    label: "Inventory — list only",
    hint: "Sees which projects and secrets exist but cannot decrypt anything. Good for dashboards and drift checks.",
    scopes: ["projects:read", "secrets:read"],
  },
  runtime: {
    label: "Runtime — read and reveal",
    hint: "Can decrypt secret values. This is what a deployed service needs, and nothing more.",
    scopes: ["projects:read", "secrets:read", "secrets:reveal"],
  },
  deploy: {
    label: "Deploy — reveal and write",
    hint: "Adds the ability to create and update secrets. For provisioning tooling and CI, not for a running app.",
    scopes: ["projects:read", "secrets:read", "secrets:reveal", "secrets:write"],
  },
  custom: {
    label: "Custom — pick individual scopes",
    hint: "",
    scopes: [],
  },
};

export default function SettingsPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create-key form
  const [showForm, setShowForm] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyProject, setKeyProject] = useState("");
  const [keyExpiry, setKeyExpiry] = useState("90");
  const [keyScopePreset, setKeyScopePreset] = useState("runtime");
  const [keyScopes, setKeyScopes] = useState<string[]>(SCOPE_PRESETS.runtime.scopes);
  const [creating, setCreating] = useState(false);

  // The one-time reveal of a freshly created key
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [rotatingKey, setRotatingKey] = useState<ApiKey | null>(null);

  async function loadAll() {
    try {
      const [profile, keys, projectList] = await Promise.all([
        getMe(),
        getApiKeys(),
        getProjects(),
      ]);
      setUser(profile);
      setApiKeys(Array.isArray(keys) ? keys : []);
      setProjects(Array.isArray(projectList) ? projectList : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCreateKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (keyScopes.length === 0) {
      setError("Select at least one permission for this key.");
      return;
    }

    setCreating(true);

    try {
      const response = await createApiKey({
        name: keyName,
        scopes: keyScopes,
        ...(keyProject ? { project_id: keyProject } : {}),
        ...(keyExpiry !== "never" ? { expires_in_days: Number(keyExpiry) } : {}),
      });

      // The raw key is returned exactly once
      const raw = (response as { api_key?: string }).api_key;
      if (raw) setNewKey(raw);

      setKeyName("");
      setKeyProject("");
      setKeyExpiry("90");
      setKeyScopePreset("runtime");
      setKeyScopes(SCOPE_PRESETS.runtime.scopes);
      setShowForm(false);

      const keys = await getApiKeys();
      setApiKeys(Array.isArray(keys) ? keys : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create runtime key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(keyId: string, name: string) {
    const confirmed = window.confirm(
      `Revoke "${name}"?\n\nAny service using this key will stop working immediately. This can't be undone.`,
    );
    if (!confirmed) return;

    setError("");
    try {
      await revokeApiKey(keyId);
      const keys = await getApiKeys();
      setApiKeys(Array.isArray(keys) ? keys : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to revoke key");
    }
  }

  function handlePresetChange(presetId: string) {
    setKeyScopePreset(presetId);
    // Switching to custom seeds the checkboxes with whatever was selected,
    // so the user edits from a working starting point instead of an empty list.
    if (presetId !== "custom") {
      setKeyScopes(SCOPE_PRESETS[presetId]?.scopes ?? []);
    }
  }

  function toggleScope(scopeId: string) {
    setKeyScopes((current) =>
      current.includes(scopeId)
        ? current.filter((item) => item !== scopeId)
        : [...current, scopeId],
    );
  }

  async function handleCopyKey() {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable — user can select manually
    }
  }

  const activeKeys = apiKeys.filter((key) => key.is_active !== false);

  return (
    <AppShell title="Settings">
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>Workspace</p>
        <h1 className={styles.heroTitle}>Settings</h1>
        <p className={styles.heroLede}>
          Your profile, plan limits, and the runtime keys your services use to reach the vault.
        </p>
      </section>

      {error ? <div className={styles.errorBanner}>{error}</div> : null}

      {/* ---------------- Profile ---------------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Profile</h2>
        </div>

        <div className={styles.settingsCard}>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Name</div>
            <div className={styles.settingsValue}>
              {loading ? "—" : user?.full_name || "Not set"}
            </div>
          </div>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Email</div>
            <div className={styles.settingsValue}>{loading ? "—" : user?.email ?? "—"}</div>
          </div>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Member since</div>
            <div className={styles.settingsValue}>
              <span className={styles.settingsValueMono}>
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Plan ---------------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Plan &amp; limits</h2>
          <Link href="/settings/billing" className={styles.sectionLink}>
            Upgrade to Pro →
          </Link>
        </div>

        <div className={styles.settingsCard}>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Current plan</div>
            <div className={styles.settingsValue}>
              <span className={styles.badge}>{user?.plan ?? "free"}</span>
            </div>
          </div>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Projects</div>
            <div className={styles.settingsValue}>
              <span className={styles.settingsValueMono}>
                {user?.usage?.projects ?? 0} / {formatLimit(user?.limits?.projects)}
              </span>
            </div>
          </div>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Secrets</div>
            <div className={styles.settingsValue}>
              <span className={styles.settingsValueMono}>
                {user?.usage?.secrets ?? 0} / {formatLimit(user?.limits?.secrets_per_project)}
              </span>
            </div>
          </div>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Runtime keys</div>
            <div className={styles.settingsValue}>
              <span className={styles.settingsValueMono}>
                {activeKeys.length} / {formatLimit(user?.limits?.api_keys)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Runtime keys ---------------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Runtime keys</h2>
          <Button variant="primary" onClick={() => setShowForm((value) => !value)}>
            {showForm ? "Cancel" : "+ New key"}
          </Button>
        </div>

        {/* One-time reveal */}
        {newKey ? (
          <div className={styles.revealBox}>
            <h3 className={styles.revealTitle}>Your new runtime key</h3>
            <p className={styles.revealWarning}>
              Copy it now — this is the only time it will be shown. Store it in your deployment
              environment, never in source control.
            </p>
            <div className={styles.revealValue}>
              <code>{newKey}</code>
              <button type="button" className={styles.copyBtn} onClick={handleCopyKey}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div style={{ marginTop: 14 }}>
              <Button variant="ghost" onClick={() => setNewKey(null)}>
                I've saved it
              </Button>
            </div>
          </div>
        ) : null}

        {/* Create form */}
        {showForm ? (
          <form className={styles.form} onSubmit={handleCreateKey}>
            <div className={styles.field}>
              <label htmlFor="key-name" className={styles.fieldLabel}>
                Key name
              </label>
              <input
                id="key-name"
                className={styles.input}
                value={keyName}
                onChange={(event) => setKeyName(event.target.value)}
                placeholder="ci-pipeline"
                autoComplete="off"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="key-project" className={styles.fieldLabel}>
                Scope
              </label>
              <select
                id="key-project"
                className={styles.select}
                value={keyProject}
                onChange={(event) => setKeyProject(event.target.value)}
              >
                <option value="">All projects (global)</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <span className={styles.settingsHint}>
                Scoping to one project limits the blast radius if the key leaks.
              </span>
            </div>

            <div className={styles.field}>
              <label htmlFor="key-scopes" className={styles.fieldLabel}>
                Permissions
              </label>
              <select
                id="key-scopes"
                className={styles.select}
                value={keyScopePreset}
                onChange={(event) => handlePresetChange(event.target.value)}
              >
                {Object.entries(SCOPE_PRESETS).map(([id, preset]) => (
                  <option key={id} value={id}>
                    {preset.label}
                  </option>
                ))}
              </select>

              {keyScopePreset === "custom" ? (
                <div className={styles.scopeGroups}>
                  {SCOPE_GROUPS.map((group) => (
                    <div key={group} className={styles.scopeGroup}>
                      <span className={styles.scopeGroupLabel}>{group}</span>
                      {ALL_SCOPES.filter((scope) => scope.group === group).map((scope) => {
                        const checked = keyScopes.includes(scope.id);
                        return (
                          <label
                            key={scope.id}
                            className={[
                              styles.scopeItem,
                              checked ? styles.scopeItemChecked : "",
                              scope.dangerous ? styles.scopeItemDanger : "",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            <input
                              type="checkbox"
                              className={styles.scopeCheckbox}
                              checked={checked}
                              onChange={() => toggleScope(scope.id)}
                            />
                            <span className={styles.scopeText}>
                              <span className={styles.scopeName}>
                                {scope.id}
                                {scope.dangerous ? (
                                  <span className={styles.scopeDangerBadge}>escalation</span>
                                ) : null}
                              </span>
                              <span className={styles.scopeDesc}>{scope.description}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : (
                <span className={styles.settingsHint}>
                  {SCOPE_PRESETS[keyScopePreset]?.hint}
                </span>
              )}

              {keyScopes.includes("api_keys:write") ? (
                <div className={styles.scopeWarning}>
                  <ShieldAlert size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>
                    This key will be able to issue and revoke other runtime keys. If it leaks,
                    an attacker can mint themselves broader access. Grant it only to trusted
                    administrative tooling.
                  </span>
                </div>
              ) : null}

              {keyScopePreset === "custom" && keyScopes.length > 0 ? (
                <span className={styles.scopeSummary}>
                  {keyScopes.length} scope{keyScopes.length === 1 ? "" : "s"}:{" "}
                  {[...keyScopes].sort().join(", ")}
                </span>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="key-expiry" className={styles.fieldLabel}>
                Expires in
              </label>
              <select
                id="key-expiry"
                className={styles.select}
                value={keyExpiry}
                onChange={(event) => setKeyExpiry(event.target.value)}
              >
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
                <option value="never">Never</option>
              </select>
            </div>

            <div className={styles.formActions}>
              <Button variant="primary" type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create key"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        <div className={styles.card}>
          {loading ? (
            <div className={styles.empty}>
              <h3 className={styles.emptyTitle}>Loading keys…</h3>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className={styles.empty}>
              <h3 className={styles.emptyTitle}>No runtime keys yet</h3>
              <p className={styles.emptyDesc}>
                Runtime keys let your services read secrets without a user session. Create one
                for each deployment environment.
              </p>
              <Button variant="primary" onClick={() => setShowForm(true)}>
                Create first key
              </Button>
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Prefix</th>
                    <th>Scope</th>
                    <th>Permissions</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key) => (
                    <tr key={key.id}>
                      <td>
                        <div className={styles.tableProjectName}>{key.name}</div>
                      </td>
                      <td>
                        <span className={styles.tableSecretName}>{key.key_prefix}…</span>
                      </td>
                      <td>
                        <span className={styles.tableActor}>
                          {key.project_id
                            ? projects.find((p) => p.id === key.project_id)?.name ?? "project"
                            : "global"}
                        </span>
                      </td>
                      <td>
                        <span className={styles.tableActor} title={(key.scopes ?? []).join(", ")}>
                          {describeScopes(key.scopes)}
                        </span>
                      </td>
                      <td>
                        <span className={styles.tableTimestamp}>
                          {key.expires_at
                            ? new Date(key.expires_at).toLocaleDateString()
                            : "never"}
                        </span>
                      </td>
                      <td>
                        {key.grace_expires_at && new Date(key.grace_expires_at) > new Date() ? (
                          <span className={styles.rotatingBadge}>
                            expires {formatGraceDeadline(key.grace_expires_at)}
                          </span>
                        ) : (
                        <span className={styles.tableStatus}>
                          {key.is_active !== false ? (
                        <>
                        <span className={styles.tableStatusDot} />
                          active
                        </>
                      ) : (
                        <span style={{ color: "var(--text-dim)" }}>revoked</span>
                      )}
                        </span>
                      )}
                    </td>
                      <td style={{ textAlign: "right" }}>
                        {key.is_active !== false ? (
                          <div style={{ display: "inline-flex", gap: 4 }}>
                            <Button variant="ghost" onClick={() => setRotatingKey(key)} title="Rotate">
                              <RotateCw size={14} style={{ verticalAlign: "-2px" }} />
                            </Button>
                            <Button variant="ghost" onClick={() => handleRevoke(key.id, key.name)} title="Revoke">
                              <Trash2 size={14} style={{ verticalAlign: "-2px" }} />
                            </Button>
                          </div>
                        ) : (
                          <span className={styles.tableActor}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      {rotatingKey ? (
  <RotateKeyModal
    apiKey={rotatingKey}
    onClose={() => setRotatingKey(null)}
    onRotated={loadAll}
  />
) : null}
    </AppShell>
  );
}

function formatLimit(value?: number | null) {
  return value === null || value === undefined ? "∞" : String(value);
}

/** Collapse a raw scope list into the closest preset name. */
function describeScopes(scopes?: string[] | null): string {
  if (!Array.isArray(scopes) || scopes.length === 0) return "—";

  const set = new Set(scopes);

  if (set.has("api_keys:write")) return "admin";
  if (set.has("secrets:delete")) return "full";
  if (set.has("secrets:write")) return "deploy";
  if (set.has("secrets:reveal")) return "runtime";
  return "inventory";
}

function formatGraceDeadline(timestamp: string): string {
  const date = new Date(timestamp);
  const hours = Math.round((date.getTime() - Date.now()) / 3600000);
  if (hours < 1) return "in <1h";
  if (hours < 24) return `in ${hours}h`;
  return `in ${Math.round(hours / 24)}d`;
}