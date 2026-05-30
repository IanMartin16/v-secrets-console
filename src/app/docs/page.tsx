import Link from "next/link";
import { BookOpen, Folder, KeyRound, LockKeyhole, ShieldCheck, Zap } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";

const concepts = [
  {
    icon: Folder,
    title: "Projects",
    description:
      "A project represents an app, service or environment. Keep secrets grouped by product or runtime context.",
  },
  {
    icon: LockKeyhole,
    title: "Secrets",
    description:
      "Secrets are encrypted API keys, tokens and technical credentials like OPENAI_API_KEY or STRIPE_SECRET_KEY.",
  },
  {
    icon: KeyRound,
    title: "Runtime Keys",
    description:
      "Runtime keys let your apps retrieve secrets through scoped, revocable credentials.",
  },
  {
    icon: ShieldCheck,
    title: "Scopes",
    description:
      "Scopes define what a runtime key can do: read metadata, reveal secrets, create, update or delete.",
  },
];

export default function DocsPage() {
  return (
    <AppShell title="Docs">
      <section className="hero overview-hero">
        <p className="hero-eyebrow">Documentation • Core concepts</p>
        <h1>Build with V-Secrets</h1>
        <p>
          Learn the core flow behind encrypted application secrets and scoped
          runtime access.
        </p>

        <div className="hero-pills">
          <span className="hero-pill">Projects</span>
          <span className="hero-pill">Secrets</span>
          <span className="hero-pill">Runtime keys</span>
          <span className="hero-pill">Scopes</span>
        </div>
      </section>

      <section className="section grid docs-grid">
        {concepts.map((item) => {
          const Icon = item.icon;

          return (
            <div className="card docs-concept-card" key={item.title}>
              <div className="stat-icon">
                <Icon size={22} />
              </div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          );
        })}
      </section>

      <section className="section card">
        <div className="section-header">
          <div>
            <h2>Recommended flow</h2>
            <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
              The fastest way to connect an application to V-Secrets.
            </p>
          </div>
        </div>

        <div className="docs-flow">
          <div>
            <span>01</span>
            <strong>Create a project</strong>
            <p>Use one project per app, product or environment.</p>
          </div>

          <div>
            <span>02</span>
            <strong>Store encrypted secrets</strong>
            <p>Add API keys, tokens and credentials to the project vault.</p>
          </div>

          <div>
            <span>03</span>
            <strong>Create a runtime key</strong>
            <p>Generate a scoped key that your app can use safely.</p>
          </div>

          <div>
            <span>04</span>
            <strong>Connect your app</strong>
            <p>Use the project Quickstart to copy cURL, Python or Node examples.</p>
          </div>
        </div>

        <div className="actions" style={{ marginTop: 24 }}>
          <Link href="/projects">
            <Button variant="primary">
              <Folder size={16} />
              Open Projects
            </Button>
          </Link>

          <Link href="/quickstart">
            <Button variant="ghost">
              <Zap size={16} />
              View Quickstart
            </Button>
          </Link>
        </div>
      </section>

      <section className="section card">
        <div className="section-header">
          <div>
            <h2>API reference</h2>
            <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
              Use the live backend reference for endpoint-level testing.
            </p>
          </div>
        </div>

        <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
          The V-Secrets API is available at <code>https://api.vsecrets.dev</code>.
          For production apps, use scoped runtime keys instead of user JWTs.
        </p>

        <a
          href="https://api.vsecrets.dev/api/v1/docs"
          target="_blank"
          rel="noreferrer"
        >
          <Button variant="ghost">
            <BookOpen size={16} />
            Open API Reference
          </Button>
        </a>
      </section>
    </AppShell>
  );
}