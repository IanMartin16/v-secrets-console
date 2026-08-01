"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

import styles from "./login.module.css";

// ---------------------------------------------------------------------------
// LoginContent: all logic that touches useSearchParams lives here.
// Must be wrapped in <Suspense> so Next.js can prerender the shell.
// ---------------------------------------------------------------------------

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Already signed in? Skip the form. The session is the only auth signal —
  // no localStorage check, so a stale token can't bounce the user around.
  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [router, callbackUrl, status]);

  async function handleGithub() {
    setError("");
    setOauthLoading(true);
    await signIn("github", { callbackUrl });
    setOauthLoading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    // Password auth goes through NextAuth's Credentials provider, which calls
    // FastAPI /auth/login server-side. This gives us a session cookie that the
    // middleware can read — localStorage alone is invisible to the edge.
    const result = await signIn("password", {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }

    // Session cookie is set; navigate and let the server re-evaluate
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className={styles.page}>
      {/* ---------- Brand column ---------- */}
      <aside className={styles.brandColumn}>
        <Link href="/" className={styles.brandMark} aria-label="V-Secrets home">
          <span className={styles.brandMarkIcon} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z" />
              <circle cx="12" cy="11" r="2" />
              <path d="M12 13v3" />
            </svg>
          </span>
          <span className={styles.brandMarkText}>
            <span className={styles.brandMarkName}>V-Secrets</span>
            <span className={styles.brandMarkTag}>Developer Secrets Manager</span>
          </span>
        </Link>

        <div className={styles.brandHero}>
          <div className={styles.eyebrow}>Console access</div>
          <h1 className={styles.brandHeadline}>
            Encrypted vaults,
            <br />
            <span className={styles.accent}>runtime-safe</span> keys.
          </h1>
          <p className={styles.brandLede}>
            Sign in to manage application secrets, rotate credentials, and issue scoped runtime keys
            for your services.
          </p>

          <div className={styles.vaultDemo} aria-label="Example: how V-Secrets stores a secret">
            <div className={styles.vaultDemoHeader}>
              <span className={styles.vaultDemoTitle}>vault · encrypt</span>
              <span className={styles.vaultDemoDots} aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </div>
            <div className={styles.vaultDemoBody}>
              <div className={styles.vaultRow}>
                <span className={styles.vaultKey}>key</span>
                <span className={styles.vaultVal}>DATABASE_URL</span>
              </div>
              <div className={styles.vaultRow}>
                <span className={styles.vaultKey}>cipher</span>
                <span className={`${styles.vaultVal} ${styles.vaultValCipher}`}>AES-256-GCM</span>
              </div>
              <div className={styles.vaultRow}>
                <span className={styles.vaultKey}>nonce</span>
                <span className={styles.vaultVal}>7e3ac6…59fe</span>
              </div>
              <div className={styles.vaultRow}>
                <span className={styles.vaultKey}>auth_tag</span>
                <span className={styles.vaultVal}>f4bc0a…b8ee</span>
              </div>
              <div className={styles.vaultRow}>
                <span className={styles.vaultKey}>stored</span>
                <span className={`${styles.vaultVal} ${styles.vaultValMasked}`}>
                  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
                </span>
              </div>
              <div className={styles.vaultStatus}>
                <span className={styles.vaultStatusDot} aria-hidden="true" />
                <span>encrypted at rest · scoped access</span>
              </div>
            </div>
          </div>
        </div>

        <footer className={styles.brandFooter}>
          <div className={styles.trustRow} aria-label="Security stack">
            <span className={styles.trustPill}>AES-256-GCM</span>
            <span className={styles.trustPill}>Argon2id</span>
            <span className={styles.trustPill}>Zero-knowledge ready</span>
          </div>
          <div className={styles.brandMeta}>
            v1.0 soft launch · powered by{" "}
            <Link href="https://evilink.dev" target="_blank" rel="noopener">
              evi_link devs
            </Link>
          </div>
        </footer>
      </aside>

      {/* ---------- Form column ---------- */}
      <main className={styles.formColumn}>
        <div className={styles.authCard}>
          <header className={styles.authCardHead}>
            <h2 className={styles.authCardTitle}>Welcome back</h2>
            <p className={styles.authCardSubtitle}>Sign in to the V-Secrets console.</p>
          </header>

          <div className={styles.oauthGroup}>
            <button
              type="button"
              className={styles.oauthBtn}
              onClick={handleGithub}
              disabled={oauthLoading}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5a11.5 11.5 0 0 0-3.63 22.42c.58.1.79-.25.79-.56v-2c-3.24.7-3.92-1.4-3.92-1.4-.53-1.34-1.3-1.69-1.3-1.69-1.06-.72.08-.7.08-.7 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.76.4-1.27.74-1.56-2.58-.29-5.3-1.29-5.3-5.75 0-1.27.45-2.31 1.19-3.13-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.19a11 11 0 0 1 5.79 0c2.2-1.5 3.17-1.19 3.17-1.19.63 1.59.23 2.77.12 3.06.74.82 1.19 1.86 1.19 3.13 0 4.47-2.72 5.46-5.32 5.75.41.35.78 1.06.78 2.13v3.16c0 .31.21.67.79.56A11.5 11.5 0 0 0 12 .5z" />
              </svg>
              {oauthLoading ? "Connecting to GitHub…" : "Continue with GitHub"}
            </button>
          </div>

          <div className={styles.divider}>or</div>

          <form className={styles.authForm} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.fieldLabel}>
                Email
              </label>
              <div className={styles.inputWrap}>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <div className={styles.fieldLabelRow}>
                <label htmlFor="password" className={styles.fieldLabel}>
                  Password
                </label>
                <Link href="/forgot-password" className={styles.fieldHelp}>
                  Forgot?
                </Link>
              </div>
              <div className={styles.inputWrap}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className={styles.input}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error ? (
              <div className={styles.errorMessage} role="alert">
                {error}
              </div>
            ) : null}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? "Signing in…" : "Sign in with password"}
            </button>
          </form>

          <div className={styles.authCardFoot}>
            New to V-Secrets? <Link href="/register">Create a workspace</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LoginPage (default export): wraps LoginContent in Suspense so Next.js can
// safely prerender the shell before searchParams resolves on the client.
// ---------------------------------------------------------------------------

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
