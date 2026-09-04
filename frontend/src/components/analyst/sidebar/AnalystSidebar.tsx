
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  ChevronDown,
  Database,
  FileBarChart,
  FileDown,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import styles from "./AnalystSidebar.module.css";

interface AnalystSidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
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
  collapsed,
  onCollapsedChange,
  mobileOpen = false,
  onMobileClose,
}: AnalystSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const handleCollapse = () => {
    onCollapsedChange(!collapsed);
  };

  return (
    <>
      {/* =====================================================
          MOBILE OVERLAY
      ====================================================== */}
      {mobileOpen && (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Close sidebar"
          onClick={onMobileClose}
        />
      )}

      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <aside
        className={[
          styles.sidebar,
          collapsed ? styles.sidebarCollapsed : "",
          mobileOpen ? styles.sidebarMobileOpen : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* ===================================================
            BRAND
        ==================================================== */}
        <div className={styles.brandSection}>
          <Link
            href="/protected/analyst/dashboard"
            className={styles.brand}
            onClick={onMobileClose}
            aria-label="LOOP Analyst Dashboard"
          >
            <span className={styles.logoMark}>
              <span className={styles.logoLoop}>∞</span>
            </span>

            {!collapsed && (
              <span className={styles.logoText}>
                LOOP
              </span>
            )}
          </Link>

          {!collapsed && (
            <p className={styles.brandSubtitle}>
              AI Customer Feedback
              <br />
              Intelligence Platform
            </p>
          )}

          {/* Desktop collapse */}
          <button
            type="button"
            className={styles.collapseButton}
            onClick={handleCollapse}
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
            title={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {collapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </button>

          {/* Mobile close */}
          <button
            type="button"
            className={styles.mobileCloseButton}
            onClick={onMobileClose}
            aria-label="Close navigation"
          >
            <X size={22} />
          </button>
        </div>

        {/* ===================================================
            NAVIGATION
        ==================================================== */}
        <nav
          className={styles.navigation}
          aria-label="Analyst navigation"
        >
          {!collapsed && (
            <span className={styles.sectionLabel}>
              WORKSPACE
            </span>
          )}

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  styles.navItem,
                  active
                    ? styles.navItemActive
                    : "",
                  collapsed
                    ? styles.navItemCollapsed
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={onMobileClose}
                title={
                  collapsed
                    ? item.label
                    : undefined
                }
                aria-current={
                  active ? "page" : undefined
                }
              >
                <span className={styles.navIcon}>
                  <Icon
                    size={20}
                    strokeWidth={2}
                  />
                </span>

                {!collapsed && (
                  <span className={styles.navLabel}>
                    {item.label}
                  </span>
                )}

                {active && (
                  <span
                    className={styles.activeIndicator}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ===================================================
            SIDEBAR BOTTOM
        ==================================================== */}
        <div className={styles.sidebarBottom}>
          {/* Workspace */}
          {!collapsed ? (
            <button
              type="button"
              className={styles.workspaceCard}
            >
              <span className={styles.workspaceLogo}>
                AC
              </span>

              <span className={styles.workspaceContent}>
                <span className={styles.workspaceLabel}>
                  Current Workspace
                </span>

                <span className={styles.workspaceName}>
                  Acme Corp
                </span>
              </span>

              <ChevronDown
                size={17}
                className={styles.workspaceArrow}
              />
            </button>
          ) : (
            <button
              type="button"
              className={styles.collapsedWorkspace}
              title="Current Workspace: Acme Corp"
              aria-label="Current Workspace: Acme Corp"
            >
              AC
            </button>
          )}

          {/* Upgrade */}
          {!collapsed ? (
            <button
              type="button"
              className={styles.upgradeButton}
            >
              <span className={styles.crownIcon}>
                <Star
                  size={17}
                  fill="currentColor"
                />
              </span>

              <span>Upgrade Plan</span>
            </button>
          ) : (
            <button
              type="button"
              className={styles.collapsedUpgrade}
              title="Upgrade Plan"
              aria-label="Upgrade Plan"
            >
              <Star
                size={18}
                fill="currentColor"
              />
            </button>
          )}

          <div className={styles.divider} />

          {/* Profile */}
          {!collapsed ? (
            <button
              type="button"
              className={styles.profileCard}
            >
              <span className={styles.avatar}>
                AT
              </span>

              <span className={styles.profileInfo}>
                <span className={styles.profileName}>
                  Alex Thompson
                </span>

                <span className={styles.profileRole}>
                  Analyst
                </span>
              </span>

              <ChevronDown
                size={17}
                className={styles.profileArrow}
              />
            </button>
          ) : (
            <button
              type="button"
              className={styles.collapsedProfile}
              title="Alex Thompson · Analyst"
              aria-label="Alex Thompson · Analyst"
            >
              AT
            </button>
          )}

          <div className={styles.divider} />

          {/* Logout */}
          <Link
            href="/protected/analyst/logout"
            className={[
              styles.logoutButton,
              collapsed
                ? styles.logoutCollapsed
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={onMobileClose}
            title={
              collapsed
                ? "Logout"
                : undefined
            }
          >
            <LogOut
              size={20}
              strokeWidth={2}
            />

            {!collapsed && (
              <span>Logout</span>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}

/* =========================================================
   MOBILE SIDEBAR TRIGGER
========================================================= */

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
      title="Open navigation"
    >
      <Menu size={24} />
    </button>
  );
}
