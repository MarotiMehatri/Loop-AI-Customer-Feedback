"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronDown,
  FileBarChart,
  FileDown,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Network,
  Settings2,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X,
  Database,
} from "lucide-react";

import styles from "./AnalystSidebar.module.css";

interface AnalystSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/protected/analyst/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Inbox",
    href: "/protected/analyst/inbox",
    icon: Inbox,
  },
  {
    label: "Analytics",
    href: "/protected/analyst/analytics",
    icon: BarChart3,
  },
  {
    label: "Themes",
    href: "/protected/analyst/themes",
    icon: Network,
  },
  {
    label: "Trends",
    href: "/protected/analyst/trends",
    icon: TrendingUp,
  },
  {
    label: "Reports",
    href: "/protected/analyst/reports",
    icon: FileBarChart,
  },
  {
    label: "Ask LOOP AI",
    href: "/protected/analyst/ask-loop",
    icon: Sparkles,
  },
  {
    label: "Data Sources",
    href: "/protected/analyst/data-sources",
    icon: Database,
  },
  {
    label: "Exports",
    href: "/protected/analyst/exports",
    icon: FileDown,
  },
  {
    label: "Team",
    href: "/protected/analyst/team",
    icon: Users,
  },
];

export default function AnalystSidebar({
  mobileOpen = false,
  onMobileClose,
}: AnalystSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/analyst") {
      return pathname === "/analyst";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = () => {
    // Clear authentication data if your application stores it locally.
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Close sidebar"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          mobileOpen ? styles.sidebarMobileOpen : ""
        }`}
      >
        {/* =========================
            BRAND
        ========================== */}
        <div className={styles.brandSection}>
          <Link href="/analyst" className={styles.brand}>
            <span className={styles.logoMark}>
              <span className={styles.logoLoop}>∞</span>
            </span>

            <span className={styles.logoText}>LOOP</span>
          </Link>

          <p className={styles.brandSubtitle}>
            AI Customer Feedback
            <br />
            Intelligence Platform
          </p>

          <button
            type="button"
            className={styles.mobileCloseButton}
            onClick={onMobileClose}
            aria-label="Close navigation"
          >
            <X size={23} />
          </button>
        </div>

        {/* =========================
            NAVIGATION
        ========================== */}
        <nav className={styles.navigation} aria-label="Analyst navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${
                  active ? styles.navItemActive : ""
                }`}
                onClick={onMobileClose}
              >
                <span className={styles.navIcon}>
                  <Icon size={21} strokeWidth={2} />
                </span>

                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* =========================
            BOTTOM AREA
        ========================== */}
        <div className={styles.sidebarBottom}>
          {/* Workspace */}
          <button type="button" className={styles.workspaceCard}>
            <div className={styles.workspaceContent}>
              <span className={styles.workspaceLabel}>
                Current Workspace
              </span>

              <span className={styles.workspaceName}>Acme Corp</span>
            </div>

            <ChevronDown
              size={19}
              className={styles.workspaceArrow}
            />
          </button>

          {/* Upgrade */}
          <button type="button" className={styles.upgradeButton}>
            <span className={styles.crownIcon}>
              <Star size={20} fill="currentColor" />
            </span>

            <span>Upgrade Plan</span>
          </button>

          <div className={styles.divider} />

          {/* User */}
          <button type="button" className={styles.profileCard}>
            <span className={styles.avatar}>AT</span>

            <span className={styles.profileInfo}>
              <span className={styles.profileName}>Alex Thompson</span>
              <span className={styles.profileRole}>Analyst</span>
            </span>

            <ChevronDown
              size={18}
              className={styles.profileArrow}
            />
          </button>

          <div className={styles.divider} />

          {/* Logout */}
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
          >
            <LogOut size={21} strokeWidth={2} />

            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

/**
 * Mobile menu button.
 *
 * Keep this separate so the Analyst layout/header can
 * control opening the sidebar on small screens.
 */
export function AnalystSidebarTrigger({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={styles.sidebarTrigger}
      onClick={onClick}
      aria-label="Open navigation"
    >
      <Menu size={26} />
    </button>
  );
}