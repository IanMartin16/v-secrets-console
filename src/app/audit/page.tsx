import { AppShell } from "@/components/AppShell";

export default function AuditPage() {
  return (
    <AppShell title="Audit Logs">
      <section className="hero">
        <h1>Audit Logs</h1>
        <p>
          Track sensitive actions such as secret reveals, runtime key usage and
          project changes.
        </p>
      </section>

      <section className="section card quickstart-note">
        <strong>Audit visibility is coming next</strong>
        <p>
          V-Secrets already records audit events in the backend. This console
          page will expose a filtered view for project owners, including reveal
          events, runtime key activity and security-relevant actions.
        </p>
      </section>

      <section className="section card table-card">
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
            <tr>
              <td>Example</td>
              <td>runtime key</td>
              <td>
                <span className="badge">Reveal</span>
              </td>
              <td>OPENAI_API_KEY</td>
              <td>Success</td>
            </tr>

            <tr>
              <td>Example</td>
              <td>owner</td>
              <td>
                <span className="badge">Create</span>
              </td>
              <td>STRIPE_SECRET_KEY</td>
              <td>Success</td>
            </tr>

            <tr>
              <td>Example</td>
              <td>owner</td>
              <td>
                <span className="badge">Runtime Key</span>
              </td>
              <td>nexus-runtime</td>
              <td>Created</td>
            </tr>
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}