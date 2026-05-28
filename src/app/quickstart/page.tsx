import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";

export default function QuickstartPage() {
  return (
    <AppShell title="Quickstart">
      <section className="hero">
        <h1>Connect your app with V-Secrets</h1>
        <p>
          Store real API keys in V-Secrets and let your apps retrieve them
          through scoped runtime keys.
        </p>
      </section>

      <section className="section card quickstart-note">
        <strong>How V-Secrets works</strong>
        <p>
          Your app does not need to store every sensitive credential directly.
          Instead, you create a project, save encrypted secrets, generate a
          runtime key, and let your app request only the secrets it is allowed
          to access.
        </p>
      </section>

      <section className="section grid quickstart-grid">
        <div className="card">
          <h2>1. Create a project</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            A project represents an app, service or environment. For example:
            <code> curpify-production</code>, <code>nexus-runtime</code> or{" "}
            <code>data-link-prod</code>.
          </p>
        </div>

        <div className="card">
          <h2>2. Store encrypted secrets</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Add secrets like <code>OPENAI_API_KEY</code>,{" "}
            <code>STRIPE_SECRET_KEY</code>, <code>DATABASE_URL</code> or{" "}
            <code>JWT_SECRET</code>. Values are stored encrypted.
          </p>
        </div>

        <div className="card">
          <h2>3. Generate a runtime key</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Runtime keys are scoped, revocable and can expire. Your app uses
            this key to retrieve only the secrets it is allowed to access.
          </p>
        </div>

        <div className="card">
          <h2>4. Connect your app</h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Open a project and use its generated Quickstart to copy cURL,
            Python or Node examples.
          </p>
        </div>
      </section>

      <section className="section card">
        <h2>Recommended .env pattern</h2>
        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          Your app keeps only the V-Secrets runtime access values. The real
          API keys stay encrypted inside V-Secrets.
        </p>

        <pre className="code-block">
{`VSECRETS_BASE_URL=https://api.vsecrets.dev
VSECRETS_PROJECT_ID=your-project-id
VSECRETS_API_KEY=vsec_live_xxxxx`}
        </pre>

        <div className="actions">
          <Link href="/projects">
            <Button variant="primary">Open projects</Button>
          </Link>
        </div>
      </section>
    </AppShell>
  );
}