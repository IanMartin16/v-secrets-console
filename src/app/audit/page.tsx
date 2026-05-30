"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Eye,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getAuditLogs } from "@/lib/api";
import type { AuditLog } from "@/lib/types";

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function getStatusLabel(status?: number | null) {
  if (!status) return "Unknown";
  if (status >= 200 && status < 300) return "Success";
  if (status === 401) return "Unauthorized";
  if (status === 403) return "Forbidden";
  if (status === 404) return "Not found";
  if (status === 429) return "Rate limited";
  if (status >= 500) return "Error";
  return String(status);
}

function getAuthMethod(eventMetadata?: AuditLog["event_metadata"]) {
  return eventMetadata?.auth_method || "unknown";
}

function getDuration(eventMetadata?: AuditLog["event_metadata"]) {
  const duration = eventMetadata?.duration_ms;

  if (typeof duration !== "number") return "—";

  return `${Math.round(duration)}ms`;
}

function formatPath(path?: string | null) {
  if (!path) return "—";
  if (path.length <= 64) return path;

  return `${path.slice(0, 34)}...${path.slice(-22)}`;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      getAuditLogs(50)
        .then((items) => {
          if (!active) return;
          setLogs(items);
        })
        .catch((err) => {
          if (!active) return;
          setError(
            err instanceof Error ? err.message : "Failed to load audit logs"
          );
        })
        .finally(() => {
          if (!active) return;
          setLoading(false);
        });
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell title="Audit Logs">
      <section className="hero overview-hero">
        <p className="hero-eyebrow">Security events • Runtime activity</p>
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
            Monitor when sensitive secret values are revealed by users or
            runtime keys.
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
          V-Secrets records security-relevant backend events, including project,
          secret, runtime key and user activity. This view shows recent events
          associated with your account.
        </p>
      </section>

      {error ? <div className="error section">{error}</div> : null}

      <section className="section card table-card">
        <div
          style={{
            padding: 22,
            borderBottom: "1px solid var(--border-soft)",
          }}
        >
          <h2 style={{ margin: 0 }}>Recent audit events</h2>
          <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
            Latest security-relevant events recorded by V-Secrets.
          </p>
        </div>

        {loading ? (
          <div className="empty">
            <h3>Loading audit logs...</h3>
            <p>Preparing recent security events.</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="empty">
            <h3>No audit events yet</h3>
            <p>
              Create a project, reveal a secret or generate a runtime key to see
              events here.
            </p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Resource</th>
                <th>Auth</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Path</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((event) => (
                <tr key={event.id}>
                  <td>{formatDate(event.created_at)}</td>

                  <td>
                    <span className="badge">{event.action}</span>
                  </td>

                  <td>{event.resource_type || "unknown"}</td>

                  <td>
                    <span className="badge">
                      {getAuthMethod(event.event_metadata)}
                    </span>
                  </td>

                  <td>
                    <span className="badge">
                      {getStatusLabel(event.status_code)}
                    </span>
                  </td>

                  <td>{getDuration(event.event_metadata)}</td>

                  <td>
                    <code title={event.request_path || ""}>
                      {formatPath(event.request_path)}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="section card">
        <div className="section-header">
          <div>
            <h2>Planned audit controls</h2>
            <p style={{ color: "var(--muted)", margin: "6px 0 0" }}>
              These controls are planned for the next audit experience.
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