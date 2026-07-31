import type { ReactNode } from "react";
import styles from "./AppShell.module.css";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  /** Numeric value. Ignored if `text` is provided. */
  value?: number;
  /** Optional limit. `null` or `undefined` renders as unlimited (no progress bar). */
  limit?: number | null;
  /** Descriptive text under the value (e.g. "Projects", "Secrets stored"). */
  note?: string;
  /** Additional small note (e.g. uptime string). Only rendered on the healthy variant. */
  extraNote?: string;
  /** Renders text (not a number) — used for "Healthy" service status. */
  text?: string;
  /** Marks this card as the health-status variant (renders a green dot instead of the icon). */
  healthy?: boolean;
};

export function StatCard({
  icon,
  label,
  value,
  limit,
  note,
  extraNote,
  text,
  healthy,
}: StatCardProps) {
  const isUnlimited = limit === null || limit === undefined;
  const percent =
    isUnlimited || typeof value !== "number"
      ? 0
      : Math.min(100, Math.round((value / (limit as number)) * 100));

  return (
    <article className={styles.statCard}>
      <div className={styles.statCardHead}>
        <span className={styles.statIcon} aria-hidden="true">
          {icon}
        </span>
        {healthy ? (
          <span className={styles.statStatusDot} aria-hidden="true" />
        ) : (
          <span className={styles.statLabel}>{label}</span>
        )}
      </div>

      <div className={styles.statValueWrap}>
        {text ? (
          <div className={`${styles.statValue} ${styles.statValueText}`}>{text}</div>
        ) : (
          <div className={styles.statValue}>
            {value ?? 0}
            {!isUnlimited && <span className={styles.statLimit}>/{limit}</span>}
            {isUnlimited && <span className={styles.statLimit}>/∞</span>}
          </div>
        )}
        {note ? <div className={styles.statNote}>{note}</div> : null}
      </div>

      {!healthy && !isUnlimited && typeof value === "number" ? (
        <div className={styles.statProgress}>
          <div
            className={styles.statProgressFill}
            style={{ width: `${percent}%` }}
          />
        </div>
      ) : null}

      {extraNote ? (
        <div className={`${styles.statNote} ${styles.statNoteSmall}`}>{extraNote}</div>
      ) : null}
    </article>
  );
}
