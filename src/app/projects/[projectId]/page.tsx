"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Copy, Eye, KeyRound, LockKeyhole, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { SecretRevealModal } from "@/components/SecretRevealModal";
import {
  createSecret,
  getProjectSecrets,
  getProjects,
  createApiKey,
  getApiKeys,
  revealSecret,
} from "@/lib/api";
import type { Project, Secret, UserProfile, ApiKey } from "@/lib/types";
import { RuntimeKeyCreatedModal } from "@/components/RuntimeKeyCreatedModal";
import { updateProject, revokeApiKey } from "@/lib/api";
import { StatCard } from "@/components/StatCard";


export default function ProjectDetailPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const [projects, setProjects] = useState<Project[]>([]);
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [activeTab, setActiveTab] = useState<
    "secrets" | "runtime" | "quickstart"
  >("secrets");

  const [showSecretForm, setShowSecretForm] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [secretValue, setSecretValue] = useState("");
  const [secretDescription, setSecretDescription] = useState("");

  const [revealed, setRevealed] = useState<{
    key: string;
    value: string;
  } | null>(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingSecrets, setLoadingSecrets] = useState(false);
  const [creatingSecret, setCreatingSecret] = useState(false);
  const [revealingKey, setRevealingKey] = useState<string | null>(null);

  const [quickstartRuntimeKey, setQuickstartRuntimeKey] = useState("");
  const [quickstartSecretName, setQuickstartSecretName] = useState("OPENAI_API_KEY");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);
  
  const [showEditProject, setShowEditProject] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEnvironment, setEditEnvironment] = useState("production");
  const [editColor, setEditColor] = useState("#3B82F6");
  const [savingProject, setSavingProject] = useState(false);
  const [revokingKeyId, setRevokingKeyId] = useState<string | null>(null);

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showRuntimeForm, setShowRuntimeForm] = useState(false);
  const [runtimeName, setRuntimeName] = useState("nexus-runtime");
  const [runtimeExpiration, setRuntimeExpiration] = useState("30");
  const [runtimeScopes, setRuntimeScopes] = useState<string[]>([
    "projects:read",
    "secrets:read",
    "secrets:reveal",
  ]);
  const [creatingRuntimeKey, setCreatingRuntimeKey] = useState(false);
  const [createdRuntimeKey, setCreatedRuntimeKey] = useState<string | null>(null);

  const activeRuntimeKeys = apiKeys.filter((key) => key.is_active !== false).length;
  const totalRuntimeKeys = apiKeys.length;
  const [user, setUser] = useState<UserProfile | null>(null);

  const availableScopes = [
    {
      value: "projects:read",
      label: "Read projects",
      description: "Allows the app to list and access scoped projects.",
    },
    {
      value: "secrets:read",
      label: "Read secrets metadata",
      description: "Allows the app to list secret names and metadata.",
    },
    {
      value: "secrets:reveal",
      label: "Reveal secrets",
      description: "Allows the app to retrieve decrypted secret values.",
    },
    {
      value: "secrets:write",
      label: "Create secrets",
      description: "Allows the app to create new secrets.",
    },
    {
      value: "secrets:update",
      label: "Update secrets",
      description: "Allows the app to update existing secrets.",
    },
    {
      value: "secrets:delete",
      label: "Delete secrets",
      description: "Allows the app to delete secrets.",
    },
  ];


  const project = useMemo(
    () => projects.find((item) => item.id === projectId),
    [projects, projectId]
  );

  async function loadProjectData() {
    setError("");

    try {
      const [projectList, secretList, apiKeyList] = await Promise.all([
        getProjects(),
        getProjectSecrets(projectId),
        getApiKeys(),
    ]);

    setProjects(projectList);
    setSecrets(secretList);
    setApiKeys(apiKeyList.filter((key) => key.project_id === projectId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    }
  }

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      setLoadingSecrets(true);

      Promise.all([getProjects(), getProjectSecrets(projectId), getApiKeys()])
        .then(([projectList, secretList, apiKeyList]) => {
          if (!active) return;

          setProjects(projectList);
          setSecrets(secretList);
          setApiKeys(apiKeyList.filter((key) => key.project_id === projectId));
        })
        .catch((err) => {
          if (!active) return;
          setError(err instanceof Error ? err.message : "Failed to load project");
        })
        .finally(() => {
          if (!active) return;
          setLoadingSecrets(false);
        });
    });

    return () => {
      active = false;
    };
  }, [projectId]);

  async function copyText(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedSnippet(label);

    window.setTimeout(() => {
      setCopiedSnippet(null);
    }, 1800);
  }

  const baseUrl = "https://api.vsecrets.dev";

  const envSnippet = `VSECRETS_BASE_URL=${baseUrl}
  VSECRETS_PROJECT_ID=${projectId}
  VSECRETS_API_KEY=${quickstartRuntimeKey || "vsec_live_xxxxx"}`;

  const curlSnippet = `curl -X POST "$VSECRETS_BASE_URL/api/v1/projects/$VSECRETS_PROJECT_ID/secrets/${quickstartSecretName}/reveal" \\
    -H "X-API-Key: $VSECRETS_API_KEY"`;

  const pythonSnippet = `import os
  import requests

  base_url = os.getenv("VSECRETS_BASE_URL")
  project_id = os.getenv("VSECRETS_PROJECT_ID")
  api_key = os.getenv("VSECRETS_API_KEY")

  secret_name = "${quickstartSecretName}"

  response = requests.post(
      f"{base_url}/api/v1/projects/{project_id}/secrets/{secret_name}/reveal",
      headers={"X-API-Key": api_key},
      timeout=10,
  )

  response.raise_for_status()

  ${quickstartSecretName.toLowerCase()} = response.json()["value"]

  print("Secret loaded from V-Secrets")`;

  const nodeSnippet = `const baseUrl = process.env.VSECRETS_BASE_URL;
  const projectId = process.env.VSECRETS_PROJECT_ID;
  const apiKey = process.env.VSECRETS_API_KEY;

  const secretName = "${quickstartSecretName}";

  const response = await fetch(
    \`\${baseUrl}/api/v1/projects/\${projectId}/secrets/\${secretName}/reveal\`,
    {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load secret from V-Secrets");
  }

  const data = await response.json();
  const secretValue = data.value;

  console.log("Secret loaded from V-Secrets");`;

    function toggleRuntimeScope(scope: string) {
      setRuntimeScopes((current) =>
        current.includes(scope)
          ? current.filter((item) => item !== scope)
          : [...current, scope]
      );
    }

    async function handleCreateRuntimeKey(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      setError("");
      setSuccess("");
      setCreatingRuntimeKey(true);

      try {
        const response = await createApiKey({
          name: runtimeName,
          expires_in_days: runtimeExpiration
            ? Number(runtimeExpiration)
            : null,
          project_id: projectId,
          scopes: runtimeScopes,
        });

        setCreatedRuntimeKey(response.api_key);
        setShowRuntimeForm(false);
        setRuntimeName("nexus-runtime");
        setRuntimeExpiration("30");
        setRuntimeScopes(["projects:read", "secrets:read", "secrets:reveal"]);
        setSuccess("Runtime key created.");
        await loadProjectData();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create runtime key"
        );
      } finally {
        setCreatingRuntimeKey(false);
      }
    }

  async function handleCreateSecret(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setCreatingSecret(true);

    try {
      await createSecret(projectId, {
        key: secretKey.trim(),
        value: secretValue,
        description: secretDescription,
      });

      setSecretKey("");
      setSecretValue("");
      setSecretDescription("");
      setShowSecretForm(false);
      setSuccess("Secret saved encrypted.");
      await loadProjectData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create secret");
    } finally {
      setCreatingSecret(false);
    }
  }

  async function handleReveal(key: string) {
    const confirmed = window.confirm(
      `Reveal sensitive secret "${key}"?\n\nOnly reveal secrets when strictly necessary.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setRevealingKey(key);

    try {
      const response = await revealSecret(projectId, key);
      setRevealed({
        key: response.key,
        value: response.value,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reveal secret");
    } finally {
      setRevealingKey(null);
    }
  }

  async function copyProjectId() {
    await navigator.clipboard.writeText(projectId);
    setSuccess("Project ID copied.");
  }

  function openEditProject() {
    if (!project) return;

    setEditName(project.name);
    setEditDescription(project.description || "");
    setEditEnvironment(project.environment || "production");
    setEditColor(project.color || "#3B82F6");
    setShowEditProject(true);
  }

  async function handleUpdateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!project) return;

    setError("");
    setSavingProject(true);

    try {
      await updateProject(project.id, {
        name: editName,
        description: editDescription,
        environment: editEnvironment,
        color: editColor,
      });

      setShowEditProject(false);
      await loadProjectData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setSavingProject(false);
    }
  }

  async function handleRevokeApiKey(apiKeyId: string, keyName?: string) {
    const confirmed = window.confirm(
      `Revoke ${keyName || "this runtime key"}? Apps using this key will stop working.`
    );

    if (!confirmed) return;

    setError("");
    setRevokingKeyId(apiKeyId);

    try {
      await revokeApiKey(apiKeyId);
      await loadProjectData();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to revoke runtime key";

      if (message.toLowerCase().includes("api key not found")) {
        await loadProjectData();
        return;
      }

      setError(message);
    } finally {
      setRevokingKeyId(null);
    }
  }
  const activeApiKeysCount = apiKeys.filter(
    (key) => key.is_active !== false
  ).length;

  function formatLimit(value?: number | null) {
    return value === null || value === undefined ? "Unlimited" : String(value);
  }

  return (
    <AppShell title="Project detail">
      {revealed ? (
        <SecretRevealModal
          secretKey={revealed.key}
          value={revealed.value}
          onClose={() => setRevealed(null)}
        />
      ) : null}
      {createdRuntimeKey ? (
        <RuntimeKeyCreatedModal
          apiKey={createdRuntimeKey}
          onClose={() => setCreatedRuntimeKey(null)}
        />
      ) : null}  

      <section className="hero">
        <h1>{project?.name || "Project"}</h1>
        <p>{project?.description || "Manage secrets and runtime access keys."}</p>
      </section>

      {error ? <div className="error section">{error}</div> : null}
      {success ? <div className="success section">{success}</div> : null}

      <section className="section card">
        <div className="grid project-meta-grid">
          <div>
            <div className="meta-label">Environment</div>
            <strong>
              <span className="badge">{project?.environment || "production"}</span>
            </strong>
          </div>

          <div>
            <div className="meta-label">Project ID</div>
            <div className="project-id-row">
              <strong>{projectId}</strong>
              <button className="small-copy-button" onClick={copyProjectId}>
                <Copy size={14} />
              </button>
            </div>
          </div>

          <div>
            <div className="meta-label">Secrets</div>
            <strong>{secrets.length}</strong>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="actions">
          <Button
            variant={activeTab === "secrets" ? "primary" : "ghost"}
            onClick={() => setActiveTab("secrets")}
          >
            <LockKeyhole size={16} />
            Secrets
          </Button>

          <Button
            variant={activeTab === "runtime" ? "primary" : "ghost"}
            onClick={() => setActiveTab("runtime")}
          >
            <KeyRound size={16} />
            Runtime Keys
          </Button>
          <Button variant="ghost" onClick={openEditProject}>
            Edit project
          </Button>
        </div>

        <section className="section card table-card">
            <div
              style={{
                padding: 22,
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              <h2 style={{ margin: 0 }}>Runtime Keys</h2>
              <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
                Scoped keys used by applications to retrieve secrets at runtime.
              </p>
            </div>

            {apiKeys.length === 0 ? (
              <div className="empty">
                <h3>No runtime keys yet</h3>
                <p>Create a runtime key to let your app retrieve secrets securely.</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Project</th>
                    <th>Last used</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {apiKeys.map((key) => (
                    <tr key={key.id}>
                      <td>
                        <strong>{key.name}</strong>
                        <div style={{ color: "var(--muted)", fontSize: 13 }}>
                          {key.key_prefix || "Runtime key"}
                        </div>
                      </td>

                      <td>
                        <span className={key.is_active === false ? "badge badge-muted" : "badge"}>
                          {key.is_active === false ? "Revoked" : "Active"}
                        </span>
                      </td>

                      <td>
                        <code>{key.project_id || "Global"}</code>
                      </td>

                      <td>
                        {key.last_used_at
                          ? new Date(key.last_used_at).toLocaleString()
                          : "Never"}
                      </td>

                      <td>
                        {key.is_active === false ? (
                        <span className="badge">Revoked</span>
                      ) : (
                        <Button
                          variant="ghost"
                          onClick={() => handleRevokeApiKey(key.id, key.name)}
                          disabled={revokingKeyId === key.id}
                        >
                          {revokingKeyId === key.id ? "Revoking..." : "Revoke"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </section>

        {activeTab === "secrets" ? (
          <div className="section">
            <div className="section-header">
              <div>
                <h2>Secrets</h2>
                <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
                  Store encrypted API keys, tokens and application credentials.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => setShowSecretForm((value) => !value)}
              >
                <Plus size={16} />
                Add Secret
              </Button>
            </div>

            {showEditProject ? (
              <div className="modal-backdrop">
                <form className="modal-card form" onSubmit={handleUpdateProject}>
                  <div className="modal-header">
                    <div>
                      <h2>Edit project</h2>
                      <p>{project?.id}</p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowEditProject(false)}
                    >
                      Close
                    </Button>
                  </div>

                  <div className="field">
                    <label>Project name</label>
                    <input
                      value={editName}
                      onChange={(event) => setEditName(event.target.value)}
                      required
                      placeholder="Nexus"
                    />
                  </div>

                  <div className="field">
                    <label>Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(event) => setEditDescription(event.target.value)}
                      rows={3}
                      placeholder="Runtime secrets for this application"
                    />
                  </div>

                  <div className="field">
                    <label>Environment</label>
                    <select
                      value={editEnvironment}
                      onChange={(event) => setEditEnvironment(event.target.value)}
                    >
                      <option value="development">development</option>
                      <option value="staging">staging</option>
                      <option value="production">production</option>
                    </select>
                  </div>

                  <div className="field">
                    <label>Color</label>
                    <input
                      type="color"
                      value={editColor}
                      onChange={(event) => setEditColor(event.target.value)}
                    />
                  </div>

                  <div className="actions">
                    <Button variant="primary" type="submit" disabled={savingProject}>
                      {savingProject ? "Saving..." : "Save changes"}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowEditProject(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            ) : null}

            {showSecretForm ? (
              <form className="card form" onSubmit={handleCreateSecret}>
                <div className="field">
                  <label>Secret key</label>
                  <input
                    value={secretKey}
                    onChange={(event) => setSecretKey(event.target.value)}
                    placeholder="OPENAI_API_KEY"
                    required
                  />
                </div>

                <div className="field">
                  <label>Secret value</label>
                  <input
                    type="password"
                    value={secretValue}
                    onChange={(event) => setSecretValue(event.target.value)}
                    placeholder="sk-..."
                    required
                  />
                </div>

                <div className="field">
                  <label>Description</label>
                  <textarea
                    value={secretDescription}
                    onChange={(event) =>
                      setSecretDescription(event.target.value)
                    }
                    placeholder="OpenAI key used by Nexus runtime"
                    rows={3}
                  />
                </div>

                <div className="actions">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={creatingSecret}
                  >
                    {creatingSecret ? "Saving..." : "Save encrypted secret"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowSecretForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : null}

            <div className="card table-card" style={{ marginTop: 18 }}>
              {loadingSecrets ? (
                <div className="empty">Loading secrets...</div>
              ) : secrets.length === 0 ? (
                <EmptyState
                  title="No secrets yet"
                  description="Add your first API key and retrieve it from your app in minutes."
                  action={
                    <Button
                      variant="primary"
                      onClick={() => setShowSecretForm(true)}
                    >
                      Add first secret
                    </Button>
                  }
                />
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Description</th>
                      <th>Updated</th>
                      <th>Security</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {secrets.map((secret) => (
                      <tr key={secret.key}>
                        <td>
                          <strong style={{ fontFamily: "monospace" }}>
                            {secret.key}
                          </strong>
                        </td>

                        <td>
                          {secret.description || (
                            <span style={{ color: "var(--muted)" }}>
                              No description
                            </span>
                          )}
                        </td>

                        <td>
                          {secret.updated_at
                            ? new Date(secret.updated_at).toLocaleString()
                            : "—"}
                        </td>

                        <td>
                          <span className="badge">encrypted</span>
                        </td>

                        <td>
                          <Button
                            variant="ghost"
                            onClick={() => handleReveal(secret.key)}
                            disabled={revealingKey === secret.key}
                          >
                            <Eye size={16} />
                            {revealingKey === secret.key
                              ? "Revealing..."
                              : "Reveal"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ) : null}

        {activeTab === "runtime" ? (
          <div className="section">
            <div className="section-header">
              <div>
                <h2>Runtime Keys</h2>
                <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
                  Runtime keys let your apps retrieve secrets without exposing the
                  original credentials.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => setShowRuntimeForm((value) => !value)}
              >
                <Plus size={16} />
                Create Runtime Key
              </Button>
            </div>

            {showRuntimeForm ? (
              <form className="card form" onSubmit={handleCreateRuntimeKey}>
                <div className="field">
                  <label>Runtime key name</label>
                  <input
                    value={runtimeName}
                    onChange={(event) => setRuntimeName(event.target.value)}
                    placeholder="nexus-runtime"
                    required
                  />
                </div>

                <div className="field">
                  <label>Expiration</label>
                  <select
                    value={runtimeExpiration}
                    onChange={(event) => setRuntimeExpiration(event.target.value)}
                  >
                    <option value="1">1 day</option>
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="">Never</option>
                  </select>
                </div>

                <div className="field">
                  <label>Permissions</label>

                  <div className="scope-grid">
                    {availableScopes.map((scope) => {
                      const checked = runtimeScopes.includes(scope.value);

                      return (
                        <label
                          key={scope.value}
                          className={`scope-card ${checked ? "checked" : ""}`}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleRuntimeScope(scope.value)}
                          />

                          <div>
                            <strong>{scope.label}</strong>
                            <p>{scope.description}</p>
                            <code>{scope.value}</code>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="actions">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={creatingRuntimeKey || runtimeScopes.length === 0}
                  >
                    {creatingRuntimeKey ? "Creating..." : "Create runtime key"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowRuntimeForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : null}

            <div className="card table-card" style={{ marginTop: 18 }}>
              {apiKeys.length === 0 ? (
                <EmptyState
                  title="No runtime keys yet"
                  description="Create a scoped runtime key so your app can retrieve secrets securely."
                  action={
                    <Button variant="primary" onClick={() => setShowRuntimeForm(true)}>
                      Create first runtime key
                    </Button>
                  }
                />
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Key Prefix</th>
                      <th>Permissions</th>
                      <th>Expires</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {apiKeys.map((apiKey) => (
                      <tr key={apiKey.id}>
                        <td>
                          <strong>{apiKey.name}</strong>
                        </td>

                      <td>
                        <code>{apiKey.key_prefix || "hidden"}</code>
                      </td>

                      <td>
                        <div className="scope-list">
                          {apiKey.scopes?.map((scope) => (
                            <span className="badge" key={scope}>
                              {scope}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td>
                        {apiKey.expires_at
                          ? new Date(apiKey.expires_at).toLocaleDateString()
                          : "Never"}
                      </td>

                      <td>
                        <span className="badge">
                          {apiKey.is_active === false ? "inactive" : "active"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : null}

        {activeTab === "quickstart" ? (
          <div className="section">
            <div className="section-header">
              <div>
                <h2>Connect your app</h2>
                <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
                  Store real API keys in V-Secrets. Keep only your scoped runtime key in
                  your app environment.
                </p>
              </div>
            </div>

            <div className="card quickstart-note">
              <strong>How this works</strong>
              <p>
                Your app does not store <code>{quickstartSecretName}</code> directly.
                Instead, it stores a limited <code>VSECRETS_API_KEY</code> and asks
                V-Secrets to reveal only the secrets this runtime key is allowed to
                access.
              </p>
            </div>

            <div className="grid quickstart-grid">
              <div className="card form">
                <h3>Quickstart settings</h3>

                <div className="field">
                  <label>Secret name to retrieve</label>
                  <select
                    value={quickstartSecretName}
                    onChange={(event) => setQuickstartSecretName(event.target.value)}
                  >
                    {secrets.length === 0 ? (
                      <option value="OPENAI_API_KEY">OPENAI_API_KEY</option>
                        ) : (
                          secrets.map((secret) => (
                            <option key={secret.key} value={secret.key}>
                              {secret.key}
                            </option>
                        ))
                    )}
                  </select>
                </div>

                <div className="field">
                  <label>Runtime API key</label>
                  <input
                    value={quickstartRuntimeKey}
                    onChange={(event) => setQuickstartRuntimeKey(event.target.value)}
                    placeholder="vsec_live_xxxxx"
                  />
                </div>

                <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
                  Runtime keys are sensitive, but they are scoped, revocable and can
                  expire. Do not paste real production keys in screenshots or chats.
                </p>
              </div>

              <div className="card">
                <h3>Recommended app .env</h3>

                <pre className="code-block">{envSnippet}</pre>

                <Button
                  variant="ghost"
                  onClick={() => copyText("env", envSnippet)}
                >
                  {copiedSnippet === "env" ? "Copied" : "Copy .env"}
                </Button>
              </div>
            </div>

            <div className="section card">
              <div className="section-header">
                <div>
                  <h3>cURL</h3>
                  <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
                    Validate the runtime key and secret retrieval from your terminal.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => copyText("curl", curlSnippet)}
                >
                  {copiedSnippet === "curl" ? "Copied" : "Copy cURL"}
                </Button>
              </div>

              <pre className="code-block">{curlSnippet}</pre>
            </div>

            <div className="section card">
              <div className="section-header">
                <div>
                  <h3>Python</h3>
                  <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
                    Load secrets at runtime from a Python backend or worker.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => copyText("python", pythonSnippet)}
                >
                  {copiedSnippet === "python" ? "Copied" : "Copy Python"}
                </Button>
              </div>

              <pre className="code-block">{pythonSnippet}</pre>
            </div>

            <div className="section card">
              <div className="section-header">
                <div>
                  <h3>Node / TypeScript</h3>
                  <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
                    Retrieve secrets from a Node.js, Next.js or Express service.
                  </p>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => copyText("node", nodeSnippet)}
                >
                  {copiedSnippet === "node" ? "Copied" : "Copy Node"}
                </Button>
              </div>

              <pre className="code-block">{nodeSnippet}</pre>
            </div>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}