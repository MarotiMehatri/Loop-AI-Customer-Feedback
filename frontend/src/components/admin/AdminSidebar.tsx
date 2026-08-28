"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type IconName =
  | "dashboard"
  | "inbox"
  | "plus"
  | "analytics"
  | "ai"
  | "reports"
  | "team"
  | "themes"
  | "notifications"
  | "settings"
  | "profile"
  | "logout"
  | "chevron"
  | "collapse";

interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  badge?: number | string;
  badgeType?: "danger" | "purple";
}

const workspaceItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/protected/admin/dashboard",
    icon: "dashboard",
  },
  {
    label: "Inbox",
    href: "/protected/admin/inbox",
    icon: "inbox",
    badge: 12,
    badgeType: "danger",
  },
  {
    label: "Add Feedback",
    href: "/protected/admin/add-feedback",
    icon: "plus",
  },
  {
    label: "Analytics",
    href: "/protected/admin/analytics",
    icon: "analytics",
  },
  {
    label: "Ask LOOP AI",
    href: "/protected/admin/ask-loop",
    icon: "ai",
  },
  {
    label: "Reports",
    href: "/protected/admin/reports",
    icon: "reports",
  },
];

const managementItems: NavItem[] = [
  {
    label: "Team",
    href: "/protected/admin/team",
    icon: "team",
  },
];

const systemItems: NavItem[] = [
  {
    label: "Themes",
    href: "/protected/admin/themes",
    icon: "themes",
    badge: "New",
    badgeType: "purple",
  },
  {
    label: "Notifications",
    href: "/protected/admin/notifications",
    icon: "notifications",
    badge: 8,
    badgeType: "purple",
  },
  {
    label: "Settings",
    href: "/protected/admin/settings",
    icon: "settings",
  },
];

function Icon({
  name,
  size = 20,
}: {
  name: IconName;
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );

    case "inbox":
      return (
        <svg {...common}>
          <path d="M4 5h16v14H4z" />
          <path d="M4 13h4l2 3h4l2-3h4" />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );

    case "analytics":
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h16" />
          <path d="m7 15 4-5 3 3 5-7" />
        </svg>
      );

    case "ai":
      return (
        <svg {...common}>
          <path d="m12 3 1.4 4.1L17 9l-3.6 1.9L12 15l-1.4-4.1L7 9l3.6-1.9L12 3Z" />
          <path d="m19 14 .7 2.1L22 17l-2.3.9L19 20l-.7-2.1L16 17l2.3-.9L19 14Z" />
          <path d="M5 15v4" />
          <path d="M3 17h4" />
        </svg>
      );

    case "reports":
      return (
        <svg {...common}>
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6" />
          <path d="M9 17h6" />
        </svg>
      );

    case "team":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5" />
          <path d="M16 5.5a3 3 0 0 1 0 5.5" />
          <path d="M18 15c2 .6 3 2 3 4" />
        </svg>
      );

    case "themes":
      return (
        <svg {...common}>
          <path d="M12 3a9 9 0 0 0 0 18h1.2a2 2 0 0 0 1.4-3.4 2 2 0 0 1 1.4-3.4H19A2 2 0 0 0 21 12a9 9 0 0 0-9-9Z" />
          <circle cx="7.5" cy="10" r="1" />
          <circle cx="10" cy="6.5" r="1" />
          <circle cx="15" cy="7" r="1" />
        </svg>
      );

    case "notifications":
      return (
        <svg {...common}>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6.3v-2.6H6.4a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3.3h2.6v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1V12h-.1a1.7 1.7 0 0 0-1.6 1Z" />
        </svg>
      );

    case "profile":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 21c0-4 3-6 7-6s7 2 7 6" />
        </svg>
      );

    case "logout":
      return (
        <svg {...common}>
          <path d="M10 4H5v16h5" />
          <path d="M14 8l4 4-4 4" />
          <path d="M18 12H9" />
        </svg>
      );

    case "chevron":
      return (
        <svg {...common}>
          <path d="m8 10 4 4 4-4" />
        </svg>
      );

    case "collapse":
      return (
        <svg {...common}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );

    default:
      return null;
  }
}

function NavLink({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const active =
    pathname === item.href ||
    (item.href !== "/protected/admin/dashboard" &&
      pathname.startsWith(`${item.href}/`));

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`loop-nav-link ${active ? "loop-nav-link-active" : ""}`}
      title={collapsed ? item.label : undefined}
    >
      <span className="loop-nav-icon">
        <Icon name={item.icon} />
      </span>

      {!collapsed && (
        <>
          <span className="loop-nav-label">{item.label}</span>

          {item.badge !== undefined && (
            <span
              className={`loop-nav-badge ${
                item.badgeType === "danger"
                  ? "loop-badge-danger"
                  : "loop-badge-purple"
              }`}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const [userName, setUserName] = useState("John Admin");
  const [userRole, setUserRole] = useState("Administrator");
  const [workspaceName, setWorkspaceName] = useState("Acme Corporation");

  useEffect(() => {
    try {
      const possibleKeys = [
        "loop-auth",
        "loop-auth-session",
        "auth",
        "auth-session",
      ];

      for (const key of possibleKeys) {
        const raw = localStorage.getItem(key);

        if (!raw) continue;

        const parsed = JSON.parse(raw);

        const user = parsed?.user ?? parsed?.data?.user ?? parsed;

        if (user?.name) {
          setUserName(user.name);
        }

        if (user?.role) {
          setUserRole(
            user.role === "ADMIN"
              ? "Administrator"
              : user.role === "ANALYST"
                ? "Analyst"
                : "Viewer",
          );
        }

        if (user?.workspace?.name) {
          setWorkspaceName(user.workspace.name);
        }

        if (user?.workspaceName) {
          setWorkspaceName(user.workspaceName);
        }

        break;
      }
    } catch {
      // Keep safe fallback values.
    }
  }, []);

  const navigate = (href: string) => {
    setMobileOpen(false);
    router.push(href);
  };

  const handleLogout = () => {
    try {
      const keys = [
        "loop-auth",
        "loop-auth-session",
        "auth",
        "auth-session",
        "accessToken",
        "refreshToken",
      ];

      keys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    } catch {
      // Ignore storage errors.
    }

    router.replace("/auth/login");
  };

  return (
    <>
      {mobileOpen && (
        <button
          className="loop-sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          "loop-sidebar",
          collapsed ? "loop-sidebar-collapsed" : "",
          mobileOpen ? "loop-sidebar-mobile-open" : "",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="loop-brand">
          <Link href="/protected/admin/dashboard" className="loop-brand-link">
            <span className="loop-brand-mark">
              <span>∞</span>
            </span>

            {!collapsed && (
              <span className="loop-brand-copy">
                <strong>LOOP</strong>
                <small>AI Customer Feedback</small>
              </span>
            )}
          </Link>

          <button
            type="button"
            className="loop-mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* Workspace */}
        <div className="loop-workspace-section">
          {!collapsed && (
            <span className="loop-section-title">WORKSPACE</span>
          )}

          <button
            type="button"
            className="loop-workspace-button"
            onClick={() => setWorkspaceOpen((value) => !value)}
            title={collapsed ? workspaceName : undefined}
          >
            <span className="loop-workspace-dot">✦</span>

            {!collapsed && (
              <>
                <span className="loop-workspace-name">
                  {workspaceName}
                </span>

                <Icon name="chevron" size={17} />
              </>
            )}
          </button>

          {workspaceOpen && !collapsed && (
            <div className="loop-workspace-menu">
              <button
                type="button"
                onClick={() => setWorkspaceOpen(false)}
              >
                <span className="loop-workspace-menu-icon">✦</span>
                {workspaceName}
                <span className="loop-current-dot" />
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceOpen(false)}
              >
                <span className="loop-workspace-menu-icon">+</span>
                Create workspace
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Navigation */}
        <div className="loop-sidebar-scroll">
          {!collapsed && (
            <div className="loop-nav-group-title">WORKSPACE</div>
          )}

          <nav className="loop-nav">
            {workspaceItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </nav>

          {!collapsed && (
            <div className="loop-nav-group-title loop-group-spaced">
              MANAGEMENT
            </div>
          )}

          <nav className="loop-nav">
            {managementItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </nav>

          {!collapsed && (
            <div className="loop-nav-group-title loop-group-spaced">
              SYSTEM
            </div>
          )}

          <nav className="loop-nav">
            {systemItems.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </nav>
        </div>

        {/* Bottom user */}
        <div className="loop-sidebar-bottom">
          <div className="loop-user-card">
            <Link
              href="/protected/admin/profile"
              className="loop-user-link"
              onClick={() => setMobileOpen(false)}
            >
              <span className="loop-avatar">
                {userName
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </span>

              {!collapsed && (
                <span className="loop-user-info">
                  <strong>{userName}</strong>
                  <small>{userRole}</small>
                </span>
              )}
            </Link>

            {!collapsed && (
              <button
                type="button"
                className="loop-user-menu-button"
                onClick={() => setUserOpen((value) => !value)}
                aria-label="Open account menu"
              >
                <Icon name="chevron" size={17} />
              </button>
            )}
          </div>

          {userOpen && !collapsed && (
            <div className="loop-user-menu">
              <button
                type="button"
                onClick={() => {
                  setUserOpen(false);
                  navigate("/protected/admin/profile");
                }}
              >
                <Icon name="profile" size={17} />
                Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  setUserOpen(false);
                  navigate("/protected/admin/settings");
                }}
              >
                <Icon name="settings" size={17} />
                Settings
              </button>

              <button
                type="button"
                className="loop-logout-menu"
                onClick={handleLogout}
              >
                <Icon name="logout" size={17} />
                Logout
              </button>
            </div>
          )}

          <button
            type="button"
            className="loop-logout-button"
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
          >
            <Icon name="logout" size={19} />

            {!collapsed && <span>Logout</span>}
          </button>

          <button
            type="button"
            className="loop-collapse-button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Icon
              name="collapse"
              size={17}
            />

            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* Desktop collapse */}
        <button
          type="button"
          className="loop-desktop-collapse"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon name="collapse" size={17} />
        </button>
      </aside>

      {/* Mobile menu trigger */}
      <button
        type="button"
        className="loop-mobile-menu"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <span />
        <span />
        <span />
      </button>
    </>
  );
}