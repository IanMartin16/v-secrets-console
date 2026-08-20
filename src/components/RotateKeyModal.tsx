"use client";

import { FormEvent, useState } from "react";
import { AlertTriangle, Check, Copy, X } from "lucide-react";

import { rotateApiKey } from "@/lib/api";
import type { ApiKey, ApiKeyRotateResponse } from "@/lib/types";

import styles from "./AppShell.module.css";

type RotateKeyModalProps = {
  apiKey: ApiKey;
  onClose: () => void;
  onRotated: () => void;
};

const GRACE_OPTIONS = [
  { value: 24, label: "24 hours", hint: "Recommended — time for a normal deploy cycle" },
  { value: 72, label: "72 hours", hint: "For services that deploy on a weekly cadence" },
  { value: 1, label: "1 hour", hint: "When you need the old key gone quickly" },
  { value: 0, label: "Immediately", hint: "Revokes on rotation — anything using it breaks now" },
];

export function RotateKeyModal({ apiKey, onClose, onRotated }: RotateKeyModalProps) {
  const [gracePeriod, setGracePeriod] = useState(24);
  const [confirmName, setConfirmName] = useState("");
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ApiKeyRotateResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Typing the name is the same guard GitHub uses for repository deletion.
  // Rotation is incident response, and a single click is too easy to reach by
  // accident on a key that production depends on.
  const confirmed = confirmName.trim() === apiKey.name;

  const lastUsed = describeLastUsed(apiKey.last_used_at);
  const recentlyActive = isRecentlyActive(apiKey.last_used_at);

  async function handleRotate(event: FormEvent) {
    event.preventDefault();
    if (!confirmed || rotating) return;

    setError("");
    setRotating(true);

    try {
      const response = await rotateApiKey(apiKey.id, gracePeriod);
      setResult(response);
      onRotated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Rotation failed. Try again.");
    } finally {
      setRotating(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.new_key.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard unavailable — the value is selectable
    }
  }

  // ---------------------------------------------------------------------------
  // After rotation: show the new key once
  // ---------------------------------------------------------------------------

  if (result) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <header className={styles.modalHead}>
            <h2 className={styles.modalTitle}>Key rotated</h2>
            <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close">
              <X size={17} />
            </button>
          </header>

          <div className={styles.revealBox}>
            <h3 className={styles.revealTitle}>Your replacement key</h3>
            <p className={styles.revealWarning}>
              Copy it now — this is the only time it will be shown.
            </p>
            <div className={styles.revealValue}>
              <code>{result.new_key.api_key}</code>
              <button type="button" className={styles.copyBtn} onClick={handleCopy}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {result.grace_expires_at ? (
            <div className={styles.scopeWarning}>
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                The previous key (<code>{result.old_key_prefix}…</code>) stops working{" "}
                <strong>{formatDeadline(result.grace_expires_at)}</strong>. Update every
                service using it before then.
              </span>
            </div>
          ) : (
            <div className={styles.scopeWarning}>
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>
                The previous key was revoked immediately. Any service still using it is
                already failing.
              </span>
            </div>
          )}

          <button type="button" className={styles.submitBtn} onClick={onClose}>
            I've saved the new key
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Before rotation: the warning
  // ---------------------------------------------------------------------------

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHead}>
          <h2 className={styles.modalTitle}>Rotate this key</h2>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </header>

        <div className={styles.scopeWarning}>
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Rotation replaces this credential. Every service using{" "}
            <code>{apiKey.key_prefix}…</code> must be updated before the grace period
            ends, or it will start failing authentication.
            <br />
            <br />
            Rotate when a key has leaked or you suspect it's compromised — not as
            routine maintenance.
          </span>
        </div>

        <div className={styles.settingsCard}>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Key</div>
            <div className={styles.settingsValue}>
              {apiKey.name}
              <div className={styles.settingsHint}>{apiKey.key_prefix}…</div>
            </div>
          </div>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Last used</div>
            <div className={styles.settingsValue}>
              <span className={recentlyActive ? styles.logStatusFail : undefined}>
                {lastUsed}
              </span>
              {recentlyActive ? (
                <div className={styles.settingsHint}>
                  Something is actively using this key right now.
                </div>
              ) : null}
            </div>
          </div>
          <div className={styles.settingsRow}>
            <div className={styles.settingsLabel}>Scope</div>
            <div className={styles.settingsValue}>
              {apiKey.project_id ? "Single project" : "All projects"}
              <div className={styles.settingsHint}>
                The replacement inherits identical scopes and project binding.
              </div>
            </div>
          </div>
        </div>

        <form className={styles.authForm} onSubmit={handleRotate}>
          <div className={styles.field}>
            <label htmlFor="grace" className={styles.fieldLabel}>
              Keep the old key working for
            </label>
            <select
              id="grace"
              className={styles.select}
              value={gracePeriod}
              onChange={(e) => setGracePeriod(Number(e.target.value))}
            >
              {GRACE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className={styles.settingsHint}>
              {GRACE_OPTIONS.find((o) => o.value === gracePeriod)?.hint}
            </span>
          </div>

          <div className={styles.field}>
            <label htmlFor="confirm" className={styles.fieldLabel}>
              Type <strong style={{ color: "var(--text)" }}>{apiKey.name}</strong> to confirm
            </label>
            <input
              id="confirm"
              className={styles.input}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={apiKey.name}
              autoComplete="off"
              autoFocus
            />
          </div>

          {error ? (
            <div className={styles.errorMessage} role="alert">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!confirmed || rotating}
          >
            {rotating ? "Rotating…" : "Rotate key"}
          </button>
        </form>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function describeLastUsed(timestamp?: string | null): string {
  if (!timestamp) return "Never used";

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMin < 1) return "Seconds ago";
  if (diffMin < 60) return `${diffMin} minutes ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} days ago`;

  return date.toLocaleDateString();
}

/** Used within the last hour — something is almost certainly running against it. */
function isRecentlyActive(timestamp?: string | null): boolean {
  if (!timestamp) return false;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return false;
  return Date.now() - date.getTime() < 60 * 60 * 1000;
}

function formatDeadline(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "soon";

  const diffHours = Math.round((date.getTime() - Date.now()) / 3600000);
  const absolute = date.toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  if (diffHours < 1) return `within the hour (${absolute})`;
  return `in ${diffHours} hours (${absolute})`;
}
