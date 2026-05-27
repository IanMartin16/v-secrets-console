"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { createProject, getProjects } from "@/lib/api";
import type { Project } from "@/lib/types";

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
      <section className="hero">
        <h1>Projects</h1>
        <p>Group application secrets by product, app or environment.</p>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Your projects</h2>
          <Button variant="primary" onClick={() => setShowForm((value) => !value)}>
            + New Project
          </Button>
        </div>

        {error ? <div className="error">{error}</div> : null}

        {showForm ? (
          <form className="card form" onSubmit={handleCreate}>
            <div className="field">
              <label>Project name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="curpify-production"
                required
              />
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Runtime secrets for Curpify production app"
                rows={3}
              />
            </div>

            <div className="field">
              <label>Environment</label>
              <select
                value={environment}
                onChange={(event) => setEnvironment(event.target.value)}
              >
                <option value="development">development</option>
                <option value="staging">staging</option>
                <option value="production">production</option>
              </select>
            </div>

            <div className="actions">
              <Button variant="primary" type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create project"}
              </Button>

              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : null}

        <div className="card table-card" style={{ marginTop: 18 }}>
          {loading ? (
            <div className="empty">
              <h3>Loading projects...</h3>
              <p>Preparing your V-Secrets projects.</p>
            </div>
          ) : projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description="Create your first project and start storing encrypted application secrets."
              action={
                <Button variant="primary" onClick={() => setShowForm(true)}>
                  Create first project
                </Button>
              }
            />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Environment</th>
                  <th>Secrets</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <strong>{project.name}</strong>
                      <div style={{ color: "var(--muted)", fontSize: 13 }}>
                        {project.description || "No description"}
                      </div>
                    </td>

                    <td>
                      <span className="badge">{project.environment}</span>
                    </td>

                    <td>{project.secret_count ?? 0}</td>

                    <td>
                      {project.updated_at
                        ? new Date(project.updated_at).toLocaleString()
                        : "—"}
                    </td>

                    <td>
                      <Link href={`/projects/${project.id}`}>
                        <Button variant="ghost">Open</Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </AppShell>
  );
}