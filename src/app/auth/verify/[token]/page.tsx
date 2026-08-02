"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";

import styles from "../../../login/login.module.css";

type State = "verifying" | "error";

export default function VerifyMagicLinkPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const [state, setState] = useState<State>("verifying");
  const attempted = useRef(false);

  useEffect(() => {
    // Tokens are single-use. React 18 in dev mounts effects twice, which would
    // burn the token on the first run and fail on the second — this guard makes
    // the redemption happen exactly once.
    if (attempted.current) return;
    attempted.current = true;

    const token = params?.token;
    if (!token) {
      setState("error");
      return;
    }

    async function redeem() {
      const result = await signIn("magic-link", {
        token,
        redirect: false,
      });

      if (!result || result.error) {
        setState("error");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    }

    redeem();
  }, [params, router]);

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
          <div className={styles.eyebrow}>
            {state === "verifying" ? "Verifying" : "Link problem"}
          </div>
          <h1 className={styles.brandHeadline}>
            {state === "verifying" ? (
              <>
                Opening your
                <br />
                <span className={styles.accent}>vault</span>.
              </>
            ) : (
              <>
                This link
                <br />
                <span className={styles.accent}>didn't work</span>.
              </>
            )}
          </h1>
          <p className={styles.brandLede}>
            {state === "verifying"
              ? "Checking your sign-in link and setting up your session."
              : "Sign-in links expire after 15 minutes and can only be used once."}
          </p>
        </div>

        <footer className={styles.brandFooter}>
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
          {state === "verifying" ? (
            <>
              <header className={styles.authCardHead}>
                <h2 className={styles.authCardTitle}>Signing you in…</h2>
                <p className={styles.authCardSubtitle}>This takes a moment.</p>
              </header>
            </>
          ) : (
            <>
              <header className={styles.authCardHead}>
                <h2 className={styles.authCardTitle}>Link expired or already used</h2>
                <p className={styles.authCardSubtitle}>
                  Sign-in links last 15 minutes and work once. If you clicked an older email,
                  or already used this one, request a fresh link.
                </p>
              </header>

              <Link href="/login" className={styles.submitBtn} style={{ textAlign: "center" }}>
                Request a new link
              </Link>

              <div className={styles.authCardFoot}>
                Prefer a password? <Link href="/login">Sign in normally</Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
