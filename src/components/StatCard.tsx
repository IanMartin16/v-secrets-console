import type { ReactNode } from "react";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  healthy?: boolean;
};

export function StatCard({ icon, label, value, healthy }: StatCardProps) {
  return (
    <div className="card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {healthy ? <span className="status-dot" /> : null}
        {value}
      </div>
    </div>
  );
}