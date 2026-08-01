"use client";

import Link from "next/link";

import { AppShell } from "@/components/AppShell";
import { CodeBlock, TabbedCode } from "@/components/CodeBlock";

import styles from "@/components/AppShell.module.css";

const API_BASE = process.env.NEXT_PUBLIC_VSECRETS_API_URL ?? "https://api.vsecrets.dev";

export default function QuickstartPage() {
  return (
    <AppShell title="Quickstart">
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>Get running</p>
        <h1 className={styles.heroTitle}>Quickstart</h1>
        <p className={styles.heroLede}>
          From an empty workspace to reading an encrypted secret from your app — four steps,
          about five minutes.
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.stepList}>
          {/* ---------------- Step 1 ---------------- */}
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepBody}>
              <h2 className={styles.stepTitle}>Create a project</h2>
              <p className={styles.stepDesc}>
                Projects group secrets by app or environment. Each one gets its own encryption
                context, so a compromised key in staging never touches production.
              </p>
              <div>
                <Link href="/projects" className={styles.planCta} style={{ display: "inline-block", padding: "8px 16px" }}>
                  Go to Projects →
                </Link>
              </div>
            </div>
          </div>

          {/* ---------------- Step 2 ---------------- */}
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepBody}>
              <h2 className={styles.stepTitle}>Issue a runtime key</h2>
              <p className={styles.stepDesc}>
                Runtime keys authenticate your services without a password. Scope one to a
                single project, or leave it global. The key is shown once at creation — store
                it in your deployment environment immediately.
              </p>
              <div>
                <Link href="/settings" className={styles.planCta} style={{ display: "inline-block", padding: "8px 16px" }}>
                  Create a key in Settings →
                </Link>
              </div>
            </div>
          </div>

          {/* ---------------- Step 3 ---------------- */}
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepBody}>
              <h2 className={styles.stepTitle}>Store a secret</h2>
              <p className={styles.stepDesc}>
                Write a secret through the API. The value is encrypted with AES-256-GCM before
                it touches the database — plaintext never lands on disk.
              </p>
              <CodeBlock
                label="bash"
                code={`curl -X POST ${API_BASE}/projects/$PROJECT_ID/secrets \\
  -H "X-API-Key: $VSECRETS_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "key": "DATABASE_URL",
    "value": "postgresql://user:pass@host:5432/db",
    "description": "Primary database"
  }'`}
              />
            </div>
          </div>

          {/* ---------------- Step 4 ---------------- */}
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepBody}>
              <h2 className={styles.stepTitle}>Read it from your app</h2>
              <p className={styles.stepDesc}>
                Reveal returns the decrypted value and writes an audit entry. Fetch secrets at
                boot and keep them in memory — don't write them back to disk.
              </p>
              <TabbedCode
                tabs={[
                  {
                    label: "node",
                    code: `const res = await fetch(
  \`${API_BASE}/projects/\${projectId}/secrets/DATABASE_URL/reveal\`,
  {
    method: "POST",
    headers: { "X-API-Key": process.env.VSECRETS_KEY },
  }
);

const { value } = await res.json();
// value === "postgresql://user:pass@host:5432/db"`,
                  },
                  {
                    label: "python",
                    code: `import os
import httpx

response = httpx.post(
    f"${API_BASE}/projects/{project_id}/secrets/DATABASE_URL/reveal",
    headers={"X-API-Key": os.environ["VSECRETS_KEY"]},
)

value = response.json()["value"]
# value == "postgresql://user:pass@host:5432/db"`,
                  },
                  {
                    label: "bash",
                    code: `curl -X POST \\
  ${API_BASE}/projects/$PROJECT_ID/secrets/DATABASE_URL/reveal \\
  -H "X-API-Key: $VSECRETS_KEY"`,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Auth reference ---------------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Two ways to authenticate</h2>
          <Link href="/docs" className={styles.sectionLink}>
            Full API reference →
          </Link>
        </div>

        <div className={styles.actionGrid} style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
          <div className={styles.actionCard} style={{ cursor: "default" }}>
            <h3 className={styles.actionCardTitle}>Runtime key</h3>
            <p className={styles.actionCardDesc}>
              For services, CI/CD, and scripts. Send it as <code>X-API-Key</code>. Scopeable to
              one project and revocable at any time.
            </p>
          </div>

          <div className={styles.actionCard} style={{ cursor: "default" }}>
            <h3 className={styles.actionCardTitle}>Bearer token</h3>
            <p className={styles.actionCardDesc}>
              For user sessions in the console. Short-lived and refreshed automatically. Send it
              as <code>Authorization: Bearer</code>.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- Practices ---------------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Before you go to production</h2>
        </div>

        <div className={styles.card}>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Scope your keys</div>
            <div className={styles.settingsValue}>
              Bind each runtime key to a single project. A leaked global key exposes everything.
            </div>
          </div>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Set expiration</div>
            <div className={styles.settingsValue}>
              Keys without an expiry live forever. Pick 30 or 90 days and rotate on schedule.
            </div>
          </div>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Fetch at boot</div>
            <div className={styles.settingsValue}>
              Read secrets once at startup and hold them in memory. Don't call reveal per request —
              it's slower and floods your audit log.
            </div>
          </div>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Watch the audit log</div>
            <div className={styles.settingsValue}>
              Every reveal is recorded with the key that requested it. Check it after any
              suspected leak.
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
