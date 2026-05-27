"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  Folder,
  Home,
  Settings,
  Zap,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/projects", label: "Projects", icon: Folder },
  { href: "/quickstart", label: "Quickstart", icon: Zap },
  { href: "/audit", label: "Audit Logs", icon: FileText },
];

const secondaryItems = [
  { href: "/docs", label: "Docs", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Image
          src="/vsecrets-logo.png"
          alt="V-Secrets"
          width={260}
          height={80}
          className="sidebar-logo"
          priority
        />
      </div>

      <nav className="nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              className={`nav-item ${active ? "active" : ""}`}
              href={item.href}
              prefetch={false}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <nav className="nav nav-section">
        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              className={`nav-item ${active ? "active" : ""}`}
              href={item.href}
              prefetch={false}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <strong style={{ color: "var(--text)" }}>Plan: Free</strong>
        <div style={{ marginTop: 6 }}>Secrets usage: 0 / 25</div>
      </div>
    </aside>
  );
}