"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";
import { register } from "@/lib/api";
import { getToken, saveToken } from "@/lib/auth";
import { Button } from "@/components/Button";
import { Eye, EyeOff } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await register({
        email,
        password,
        full_name: fullName,
      });

      saveToken(response.access_token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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

        <h1>Create account</h1>
        <p>Start managing encrypted application secrets in minutes.</p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          </div>

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

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="Create a strong password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error ? <div className="error">{error}</div> : null}

          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create account"}
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
        </div>
      </section>
    </main>
  );
}