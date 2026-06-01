import type { ReactNode } from "react";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  helper?: string;
  healthy?: boolean;
};

export function StatCard({
  icon,
  label,
  value,
  helper,
  healthy,
}: StatCardProps) {
  return (
    <div className="card stat-card">
      <div className="stat-icon">{icon}</div>

      <div className="stat-label">{label}</div>

      <div className="stat-value">
        {healthy ? <span className="status-dot" /> : null}
        {value}
      </div>

      {helper ? <p className="stat-helper">{helper}</p> : null}
    </div>
  );
}