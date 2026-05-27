"use client";

import { useEffect, useMemo, useState } from "react";
import { Folder, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/Button";
import { getMe, getProjects } from "@/lib/api";
import type { Project, UserProfile } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [profile, projectList] = await Promise.all([
          getMe(),
          getProjects(),
        ]);

        setUser(profile);
        setProjects(projectList);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard");
      }
    }

    load();
  }, []);

  const totalSecrets = useMemo(
    () => projects.reduce((sum, project) => sum + (project.secret_count || 0), 0),
    [projects]
  );

  function formatLimit(value?: number | null) {
    return value === null || value === undefined ? "Unlimited" : String(value);
  }

  return (
    <AppShell>
      <section className="hero">
        <h1>Welcome back{user?.full_name ? `, ${user.full_name}` : ""}</h1>
        <p>Manage encrypted application secrets and runtime access keys.</p>
      </section>

      {error ? <div className="error section">{error}</div> : null}

      <section className="grid stats-grid">
        <StatCard
          icon={<Folder size={22} />}
          label="Projects"
          value={`${user?.usage?.projects ?? projects.length} / ${formatLimit(user?.limits?.projects)}`}
        />

        <StatCard
          icon={<LockKeyhole size={22} />}
          label="Secrets"
          value={`${user?.usage?.secrets ?? totalSecrets} / ${formatLimit(user?.limits?.secrets_per_project)}`}
        />

        <StatCard
          icon={<KeyRound size={22} />}
          label="Runtime Keys"
          value={`${user?.usage?.api_keys ?? 0} / ${formatLimit(user?.limits?.api_keys)}`}
        />

        <StatCard
          icon={<ShieldCheck size={22} />}
          label="Service Status"
          value="Healthy"
          healthy
        />
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Quick actions</h2>
        </div>
        <div className="actions">
          <Link href="/projects" prefetch={false}>
            <Button variant="primary">New Project</Button>
          </Link>

          <Link href="/projects">
            <Button variant="ghost">Add Secret</Button>
          </Link>

          <Link href="/projects">
            <Button variant="ghost">Create Runtime Key</Button>
          </Link>

          <Link href="/quickstart">
            <Button variant="ghost">View Quickstart</Button>
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Recent Activity</h2>
        </div>

        <div className="card table-card">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Secret/Key Name</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>12 mins ago</td>
                <td>runtime key</td>
                <td><span className="badge">Reveal</span></td>
                <td>OPENAI_API_KEY</td>
                <td>Success</td>
              </tr>
              <tr>
                <td>25 mins ago</td>
                <td>owner</td>
                <td><span className="badge">Create</span></td>
                <td>STRIPE_SECRET_KEY</td>
                <td>Success</td>
              </tr>
              <tr>
                <td>1 hour ago</td>
                <td>owner</td>
                <td><span className="badge">Update</span></td>
                <td>DATABASE_URL</td>
                <td>Success</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}