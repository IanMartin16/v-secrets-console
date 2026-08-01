"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import styles from "../../login/login.module.css";

const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
  Configuration: {
    title: "Server configuration error",
    message:
      "There is a problem with the auth configuration on the server. This is not your fault — please try again or contact support.",
  },
  AccessDenied: {
    title: "Access denied",
    message: "You don't have permission to sign in. Contact your workspace admin.",
  },
  Verification: {
    title: "Verification failed",
    message: "The sign-in link is invalid or has expired. Request a new one.",
  },
  OAuthSignin: {
    title: "OAuth sign-in failed",
    message:
      "We couldn't start the OAuth flow with the provider. Check your network connection and try again.",
  },
  OAuthCallback: {
    title: "OAuth callback failed",
    message:
      "The OAuth provider redirected back with an error. Make sure the callback URL is registered correctly.",
  },
  OAuthAccountNotLinked: {
    title: "Account already exists",
    message:
      "An account with that email already exists but was created with a different sign-in method. Sign in with your original method.",
  },
  email_required: {
    title: "Email required",
    message:
      "GitHub didn't return an email address for your account. Make your primary email public on GitHub or use a different sign-in method.",
  },
  Default: {
    title: "Something went wrong",
    message: "An unexpected error occurred during sign-in. Please try again.",
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorCode =
    searchParams.get("error") ?? searchParams.get("reason") ?? "Default";
  const errorInfo = ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.Default;

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
          <div className={styles.eyebrow}>Auth error</div>
          <h1 className={styles.brandHeadline}>
            Sign-in didn't
            <br />
            <span className={styles.accent}>complete</span>.
          </h1>
          <p className={styles.brandLede}>
            We hit a snag during authentication. The details on the right will help you
            figure out what to try next.
          </p>
        </div>

        <footer className={styles.brandFooter}>
          <div className={styles.brandMeta}>
            Need help? Contact{" "}
            <Link href="mailto:support@vsecrets.dev">support@vsecrets.dev</Link>
          </div>
        </footer>
      </aside>

      <main className={styles.formColumn}>
        <div className={styles.authCard}>
          <header className={styles.authCardHead}>
            <h2 className={styles.authCardTitle}>{errorInfo.title}</h2>
            <p className={styles.authCardSubtitle}>{errorInfo.message}</p>
          </header>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <Link href="/login" className={styles.oauthBtn}>
              Back to sign in
            </Link>
            <Link href="/" className={styles.fieldHelp} style={{ textAlign: "center" }}>
              Return home
            </Link>
          </div>

          <div className={styles.authCardFoot}>
            Error code: <code style={{ opacity: 0.7 }}>{errorCode}</code>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  );
}
