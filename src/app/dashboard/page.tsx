"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  FolderOpen,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { getMe, getProjects } from "@/lib/api";
import type { Project, UserProfile } from "@/lib/types";

import styles from "@/components/AppShell.module.css";

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [profile, projectList] = await Promise.all([getMe(), getProjects()]);
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
    [projects],
  );

  const firstName = getFirstName(user?.full_name);

  return (
    <AppShell title="Overview">
      {/* -------- Hero -------- */}
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>Console overview</p>
        <h1 className={styles.heroTitle}>
          Welcome back, <span className={styles.heroAccent}>{firstName}</span>
        </h1>
        <p className={styles.heroLede}>
          Manage encrypted secrets, rotate credentials, and issue scoped runtime keys across
          your workspace.
        </p>
      </section>

      {error ? <div className={styles.errorBanner}>{error}</div> : null}

      {/* -------- Stat cards -------- */}
      <section className={styles.statGrid} style={{ marginBottom: 48 }}>
        <StatCard
          icon={<FolderOpen size={16} />}
          label="Plan usage"
          value={user?.usage?.projects ?? projects.length}
          limit={user?.limits?.projects}
          note="Projects"
        />
        <StatCard
          icon={<LockKeyhole size={16} />}
          label="Plan usage"
          value={user?.usage?.secrets ?? totalSecrets}
          limit={user?.limits?.secrets_per_project}
          note="Secrets stored"
        />
        <StatCard
          icon={<KeyRound size={16} />}
          label="Runtime keys"
          value={user?.usage?.api_keys ?? 0}
          limit={user?.limits?.api_keys}
          note="Active keys"
        />
        <StatCard
          icon={<ShieldCheck size={16} />}
          label="Service status"
          text="Healthy"
          note="Service status"
          extraNote="All systems operational · 99.9% uptime"
          healthy
        />
      </section>

      {/* -------- Get started -------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Get started</h2>
          <Link href="/quickstart" className={styles.sectionLink}>
            View quickstart →
          </Link>
        </div>

        <div className={styles.actionGrid}>
          <Link href="/projects" className={styles.actionCard} prefetch={false}>
            <span className={styles.actionCardIcon} aria-hidden="true">
              <FolderOpen size={17} />
            </span>
            <h3 className={styles.actionCardTitle}>
              Create a project
              <ArrowRight size={14} className={styles.actionCardArrow} />
            </h3>
            <p className={styles.actionCardDesc}>
              Group secrets by app, environment, or team. Every project has isolated
              encryption keys.
            </p>
          </Link>

          <Link href="/projects" className={styles.actionCard}>
            <span className={styles.actionCardIcon} aria-hidden="true">
              <LockKeyhole size={17} />
            </span>
            <h3 className={styles.actionCardTitle}>
              Store your first secret
              <ArrowRight size={14} className={styles.actionCardArrow} />
            </h3>
            <p className={styles.actionCardDesc}>
              API keys, database URLs, tokens. Encrypted at rest with AES-256-GCM.
            </p>
          </Link>

          <Link href="/projects" className={styles.actionCard}>
            <span className={styles.actionCardIcon} aria-hidden="true">
              <KeyRound size={17} />
            </span>
            <h3 className={styles.actionCardTitle}>
              Issue a runtime key
              <ArrowRight size={14} className={styles.actionCardArrow} />
            </h3>
            <p className={styles.actionCardDesc}>
              Scoped API keys for CI/CD, scripts, or services. Rotate anytime.
            </p>
          </Link>
        </div>
      </section>

      {/* -------- Recent activity -------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Recent activity</h2>
          <Link href="/audit-logs" className={styles.sectionLink}>
            View audit logs →
          </Link>
        </div>

        <div className={styles.card}>
          <div className={styles.empty}>
            <h3 className={styles.emptyTitle}>No activity yet</h3>
            <p className={styles.emptyDesc}>
              Events will appear here as you use the vault.
            </p>
            <span className={styles.emptyHint}>reads · writes · rotations · reveals</span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function getFirstName(fullName?: string | null) {
  if (!fullName) return "Developer";
  const cleanName = fullName.trim();
  if (!cleanName) return "Developer";
  const firstName = cleanName.split(" ")[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1);
}
