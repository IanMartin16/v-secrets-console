"use client";

import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { CodeBlock } from "@/components/CodeBlock";

import styles from "@/components/AppShell.module.css";

const API_BASE = process.env.NEXT_PUBLIC_VSECRETS_API_URL ?? "https://api.vsecrets.dev";

type Endpoint = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
};

const ENDPOINTS: { group: string; items: Endpoint[] }[] = [
  {
    group: "Projects",
    items: [
      { method: "GET", path: "/projects", description: "List every project in the workspace" },
      { method: "POST", path: "/projects", description: "Create a project" },
      { method: "PUT", path: "/projects/{id}", description: "Update name, description, or environment" },
    ],
  },
  {
    group: "Secrets",
    items: [
      {
        method: "GET",
        path: "/projects/{id}/secrets",
        description: "List secret metadata — values are never returned here",
      },
      { method: "POST", path: "/projects/{id}/secrets", description: "Store a new encrypted secret" },
      {
        method: "POST",
        path: "/projects/{id}/secrets/{key}/reveal",
        description: "Decrypt and return a value — writes an audit entry",
      },
    ],
  },
  {
    group: "Runtime keys",
    items: [
      { method: "GET", path: "/api-keys", description: "List keys with prefixes and status" },
      { method: "POST", path: "/api-keys", description: "Issue a key — the raw value is returned once" },
      { method: "DELETE", path: "/users/me/api-keys/{id}", description: "Revoke a key immediately" },
    ],
  },
  {
    group: "Account",
    items: [
      { method: "GET", path: "/users/me", description: "Current profile, plan, usage, and limits" },
      { method: "GET", path: "/audit-logs", description: "Activity trail — accepts a limit parameter" },
    ],
  },
];

export default function DocsPage() {
  return (
    <AppShell title="Docs">
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>Reference</p>
        <h1 className={styles.heroTitle}>API documentation</h1>
        <p className={styles.heroLede}>
          Everything in the console is available over the REST API. Base URL:{" "}
          <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.9em" }}>{API_BASE}</code>
        </p>
      </section>

      {/* ---------------- Authentication ---------------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Authentication</h2>
          <Link href="/quickstart" className={styles.sectionLink}>
            Quickstart guide →
          </Link>
        </div>

        <p className={styles.heroLede} style={{ marginBottom: 16, fontSize: 14 }}>
          Every request needs one of two credentials. Runtime keys are for services; bearer
          tokens are for user sessions in the console.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <CodeBlock
            label="runtime key"
            code={`curl ${API_BASE}/projects \\
  -H "X-API-Key: vault_xxxxxxxxxxxxxxxxxxxxxxxx"`}
          />
          <CodeBlock
            label="bearer token"
            code={`curl ${API_BASE}/users/me \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}
          />
        </div>
      </section>

      {/* ---------------- Endpoints ---------------- */}
      {ENDPOINTS.map((group) => (
        <section key={group.group} className={styles.section}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>{group.group}</h2>
          </div>

          <div className={styles.endpointList}>
            {group.items.map((endpoint) => (
              <div key={`${endpoint.method}-${endpoint.path}`} className={styles.endpointRow}>
                <span className={`${styles.method} ${methodClass(endpoint.method)}`}>
                  {endpoint.method}
                </span>
                <div>
                  <div className={styles.endpointPath}>{endpoint.path}</div>
                  <div className={styles.endpointDesc}>{endpoint.description}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* ---------------- Errors ---------------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Error responses</h2>
        </div>

        <div className={styles.settingsCard}>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>
              <span className={styles.settingsValueMono}>400</span> Bad request
            </div>
            <div className={styles.settingsValue}>
              Malformed body, or a duplicate key in the same project.
            </div>
          </div>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>
              <span className={styles.settingsValueMono}>401</span> Unauthorized
            </div>
            <div className={styles.settingsValue}>
              Missing, expired, or revoked credential. Re-authenticate.
            </div>
          </div>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>
              <span className={styles.settingsValueMono}>403</span> Forbidden
            </div>
            <div className={styles.settingsValue}>
              Valid credential, but scoped to a different project.
            </div>
          </div>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>
              <span className={styles.settingsValueMono}>404</span> Not found
            </div>
            <div className={styles.settingsValue}>
              The project or secret key doesn't exist in this workspace.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <CodeBlock
            label="error shape"
            code={`{
  "detail": "Secret with key 'DATABASE_URL' already exists"
}`}
          />
        </div>
      </section>

      {/* ---------------- Security model ---------------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Security model</h2>
        </div>

        <div className={styles.docsGrid}>
          <div className={styles.actionCard} style={{ cursor: "default" }}>
            <h3 className={styles.actionCardTitle}>Encryption at rest</h3>
            <p className={styles.actionCardDesc}>
              Values are encrypted with AES-256-GCM before they reach the database. Plaintext
              is never written to disk or to logs.
            </p>
          </div>

          <div className={styles.actionCard} style={{ cursor: "default" }}>
            <h3 className={styles.actionCardTitle}>Scoped access</h3>
            <p className={styles.actionCardDesc}>
              Runtime keys can be bound to a single project. A key scoped to staging cannot
              read production secrets.
            </p>
          </div>

          <div className={styles.actionCard} style={{ cursor: "default" }}>
            <h3 className={styles.actionCardTitle}>Full audit trail</h3>
            <p className={styles.actionCardDesc}>
              Every reveal records which credential requested it, from where, and whether it
              succeeded.
            </p>
          </div>

          <div className={styles.actionCard} style={{ cursor: "default" }}>
            <h3 className={styles.actionCardTitle}>Versioned secrets</h3>
            <p className={styles.actionCardDesc}>
              Updating a secret creates a new version rather than overwriting, so rotations
              stay reversible.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function methodClass(method: Endpoint["method"]): string {
  if (method === "GET") return styles.methodGet;
  if (method === "POST") return styles.methodPost;
  if (method === "PUT") return styles.methodPut;
  return styles.methodDelete;
}
