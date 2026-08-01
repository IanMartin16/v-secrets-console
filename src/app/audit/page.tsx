"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { getAuditLogs } from "@/lib/api";
import type { AuditLog } from "@/lib/types";

import styles from "@/components/AppShell.module.css";

type Filter = "all" | "reads" | "writes" | "failures";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All events" },
  { id: "reads", label: "Reads" },
  { id: "writes", label: "Writes" },
  { id: "failures", label: "Failures" },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    setError("");

    try {
      const data = await getAuditLogs(100);
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return logs;

    return logs.filter((log) => {
      const status = getStatus(log);
      if (filter === "failures") return status >= 400;

      const kind = classifyAction(log);
      if (filter === "reads") return kind === "read";
      if (filter === "writes") return kind === "write" || kind === "delete";
      return true;
    });
  }, [logs, filter]);

  return (
    <AppShell title="Audit logs">
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>Activity trail</p>
        <h1 className={styles.heroTitle}>Audit logs</h1>
        <p className={styles.heroLede}>
          Every read, write, and reveal across your workspace — with the actor, the method used
          to authenticate, and the outcome.
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            Recent events
            {!loading && logs.length > 0 ? (
              <span className={styles.statNote} style={{ marginLeft: 10, fontWeight: 400 }}>
                {filtered.length} shown
              </span>
            ) : null}
          </h2>
          <Button variant="ghost" onClick={() => load(true)} disabled={refreshing}>
            <RefreshCw size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </Button>
        </div>

        {error ? <div className={styles.errorBanner}>{error}</div> : null}

        <div className={styles.filterBar}>
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles.filterChip} ${filter === item.id ? styles.filterChipActive : ""}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className={styles.card}>
          {loading ? (
            <div className={styles.empty}>
              <h3 className={styles.emptyTitle}>Loading audit logs…</h3>
              <p className={styles.emptyDesc}>Reading the activity trail.</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <h3 className={styles.emptyTitle}>
                {logs.length === 0 ? "No activity yet" : "No events match this filter"}
              </h3>
              <p className={styles.emptyDesc}>
                {logs.length === 0
                  ? "Events appear here as soon as you create projects, store secrets, or issue runtime keys."
                  : "Try a different filter to see more events."}
              </p>
              {logs.length === 0 ? (
                <span className={styles.emptyHint}>reads · writes · rotations · reveals</span>
              ) : null}
            </div>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Action</th>
                    <th>Resource</th>
                    <th>Auth</th>
                    <th>Path</th>
                    <th style={{ textAlign: "right" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((log, index) => {
                    const status = getStatus(log);
                    const kind = classifyAction(log);

                    return (
                      <tr key={log.id ?? index}>
                        <td>
                          <span className={styles.tableTimestamp}>
                            {formatWhen(log.created_at)}
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.logAction} ${actionClass(kind)}`}>
                            {log.action ?? log.request_method ?? "—"}
                          </span>
                        </td>
                        <td>
                          <span className={styles.tableActor}>{log.resource_type ?? "—"}</span>
                        </td>
                        <td>
                          <span className={styles.tableActor}>
                            {log.api_key_id ? "runtime key" : "session"}
                          </span>
                        </td>
                        <td>
                          <span className={styles.logPath} title={log.request_path ?? ""}>
                            {log.request_path ?? "—"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <span
                            className={
                              status >= 400 ? styles.logStatusFail : styles.logStatusOk
                            }
                            style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
                          >
                            {status || "—"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}

// -----------------------------------------------------------------------------
// Helpers — defensive: the backend may omit fields depending on the event
// -----------------------------------------------------------------------------

function getStatus(log: AuditLog): number {
  const raw = (log as AuditLog & { status_code?: number }).status_code;
  return typeof raw === "number" ? raw : 0;
}

function classifyAction(log: AuditLog): "read" | "write" | "delete" | "other" {
  const action = String(log.action ?? "").toUpperCase();
  const method = String(
    (log as AuditLog & { request_method?: string }).request_method ?? "",
  ).toUpperCase();

  if (action === "DELETE" || method === "DELETE") return "delete";
  if (action === "GET" || method === "GET") return "read";
  if (["POST", "PUT", "PATCH"].includes(action) || ["POST", "PUT", "PATCH"].includes(method)) {
    return "write";
  }
  return "other";
}

function actionClass(kind: ReturnType<typeof classifyAction>): string {
  if (kind === "read") return styles.logActionRead;
  if (kind === "write") return styles.logActionWrite;
  if (kind === "delete") return styles.logActionDelete;
  return "";
}

function formatWhen(timestamp?: string | null): string {
  if (!timestamp) return "—";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "—";

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
}
