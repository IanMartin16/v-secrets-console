import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";

export default function DocsPage() {
  return (
    <AppShell title="Docs">
      <section className="hero">
        <h1>V-Secrets Docs</h1>
        <p>
          Learn how to store encrypted application secrets and retrieve them
          from your apps using scoped runtime keys.
        </p>
      </section>

      <section className="section grid quickstart-grid">
        <div className="card">
          <h2>Core concepts</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            V-Secrets is organized around projects, encrypted secrets and
            runtime keys. Each app or service should normally have its own
            project and its own scoped runtime key.
          </p>
        </div>

        <div className="card">
          <h2>Secrets</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Secrets are API keys, tokens and technical credentials such as
            OPENAI_API_KEY, STRIPE_SECRET_KEY, DATABASE_URL or JWT_SECRET.
          </p>
        </div>

        <div className="card">
          <h2>Runtime keys</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Runtime keys allow your apps to retrieve secrets without exposing
            every real credential directly in your app environment.
          </p>
        </div>

        <div className="card">
          <h2>Scopes</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Scopes control what a runtime key can do: read projects, read secret
            metadata, reveal secrets, create secrets, update secrets or delete
            secrets.
          </p>
        </div>
      </section>

      <section className="section card">
        <h2>Basic flow</h2>

        <pre className="code-block">
{`1. Create a project
2. Store encrypted secrets
3. Create a scoped runtime key
4. Add VSECRETS_API_KEY to your app
5. Retrieve secrets at runtime`}
        </pre>

        <div className="actions">
          <Link href="/quickstart">
            <Button variant="primary">View Quickstart</Button>
          </Link>

          <Link href="/projects">
            <Button variant="ghost">Open Projects</Button>
          </Link>
        </div>
      </section>

      <section className="section card">
        <h2>API reference</h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          For now, the live API reference is available through the backend
          Swagger documentation.
        </p>

        <a
          href="https://v-secrets-api-production.up.railway.app/api/v1/docs"
          target="_blank"
          rel="noreferrer"
        >
          <Button variant="ghost">Open API Reference</Button>
        </a>
      </section>
    </AppShell>
  );
}