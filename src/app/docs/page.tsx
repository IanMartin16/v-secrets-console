import Link from "next/link";
import type { Metadata } from "next";

import styles from "./docs.module.css";

export const metadata: Metadata = {
  title: "API Documentation — V-Secrets",
  description:
    "REST API reference for V-Secrets: authentication, projects, secrets, runtime keys, rotation and audit logs. One header, standard HTTP, no SDK required.",
};

const API = "https://api.vsecrets.dev/api/v1";

export default function DocsPage() {
  return (
    <div className={styles.page}>
      {/* ---------------- Nav ---------------- */}
      <nav className={styles.nav}>
        <Link href="/" className={styles.brandMark} aria-label="V-Secrets home">
          <span className={styles.brandMarkIcon} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z" />
              <circle cx="12" cy="11" r="2" />
              <path d="M12 13v3" />
            </svg>
          </span>
          <span className={styles.brandMarkName}>V-Secrets</span>
          <span className={styles.brandDivider}>/</span>
          <span className={styles.brandSection}>Docs</span>
        </Link>

        <div className={styles.navLinks}>
          <Link href="/#pricing" className={styles.navLink}>Pricing</Link>
          <Link href="/login" className={styles.navLink}>Sign in</Link>
          <Link href="/register" className={styles.navCta}>Start free</Link>
        </div>
      </nav>

      <div className={styles.layout}>
        {/* ---------------- Sidebar ---------------- */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarGroup}>
            <div className={styles.sidebarLabel}>Getting started</div>
            <a href="#quickstart" className={styles.sidebarLink}>Quickstart</a>
            <a href="#auth" className={styles.sidebarLink}>Authentication</a>
            <a href="#scopes" className={styles.sidebarLink}>Scopes</a>
          </div>

          <div className={styles.sidebarGroup}>
            <div className={styles.sidebarLabel}>API reference</div>
            <a href="#projects" className={styles.sidebarLink}>Projects</a>
            <a href="#secrets" className={styles.sidebarLink}>Secrets</a>
            <a href="#keys" className={styles.sidebarLink}>Runtime keys</a>
            <a href="#audit" className={styles.sidebarLink}>Audit logs</a>
          </div>

          <div className={styles.sidebarGroup}>
            <div className={styles.sidebarLabel}>Guides</div>
            <a href="#rotation" className={styles.sidebarLink}>Rotating a key</a>
            <a href="#errors" className={styles.sidebarLink}>Error handling</a>
            <a href="#limits" className={styles.sidebarLink}>Rate limits</a>
          </div>
        </aside>

        {/* ---------------- Content ---------------- */}
        <main className={styles.content}>
          <header className={styles.docHeader}>
            <div className={styles.eyebrow}>API reference</div>
            <h1 className={styles.docTitle}>V-Secrets API</h1>
            <p className={styles.docLede}>
              Standard REST over HTTPS. One header for authentication, JSON in and out,
              nothing to install. Everything the console does is available here.
            </p>
            <div className={styles.baseUrl}>
              <span className={styles.baseUrlLabel}>Base URL</span>
              <code>{API}</code>
            </div>
          </header>

          {/* ============ Quickstart ============ */}
          <section className={styles.section} id="quickstart">
            <h2 className={styles.h2}>Quickstart</h2>
            <p className={styles.p}>
              From an empty workspace to reading an encrypted secret. Create the project and
              runtime key in the console, then everything else is API.
            </p>

            <h3 className={styles.h3}>Store a secret</h3>
            <pre className={styles.code}>{`curl -X POST ${API}/projects/$PROJECT_ID/secrets \\
  -H "X-API-Key: $VSECRETS_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "DATABASE_URL",
    "value": "postgresql://user:pass@host:5432/db",
    "description": "Primary database"
  }'`}</pre>

            <h3 className={styles.h3}>Read it back</h3>
            <p className={styles.p}>
              Reveal returns the decrypted value and writes an audit entry recording which
              credential asked for it.
            </p>
            <pre className={styles.code}>{`curl -X POST \\
  ${API}/projects/$PROJECT_ID/secrets/DATABASE_URL/reveal \\
  -H "X-API-Key: $VSECRETS_KEY"`}</pre>

            <pre className={styles.codeResponse}>{`{
  "key": "DATABASE_URL",
  "value": "postgresql://user:pass@host:5432/db",
  "version": 1,
  "updated_at": "2026-08-21T14:22:07Z"
}`}</pre>

            <div className={styles.callout}>
              <strong>Fetch once at boot.</strong> Read secrets at startup and hold them in
              memory. Calling reveal per request is slower and floods your audit log with
              noise you'll have to scroll past during an actual incident.
            </div>
          </section>

          {/* ============ Authentication ============ */}
          <section className={styles.section} id="auth">
            <h2 className={styles.h2}>Authentication</h2>
            <p className={styles.p}>
              Two credentials, for two different situations.
            </p>

            <h3 className={styles.h3}>Runtime keys</h3>
            <p className={styles.p}>
              For services, CI pipelines and scripts. Send as <code className={styles.inline}>X-API-Key</code>.
              Scopeable to a single project, revocable at any time, and never expiring unless
              you give them a date.
            </p>
            <pre className={styles.code}>{`curl ${API}/projects \\
  -H "X-API-Key: vsec_live_3loFSNE1..."`}</pre>

            <h3 className={styles.h3}>Bearer tokens</h3>
            <p className={styles.p}>
              For user sessions in the console. Short-lived, refreshed automatically. You
              generally won't use these directly.
            </p>
            <pre className={styles.code}>{`curl ${API}/users/me \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."`}</pre>

            <div className={styles.callout}>
              <strong>The raw key is shown once.</strong> At creation and never again — the
              database stores an HMAC-SHA256 hash, not the key. Lost it? Rotate rather than
              creating a new one, so the audit trail keeps the connection.
            </div>
          </section>

          {/* ============ Scopes ============ */}
          <section className={styles.section} id="scopes">
            <h2 className={styles.h2}>Scopes</h2>
            <p className={styles.p}>
              Runtime keys carry explicit permissions. The read/reveal split is the one worth
              understanding: <code className={styles.inline}>secrets:read</code> returns names
              and metadata, while <code className={styles.inline}>secrets:reveal</code> is what
              actually decrypts a value.
            </p>

            <div className={styles.table}>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>projects:read</code>
                <span className={styles.tableVal}>List projects and read their metadata</span>
              </div>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>projects:write</code>
                <span className={styles.tableVal}>Create and update projects</span>
              </div>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>secrets:read</code>
                <span className={styles.tableVal}>List secret keys — values stay hidden</span>
              </div>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>secrets:reveal</code>
                <span className={styles.tableVal}>Decrypt and return secret values</span>
              </div>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>secrets:write</code>
                <span className={styles.tableVal}>Create and update secrets</span>
              </div>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>secrets:delete</code>
                <span className={styles.tableVal}>Permanently remove secrets</span>
              </div>
              <div className={styles.tableRow}>
                <code className={styles.tableKeyDanger}>api_keys:write</code>
                <span className={styles.tableVal}>
                  Issue and revoke other runtime keys
                  <span className={styles.tableNote}>
                    A key with this scope can mint itself broader access. Grant it only to
                    administrative tooling — revoking the original won't contain a leak.
                  </span>
                </span>
              </div>
            </div>

            <h3 className={styles.h3}>Common combinations</h3>
            <div className={styles.table}>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>Inventory</code>
                <span className={styles.tableVal}>
                  <code className={styles.inline}>projects:read</code>{" "}
                  <code className={styles.inline}>secrets:read</code>
                  <span className={styles.tableNote}>
                    Dashboards and drift checks — sees what exists, decrypts nothing.
                  </span>
                </span>
              </div>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>Runtime</code>
                <span className={styles.tableVal}>
                  <code className={styles.inline}>+ secrets:reveal</code>
                  <span className={styles.tableNote}>
                    What a deployed service needs, and nothing more.
                  </span>
                </span>
              </div>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>Deploy</code>
                <span className={styles.tableVal}>
                  <code className={styles.inline}>+ secrets:write</code>
                  <span className={styles.tableNote}>
                    Provisioning tooling and CI, not a running app.
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* ============ Projects ============ */}
          <section className={styles.section} id="projects">
            <h2 className={styles.h2}>Projects</h2>
            <p className={styles.p}>
              Projects group secrets and are the unit of cryptographic isolation — each has
              its own derived encryption key, so compromising one doesn't expose another.
            </p>

            <Endpoint method="GET" path="/projects" desc="List every project in the workspace" />
            <Endpoint method="POST" path="/projects" desc="Create a project" />
            <Endpoint method="PUT" path="/projects/{id}" desc="Update name, description or environment" />

            <pre className={styles.code}>{`curl -X POST ${API}/projects \\
  -H "X-API-Key: $VSECRETS_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "checkout-production",
    "description": "Payment service credentials",
    "environment": "production"
  }'`}</pre>
          </section>

          {/* ============ Secrets ============ */}
          <section className={styles.section} id="secrets">
            <h2 className={styles.h2}>Secrets</h2>
            <p className={styles.p}>
              Values are encrypted with AES-256-GCM before reaching the database. Each
              ciphertext is bound to its project, key name and version — moving encrypted
              data between projects makes decryption fail rather than silently succeed.
            </p>

            <Endpoint
              method="GET"
              path="/projects/{id}/secrets"
              desc="List secret metadata — values are never returned here"
            />
            <Endpoint method="POST" path="/projects/{id}/secrets" desc="Store a new secret" />
            <Endpoint
              method="POST"
              path="/projects/{id}/secrets/{key}/reveal"
              desc="Decrypt and return a value, writing an audit entry"
            />

            <h3 className={styles.h3}>Versioning</h3>
            <p className={styles.p}>
              Updating a secret creates a new version rather than overwriting. Rotations stay
              reversible, and the audit trail keeps the history intact.
            </p>
          </section>

          {/* ============ Runtime keys ============ */}
          <section className={styles.section} id="keys">
            <h2 className={styles.h2}>Runtime keys</h2>

            <Endpoint method="GET" path="/api-keys" desc="List keys with prefixes, scopes and status" />
            <Endpoint method="POST" path="/api-keys" desc="Issue a key — the raw value is returned once" />
            <Endpoint method="POST" path="/api-keys/{id}/rotate" desc="Replace a key, with a grace period" />
            <Endpoint method="DELETE" path="/users/me/api-keys/{id}" desc="Revoke immediately" />

            <pre className={styles.code}>{`curl -X POST ${API}/api-keys \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "checkout-service",
    "project_id": "b3f2...",
    "scopes": ["projects:read", "secrets:read", "secrets:reveal"],
    "expires_in_days": 90
  }'`}</pre>
          </section>

          {/* ============ Rotation ============ */}
          <section className={styles.section} id="rotation">
            <h2 className={styles.h2}>Rotating a key</h2>
            <p className={styles.p}>
              Rotation issues a replacement with identical scopes and project binding, and
              keeps the old key working for a grace period. Your services pick up the new
              value on their own deploy cycle instead of needing a coordinated cutover.
            </p>

            <pre className={styles.code}>{`curl -X POST ${API}/api-keys/$KEY_ID/rotate \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"grace_period_hours": 24}'`}</pre>

            <pre className={styles.codeResponse}>{`{
  "new_key": {
    "id": "9f1c...",
    "api_key": "vsec_live_3loFSNE1...",
    "key_prefix": "vsec_live_3loFSNE1"
  },
  "old_key_prefix": "vsec_live_yCknU6v3",
  "grace_expires_at": "2026-08-22T14:22:07Z",
  "message": "Key rotated. The previous key keeps working until..."
}`}</pre>

            <div className={styles.callout}>
              <strong>Rotate on suspicion, not on schedule.</strong> This is incident
              response — a leaked key, a departed contractor, a repository that went public.
              Once the grace period closes, anything still using the old key stops
              authenticating.
            </div>

            <p className={styles.p}>
              Set <code className={styles.inline}>grace_period_hours</code> to{" "}
              <code className={styles.inline}>0</code> to revoke the old key immediately.
              Use that when the key is known to be compromised and you'd rather take the
              outage than leave it live.
            </p>
          </section>

          {/* ============ Audit ============ */}
          <section className={styles.section} id="audit">
            <h2 className={styles.h2}>Audit logs</h2>
            <p className={styles.p}>
              Every read, write and reveal is recorded with the credential that made it,
              the source address, and the outcome.
            </p>

            <Endpoint method="GET" path="/audit-logs?limit=100" desc="Recent activity, newest first" />

            <pre className={styles.codeResponse}>{`{
  "action": "POST",
  "resource_type": "secret",
  "request_path": "/projects/b3f2.../secrets/STRIPE_KEY/reveal",
  "api_key_id": "9f1c...",
  "ip_address": "203.0.113.42",
  "status_code": 200,
  "created_at": "2026-08-21T14:22:07Z"
}`}</pre>

            <p className={styles.p}>
              When <code className={styles.inline}>api_key_id</code> is null, the request came
              from a user session rather than a runtime key.
            </p>
          </section>

          {/* ============ Errors ============ */}
          <section className={styles.section} id="errors">
            <h2 className={styles.h2}>Error handling</h2>
            <p className={styles.p}>
              Errors return a JSON body with a <code className={styles.inline}>detail</code>{" "}
              field describing what went wrong.
            </p>

            <pre className={styles.codeResponse}>{`{
  "detail": "Secret with key 'DATABASE_URL' already exists"
}`}</pre>

            <div className={styles.table}>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>400</code>
                <span className={styles.tableVal}>Malformed body, or a duplicate key in the project</span>
              </div>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>401</code>
                <span className={styles.tableVal}>
                  Missing, expired or revoked credential
                  <span className={styles.tableNote}>
                    Also returned when a rotated key is used after its grace period ended.
                  </span>
                </span>
              </div>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>402</code>
                <span className={styles.tableVal}>
                  Plan limit reached
                  <span className={styles.tableNote}>
                    The request was valid and authorized — the account needs a higher plan.
                  </span>
                </span>
              </div>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>403</code>
                <span className={styles.tableVal}>Valid credential, but scoped elsewhere</span>
              </div>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>404</code>
                <span className={styles.tableVal}>Project or secret doesn't exist in this workspace</span>
              </div>
            </div>
          </section>

          {/* ============ Limits ============ */}
          <section className={styles.section} id="limits">
            <h2 className={styles.h2}>Rate limits</h2>
            <p className={styles.p}>
              Limits scale with plan. Exceeding them returns{" "}
              <code className={styles.inline}>429</code> — back off and retry.
            </p>

            <div className={styles.table}>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>Free</code>
                <span className={styles.tableVal}>100 requests/minute</span>
              </div>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>Pro</code>
                <span className={styles.tableVal}>1,000 requests/minute</span>
              </div>
              <div className={styles.tableRow}>
                <code className={styles.tableKey}>Business</code>
                <span className={styles.tableVal}>2,500 requests/minute</span>
              </div>
            </div>

            <div className={styles.callout}>
              <strong>You shouldn't be near these.</strong> Fetching secrets at boot means a
              handful of calls per deploy. Hitting a rate limit usually means something is
              calling reveal in a request handler.
            </div>
          </section>

          <footer className={styles.docFooter}>
            <p className={styles.p}>
              Something unclear or missing?{" "}
              <a href="mailto:support@vsecrets.dev" className={styles.link}>
                support@vsecrets.dev
              </a>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function Endpoint({
  method,
  path,
  desc,
}: {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  desc: string;
}) {
  const methodClass =
    method === "GET"
      ? styles.methodGet
      : method === "POST"
        ? styles.methodPost
        : method === "PUT"
          ? styles.methodPut
          : styles.methodDelete;

  return (
    <div className={styles.endpoint}>
      <span className={`${styles.method} ${methodClass}`}>{method}</span>
      <div>
        <code className={styles.endpointPath}>{path}</code>
        <div className={styles.endpointDesc}>{desc}</div>
      </div>
    </div>
  );
}
