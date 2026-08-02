"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { requestMagicLink } from "@/lib/api";

import styles from "../../login/login.module.css";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  // The API rate limits to 3 links per address per 15 minutes. A visible
  // countdown is friendlier than letting people burn their quota on clicks
  // that silently do nothing.
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleResend() {
    if (!email || cooldown > 0) return;
    setResending(true);
    try {
      await requestMagicLink(email);
      setResent(true);
      setCooldown(30);
    } catch {
      // The endpoint answers uniformly; nothing useful to surface here
      setResent(true);
      setCooldown(30);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className={styles.page}>
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
          <div className={styles.eyebrow}>Link sent</div>
          <h1 className={styles.brandHeadline}>
            Check your
            <br />
            <span className={styles.accent}>inbox</span>.
          </h1>
          <p className={styles.brandLede}>
            The link signs you in directly — nothing to type, nothing to remember. It works
            once and expires in 15 minutes.
          </p>
        </div>

        <footer className={styles.brandFooter}>
          <div className={styles.trustRow} aria-label="Security stack">
            <span className={styles.trustPill}>Single use</span>
            <span className={styles.trustPill}>15 min expiry</span>
            <span className={styles.trustPill}>Hashed at rest</span>
          </div>
          <div className={styles.brandMeta}>
            v1.0 soft launch · powered by{" "}
            <Link href="https://evilink.dev" target="_blank" rel="noopener">
              evi_link devs
            </Link>
          </div>
        </footer>
      </aside>

      <main className={styles.formColumn}>
        <div className={styles.authCard}>
          <header className={styles.authCardHead}>
            <h2 className={styles.authCardTitle}>Check your email</h2>
            <p className={styles.authCardSubtitle}>
              {email ? (
                <>
                  If an account exists for <strong style={{ color: "var(--text)" }}>{email}</strong>,
                  a sign-in link is on its way.
                </>
              ) : (
                "If an account exists for that address, a sign-in link is on its way."
              )}
            </p>
          </header>

          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "16px 18px",
              fontSize: "13.5px",
              color: "var(--text-muted)",
              lineHeight: 1.6,
            }}
          >
            Not seeing it? Check spam, and confirm the address you typed. Links expire after
            15 minutes.
          </div>

          {resent ? (
            <div
              style={{
                fontSize: "13px",
                color: "var(--success, #4ade80)",
                textAlign: "center",
              }}
            >
              Another link has been sent.
            </div>
          ) : null}

          <button
            type="button"
            className={styles.oauthBtn}
            onClick={handleResend}
            disabled={resending || cooldown > 0 || !email}
          >
            {resending
              ? "Sending…"
              : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend link"}
          </button>

          <div className={styles.authCardFoot}>
            Wrong address? <Link href="/login">Start over</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={null}>
      <CheckEmailContent />
    </Suspense>
  );
}
