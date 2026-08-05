"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  ChevronDown,
  CircleHelp,
  Download,
  FileText,
  Grid2X2,
  Inbox,
  Menu,
  Settings2,
  Sparkles,
  Users,
} from "lucide-react";

import { apiClient } from "../../../../lib/api/api-client";
import { useAuthStore } from "../../../../store";

import shell from "../analytics/analytics.module.css";

const NAVIGATION = [
  [Grid2X2, "Dashboard", "/protected/admin/dashboard"],
  [Inbox, "Inbox", "/protected/admin/inbox"],
  [BarChart3, "Analytics", "/protected/admin/analytics"],
  [Settings2, "Themes", "/protected/admin/themes"],
  [FileText, "Reports", "/protected/admin/reports"],
  [Sparkles, "Ask LOOP AI", "/protected/admin/ask-loop"],
  [Users, "Data sources", "/protected/admin/add-feedback"],
  [Download, "Exports", "/protected/admin/reports"],
] as const;

export type ActiveView =
  | "dashboard"
  | "inbox"
  | "analytics"
  | "themes"
  | "reports"
  | "ask-loop"
  | "add-feedback";

interface AdminShellProps {
  title: string;
  subtitle: string;
  active: ActiveView;
  children: React.ReactNode;
}

export function initials(name?: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AdminShell({ title, subtitle, active, children }: AdminShellProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    apiClient
      .get<{ data: number }>("/notifications/unread-count")
      .then(({ data }) => setUnread(data.data ?? 0))
      .catch(() => undefined);
  }, []);

  const handleUserMenu = () => {
    const action = window.confirm("Log out of LOOP?");
    if (action) {
      logout();
      router.push("/auth/login");
    }
  };

  return (
    <main className={shell.page}>
      <aside className={shell.sidebar}>
        <div className={shell.logo}>
          <span>∞</span> LOOP
        </div>
        <p className={shell.tagline}>
          AI Customer Feedback
          <br />
          Intelligence Platform
        </p>
        <nav>
          {NAVIGATION.map(([Icon, label, href]) => (
            <button
              key={label}
              onClick={() => router.push(href)}
              className={label.toLowerCase() === active ? shell.activeNav : ""}
            >
              <Icon size={19} /> <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className={shell.sidebarFooter}>
          <small>Current workspace</small>
          <button className={shell.workspace}>
            Acme Corp <ChevronDown size={15} />
          </button>
          <div className={shell.userMini}>
            <span>{initials(user?.name)}</span>
            <div>
              <b>{user?.name ?? "Alex Thompson"}</b>
              <small>{user?.role ?? "Analyst"}</small>
            </div>
            <ChevronDown size={14} />
          </div>
          <button onClick={handleUserMenu}>
            <CircleHelp size={19} /> <span>Help &amp; support</span>
          </button>
        </div>
      </aside>

      <div className={shell.main}>
        <header className={shell.topbar}>
          <button className={shell.menuButton} aria-label="Open navigation">
            <Menu size={25} />
          </button>
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className={shell.headerActions}>
            <button className={shell.iconButton} onClick={() => router.push("/protected/admin/notifications")}>
              <Bell size={21} />
              {unread > 0 && <i>{unread}</i>}
            </button>
            <button className={shell.help}>
              <CircleHelp size={22} />
            </button>
            <div className={shell.headerUser} onClick={handleUserMenu}>
              <span>{initials(user?.name)}</span>
              <div>
                <b>{user?.name ?? "Alex Thompson"}</b>
                <small>{user?.role ?? "Analyst"}</small>
              </div>
              <ChevronDown size={15} />
            </div>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}
