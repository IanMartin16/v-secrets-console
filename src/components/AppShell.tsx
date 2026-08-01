"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Bell,
  BookOpen,
  FolderOpen,
  HelpCircle,
  LayoutGrid,
  LogOut,
  ScrollText,
  Settings as SettingsIcon,
  Zap,
} from "lucide-react";

import { getMe, invalidateTokenCache } from "@/lib/api";
import type { UserProfile } from "@/lib/types";

import styles from "./AppShell.module.css";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
};

const PRIMARY_NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", Icon: LayoutGrid },
  { href: "/projects", label: "Projects", Icon: FolderOpen },
  { href: "/quickstart", label: "Quickstart", Icon: Zap },
  { href: "/audit-logs", label: "Audit Logs", Icon: ScrollText },
];

const WORKSPACE_NAV: NavItem[] = [
  { href: "/docs", label: "Docs", Icon: BookOpen },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

type AppShellProps = {
  title?: string;
  children: React.ReactNode;
};

type ExtendedSession = {
  accessToken?: string;
  provisioningFailed?: boolean;
};

export function AppShell({ title, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status, update: updateSession } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);

  // Auth gate + profile load.
  // The access token is NOT mirrored here — lib/api.ts reads it straight from
  // the NextAuth session on every request, so there is exactly one source of
  // truth and nothing can go stale behind our back.
  useEffect(() => {
    if (status === "loading") return;

    const extended = session as (typeof session & ExtendedSession) | null;

    // A session without a live accessToken means the FastAPI token expired and
    // the silent refresh failed. Treat it as signed out.
    if (status !== "authenticated" || !extended?.accessToken) {
      invalidateTokenCache();
      router.replace("/login");
      return;
    }

    if (extended.provisioningFailed) {
      console.error(
        "[AppShell] OAuth succeeded but FastAPI provisioning failed. " +
          "Check INTERNAL_PROVISION_SECRET and NEXT_PUBLIC_VSECRETS_API_URL.",
      );
    }

    getMe()
      .then(setUser)
      .catch(() => {
        // Silent fail — plan card falls back to static Free values
      });
  }, [router, status, session]);

  // iOS Safari restores pages from bfcache with frozen JS state, so the session
  // object in memory can be minutes or hours old. `pageshow` with persisted=true
  // is the only reliable signal for that restore — force a session refetch,
  // which re-runs the jwt callback and refreshes the FastAPI token.
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        invalidateTokenCache();
        void updateSession();
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [updateSession]);

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const displayTitle = title ?? deriveTitle(pathname);

  const secretsUsed = user?.usage?.secrets ?? 0;
  const secretsLimit = user?.limits?.secrets_per_project;
  const isUnlimited = secretsLimit === null || secretsLimit === undefined;
  const usagePercent = isUnlimited
    ? 0
    : Math.min(100, Math.round((secretsUsed / (secretsLimit as number)) * 100));

  async function handleSignOut() {
    invalidateTokenCache();
    await signOut({ callbackUrl: "/login" });
  }

  return (
    <div className={styles.console}>
      {/* -------- Sidebar -------- */}
      <aside className={styles.sidebar}>
        <Link href="/dashboard" className={styles.brandMark} aria-label="V-Secrets home">
          <span className={styles.brandMarkIcon} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
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
            <span className={styles.brandMarkTag}>Console</span>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item.href) ? styles.isActive : ""}`}
            >
              <item.Icon size={17} />
              {item.label}
            </Link>
          ))}

          <div className={styles.navSection}>
            <div className={styles.navSectionLabel}>Workspace</div>
            {WORKSPACE_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive(item.href) ? styles.isActive : ""}`}
              >
                <item.Icon size={17} />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.planCard}>
            <div className={styles.planCardHead}>
              <span className={styles.planCardLabel}>Plan</span>
              <span className={styles.planCardName}>Free</span>
            </div>
            <div className={styles.planProgress}>
              <div className={styles.planProgressRow}>
                <span>Secrets</span>
                <span>
                  {secretsUsed} / {isUnlimited ? "∞" : secretsLimit}
                </span>
              </div>
              <div className={styles.planProgressBar}>
                <div
                  className={styles.planProgressFill}
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            </div>
            <Link href="/settings/billing" className={styles.planCta}>
              Upgrade to Pro
            </Link>
          </div>
        </div>
      </aside>

      {/* -------- Main area -------- */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <span>Workspace</span>
            <span className={styles.topbarDivider}>/</span>
            <span className={styles.topbarCurrent}>{displayTitle}</span>
          </div>
          <div className={styles.topbarActions}>
            <button className={styles.iconBtn} type="button" aria-label="Notifications">
              <Bell size={17} />
            </button>
            <button className={styles.iconBtn} type="button" aria-label="Help">
              <HelpCircle size={17} />
            </button>
            <button
              className={styles.iconBtn}
              type="button"
              aria-label="Sign out"
              onClick={handleSignOut}
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}

function deriveTitle(pathname: string): string {
  if (pathname === "/dashboard" || pathname === "/") return "Overview";
  if (pathname.startsWith("/projects")) return "Projects";
  if (pathname.startsWith("/quickstart")) return "Quickstart";
  if (pathname.startsWith("/audit-logs")) return "Audit logs";
  if (pathname.startsWith("/docs")) return "Docs";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Console";
}
