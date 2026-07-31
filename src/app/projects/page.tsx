"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { createProject, getProjects } from "@/lib/api";
import type { Project } from "@/lib/types";

import styles from "@/components/AppShell.module.css";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState("production");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  async function refreshProjects() {
    const projectList = await getProjects();
    setProjects(Array.isArray(projectList) ? projectList : []);
  }

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const projectList = await getProjects();
        if (!active) return;
        setProjects(Array.isArray(projectList) ? projectList : []);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    queueMicrotask(() => {
      load();
    });

    return () => {
      active = false;
    };
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCreating(true);

    try {
      await createProject({
        name,
        description,
        environment,
      });

      setName("");
      setDescription("");
      setEnvironment("production");
      setShowForm(false);
      await refreshProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  }

  return (
    <AppShell title="Projects">
      {/* -------- Hero -------- */}
      <section className={styles.hero}>
        <p className={styles.heroEyebrow}>Workspace</p>
        <h1 className={styles.heroTitle}>Projects</h1>
        <p className={styles.heroLede}>
          Group application secrets by product, app, or environment. Each project has
          isolated encryption context and scoped runtime access.
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Your projects</h2>
          <Button variant="primary" onClick={() => setShowForm((value) => !value)}>
            {showForm ? "Cancel" : "+ New project"}
          </Button>
        </div>

        {error ? <div className={styles.errorBanner}>{error}</div> : null}

        {showForm ? (
          <form className={styles.form} onSubmit={handleCreate}>
            <div className={styles.field}>
              <label htmlFor="project-name" className={styles.fieldLabel}>
                Project name
              </label>
              <input
                id="project-name"
                className={styles.input}
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="curpify-production"
                autoComplete="off"
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="project-desc" className={styles.fieldLabel}>
                Description
              </label>
              <textarea
                id="project-desc"
                className={styles.textarea}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Runtime secrets for Curpify production app"
                rows={3}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="project-env" className={styles.fieldLabel}>
                Environment
              </label>
              <select
                id="project-env"
                className={styles.select}
                value={environment}
                onChange={(event) => setEnvironment(event.target.value)}
              >
                <option value="development">development</option>
                <option value="staging">staging</option>
                <option value="production">production</option>
              </select>
            </div>

            <div className={styles.formActions}>
              <Button variant="primary" type="submit" disabled={creating}>
                {creating ? "Creating…" : "Create project"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        <div className={styles.card}>
          {loading ? (
            <div className={styles.empty}>
              <h3 className={styles.emptyTitle}>Loading projects…</h3>
              <p className={styles.emptyDesc}>Preparing your V-Secrets workspace.</p>
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create your first project to start storing encrypted application secrets."
              action={
                <Button variant="primary" onClick={() => setShowForm(true)}>
                  Create first project
                </Button>
              }
            />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Environment</th>
                    <th>Secrets</th>
                    <th>Updated</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <div className={styles.tableProjectName}>{project.name}</div>
                        {project.description ? (
                          <div className={styles.tableProjectDesc}>
                            {project.description}
                          </div>
                        ) : null}
                      </td>

                      <td>
                        <span className={styles.badge}>{project.environment}</span>
                      </td>

                      <td>
                        <span className={styles.tableActor}>
                          {project.secret_count ?? 0}
                        </span>
                      </td>

                      <td>
                        <span className={styles.tableTimestamp}>
                          {project.updated_at
                            ? new Date(project.updated_at).toLocaleString()
                            : "—"}
                        </span>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <Link href={`/projects/${project.id}`}>
                          <Button variant="ghost">Open</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
