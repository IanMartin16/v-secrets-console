"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { clearToken } from "@/lib/auth";
import { getMe } from "@/lib/api";
import type { UserProfile } from "@/lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load account")
      );
  }, []);

  function handleLogout() {
    clearToken();
    router.push("/login");
  }
  function formatLimit(value?: number | null) {
    return value === null || value === undefined ? "Unlimited" : String(value);
  }

  function formatPlan(plan?: string) {
    if (!plan) return "Free";
    return plan.charAt(0).toUpperCase() + plan.slice(1);
  }

  return (
    <AppShell title="Settings">
      <section className="hero">
        <h1>Settings</h1>
        <p>Manage your account and V-Secrets Console session.</p>
      </section>

      {error ? <div className="error section">{error}</div> : null}

      <section className="section grid settings-grid">
        <div className="card">
          <div className="settings-card-header">
            <div className="stat-icon">
              <UserRound size={22} />
            </div>

            <div>
              <h2>Account</h2>
              <p>Your V-Secrets user profile.</p>
            </div>
          </div>

          <div className="settings-list">
            <div>
              <span>Full name</span>
              <strong>{user?.full_name || "—"}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{user?.email || "—"}</strong>
            </div>

            <div>
              <span>Plan</span>
              <strong>
                <span className="badge">{user?.plan || "free"}</span>
              </strong>
            </div>
            <div>
              <span>Projects limit</span>
              <strong>{formatLimit(user?.limits?.projects)}</strong>
            </div>

            <div>
              <span>Secrets per project</span>
              <strong>{formatLimit(user?.limits?.secrets_per_project)}</strong>
            </div>

            <div>
              <span>Runtime keys limit</span>
              <strong>{formatLimit(user?.limits?.api_keys)}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="settings-card-header">
            <div className="stat-icon">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2>Usage & Limits</h2>
              <p>Your current plan usage.</p>
            </div>
          </div>

          <div className="settings-list">
            <div>
              <span>Projects</span>
              <strong>
                {user?.usage?.projects ?? 0} / {formatLimit(user?.limits?.projects)}
              </strong>
            </div>

            <div>
              <span>Secrets per project</span>
              <strong>{formatLimit(user?.limits?.secrets_per_project)}</strong>
            </div>

            <div>
              <span>Total secrets</span>
              <strong>{user?.usage?.secrets ?? 0}</strong>
            </div>

            <div>
              <span>Runtime keys</span>
              <strong>
                {user?.usage?.api_keys ?? 0} / {formatLimit(user?.limits?.api_keys)}
              </strong>
            </div>

            <div>
              <span>Monthly requests</span>
              <strong>{formatLimit(user?.limits?.monthly_requests)}</strong>
            </div>
          </div>
        </div>

        <div className="card billing-card">
          <div className="settings-card-header">
            <div className="stat-icon">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2>Billing</h2>
              <p>Manage your subscription and plan.</p>
            </div>
          </div>

          <div className="billing-plan">
            <div>
              <span>Current plan</span>
              <strong>{formatPlan(user?.plan)}</strong>
            </div>

              <span className="badge">{user?.plan || "free"}</span>
            </div>

            <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
              Billing is not connected yet. Stripe Checkout will be enabled here when
              paid plans are activated.
            </p>

            <div className="actions">
              <Button variant="primary" disabled>
                Upgrade plan
              </Button>

              <Button variant="ghost" disabled>
                Manage billing
              </Button>
            </div>
          </div>

        <div className="card">
          <div className="settings-card-header">
            <div className="stat-icon">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2>Security</h2>
              <p>Control this browser session.</p>
            </div>
          </div>

          <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
            Logging out removes the local access token from this browser. Your
            projects, secrets and runtime keys remain stored in V-Secrets.
          </p>

          <Button variant="ghost" onClick={handleLogout}>
            <LogOut size={16} />
            Log out
          </Button>
        </div>
      </section>
    </AppShell>
  );
}