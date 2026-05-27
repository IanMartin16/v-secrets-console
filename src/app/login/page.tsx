"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { login } from "@/lib/api";
import { getToken, saveToken } from "@/lib/auth";
import { Button } from "@/components/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("SecurePass123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login({ email, password });
      saveToken(response.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (getToken()) {
      router.replace("/dashboard");
    }
  }, [router]);

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-logo">
          <Image
            src="/vsecrets-logo.png"
            alt="V-Secrets"
            width={260}
            height={80}
            className="sidebar-logo"
            priority
          />
        </div>

        <h1>Welcome back</h1>
        <p>Manage encrypted application secrets and runtime access keys.</p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="you@company.com"
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          {error ? <div className="error">{error}</div> : null}

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="auth-footer">
          New to V-Secrets? <Link href="/register">Create account</Link>
        </div>
      </section>
    </main>
  );
}