"use client";

import type { ReactNode } from "react";
import { Bell, CircleHelp, LogOut } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";
import { AuthGuard } from "./AuthGuard";

type AppShellProps = {
  title?: string;
  children: ReactNode;
};

export function AppShell({ title = "V-Secrets Console", children }: AppShellProps) {

  const router = useRouter();

  function handleLogout() {
    clearToken();
    router.push("/login");
  }

  return (
    <AuthGuard>
      <div className="shell">
        <Sidebar />

        <main className="main">
          <header className="topbar">
            <h2>{title}</h2>
            <div style={{ display: "flex", gap: 14, color: "var(--muted)" }}>
              <Bell size={20} />
              <CircleHelp size={20} />
              <button 
                className="topbar-icon-button"
                onClick={handleLogout}
                aria-label="Log out" 
              >
                <LogOut size={20} />
              </button>
            </div>
          </header>

          <div className="content">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}