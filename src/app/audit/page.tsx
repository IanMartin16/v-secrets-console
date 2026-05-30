import { Activity, Eye, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";

const exampleEvents = [
  {
    time: "Example",
    actor: "runtime key",
    action: "Reveal",
    resource: "OPENAI_API_KEY",
    status: "Success",
  },
  {
    time: "Example",
    actor: "owner",
    action: "Create",
    resource: "STRIPE_SECRET_KEY",
    status: "Success",
  },
  {
    time: "Example",
    actor: "owner",
    action: "Runtime Key",
    resource: "nexus-runtime",
    status: "Created",
  },
];

export default function AuditPage() {
  return (
    <AppShell title="Audit Logs">
      <section className="hero overview-hero">
        <p className="hero-eyebrow">Security events • Coming next</p>
        <h1>Audit visibility for sensitive actions</h1>
        <p>
          Track reveal events, runtime key usage and security-relevant project
          changes from one place.
        </p>

        <div className="hero-pills">
          <span className="hero-pill">Reveal events</span>
          <span className="hero-pill">Runtime access</span>
          <span className="hero-pill">Project changes</span>
        </div>
      </section>

      <section className="section grid audit-summary-grid">
        <div className="card">
          <div className="stat-icon">
            <Eye size={22} />
          </div>
          <h2>Reveal tracking</h2>
          <p>
            Monitor when sensitive secret values are revealed by users or runtime
            keys.
          </p>
        </div>

        <div className="card">
          <div className="stat-icon">
            <KeyRound size={22} />
          </div>
          <h2>Runtime activity</h2>
          <p>
            Understand which scoped keys are being used to access application
            secrets.
          </p>
        </div>

        <div className="card">
          <div className="stat-icon">
            <LockKeyhole size={22} />
          </div>
          <h2>Security changes</h2>
          <p>
            Review project, secret and runtime key actions that affect your
            vault.
          </p>
        </div>
      </section>

      <section className="section card quickstart-note">
        <strong>Backend audit events are active</strong>
        <p>
          V-Secrets already records security-relevant backend events. This
          Console view will expose filtering, project-level history and runtime
          key activity in a future update.
        </p>
      </section>

      <section className="section card table-card">
        <div style={{ padding: 22, borderBottom: "1px solid var(--border-soft)" }}>
          <h2 style={{ margin: 0 }}>Example audit events</h2>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Preview of the events this page will surface.
          </p>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {exampleEvents.map((event) => (
              <tr key={`${event.action}-${event.resource}`}>
                <td>{event.time}</td>
                <td>{event.actor}</td>
                <td>
                  <span className="badge">{event.action}</span>
                </td>
                <td>{event.resource}</td>
                <td>
                  <span className="badge">{event.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="section card">
        <div className="section-header">
          <div>
            <h2>Planned audit controls</h2>
            <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
              These controls are planned for the Console audit experience.
            </p>
          </div>
        </div>

        <div className="audit-control-list">
          <div>
            <Activity size={18} />
            <span>Filter by project</span>
          </div>
          <div>
            <ShieldCheck size={18} />
            <span>Filter by action type</span>
          </div>
          <div>
            <KeyRound size={18} />
            <span>Inspect runtime key activity</span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}