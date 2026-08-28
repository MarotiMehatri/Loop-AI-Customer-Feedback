"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Bell,
  ChevronDown,
  CircleHelp,
  LogOut,
  Menu,
  Search,
  X,
} from "lucide-react";

import { usePathname, useRouter } from "next/navigation";

import type { Role } from "../../../../Features/Auth/auth.types";

import { apiClient } from "../../../../lib/api/api-client";

import { useAuthStore } from "../../../../store";

import {
  getNavigationForRole,
} from "../../../../config/navigation";

import styles from "./admin.module.css";

export type ActiveView =
  | "dashboard"
  | "inbox"
  | "add-feedback"
  | "analytics"
  | "ask-loop"
  | "reports"
  | "team"
  | "themes"
  | "notifications"
  | "settings"
  | "profile";

interface AdminShellProps {
  title: string;
  subtitle?: string;
  active?: ActiveView;
  children: React.ReactNode;
}

export function initials(
  name?: string | null,
): string {
  if (!name) {
    return "LU";
  }

  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function roleLabel(role?: Role | null): string {
  if (!role) {
    return "User";
  }

  return (
    role.charAt(0) +
    role.slice(1).toLowerCase()
  );
}

export function AdminShell({
  title,
  subtitle,
  children,
}: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const user = useAuthStore(
    (state) => state.user,
  );

  const logout = useAuthStore(
    (state) => state.logout,
  );

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [unread, setUnread] =
    useState(0);

  const role = user?.role;

  const navigation = useMemo(
    () => getNavigationForRole(role),
    [role],
  );

  useEffect(() => {
    let mounted = true;

    apiClient
      .get<{ data: number }>(
        "/notifications/unread-count",
      )
      .then(({ data }) => {
        if (mounted) {
          setUnread(data.data ?? 0);
        }
      })
      .catch(() => {
        if (mounted) {
          setUnread(0);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?",
    );

    if (!confirmed) {
      return;
    }

    logout();

    router.replace("/auth/login");
  };

  const openProfile = () => {
    setMobileOpen(false);
    router.push(
      "/protected/admin/profile",
    );
  };

  const isActive = (
    href: string,
  ): boolean => {
    if (
      pathname === href
    ) {
      return true;
    }

    return pathname.startsWith(
      `${href}/`,
    );
  };

  return (
    <div className={styles.shell}>
      {mobileOpen && (
        <button
          className={styles.overlay}
          aria-label="Close navigation"
          onClick={() =>
            setMobileOpen(false)
          }
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          mobileOpen
            ? styles.sidebarOpen
            : ""
        }`}
      >
        <div
          className={
            styles.brandArea
          }
        >
          <div
            className={
              styles.brandMark
            }
          >
            ∞
          </div>

          <div>
            <div
              className={
                styles.brandName
              }
            >
              LOOP
            </div>

            <div
              className={
                styles.brandCaption
              }
            >
              AI Customer
              <br />
              Feedback Intelligence
            </div>
          </div>

          <button
            className={
              styles.mobileClose
            }
            onClick={() =>
              setMobileOpen(false)
            }
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <div
          className={
            styles.workspaceCard
          }
        >
          <span>
            WORKSPACE
          </span>

          <button
            onClick={() =>
              router.push(
                "/protected/admin/settings",
              )
            }
          >
            <strong>
              {user?.workspaceId
                ? "Current Workspace"
                : "LOOP Workspace"}
            </strong>

            <ChevronDown size={15} />
          </button>
        </div>

        <nav
          className={styles.navigation}
          aria-label="Admin navigation"
        >
          {navigation.map(
            (section) => (
              <div
                key={section.label}
                className={
                  styles.navSection
                }
              >
                <p
                  className={
                    styles.sectionTitle
                  }
                >
                  {section.label}
                </p>

                {section.items.map(
                  (item) => {
                    const Icon =
                      item.icon;

                    const active =
                      isActive(
                        item.href,
                      );

                    return (
                      <button
                        key={
                          item.href
                        }
                        type="button"
                        className={`${styles.navItem} ${
                          active
                            ? styles.navItemActive
                            : ""
                        }`}
                        onClick={() => {
                          setMobileOpen(
                            false,
                          );

                          router.push(
                            item.href,
                          );
                        }}
                      >
                        <span
                          className={
                            styles.navIcon
                          }
                        >
                          <Icon
                            size={18}
                            strokeWidth={
                              active
                                ? 2.4
                                : 2
                            }
                          />
                        </span>

                        <span>
                          {item.label}
                        </span>

                        {item.label ===
                          "Notifications" &&
                          unread >
                            0 && (
                            <b
                              className={
                                styles.badge
                              }
                            >
                              {unread >
                              99
                                ? "99+"
                                : unread}
                            </b>
                          )}
                      </button>
                    );
                  },
                )}
              </div>
            ),
          )}
        </nav>

        <div
          className={
            styles.sidebarBottom
          }
        >
          <button
            className={
              styles.bottomLink
            }
            onClick={() =>
              router.push(
                "/protected/admin/notifications",
              )
            }
          >
            <Bell size={17} />
            Notifications

            {unread > 0 && (
              <span
                className={
                  styles.bottomBadge
                }
              >
                {unread}
              </span>
            )}
          </button>

          <button
            className={
              styles.bottomLink
            }
            onClick={() =>
              router.push(
                "/protected/admin/settings",
              )
            }
          >
            <CircleHelp size={17} />
            Help & Support
          </button>

          <div
            className={
              styles.profileMini
            }
          >
            <button
              className={
                styles.profileButton
              }
              onClick={
                openProfile
              }
            >
              <span
                className={
                  styles.avatar
                }
              >
                {initials(
                  user?.name,
                )}
              </span>

              <span
                className={
                  styles.profileText
                }
              >
                <strong>
                  {user?.name ??
                    "LOOP User"}
                </strong>

                <small>
                  {roleLabel(
                    user?.role,
                  )}
                </small>
              </span>

              <ChevronDown
                size={15}
              />
            </button>

            <button
              className={
                styles.logoutButton
              }
              onClick={
                handleLogout
              }
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <section
        className={styles.content}
      >
        <header
          className={
            styles.topbar
          }
        >
          <div
            className={
              styles.topbarLeft
            }
          >
            <button
              className={
                styles.menuButton
              }
              onClick={() =>
                setMobileOpen(
                  true,
                )
              }
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div>
              <h1>
                {title}
              </h1>

              {subtitle && (
                <p>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div
            className={
              styles.topbarActions
            }
          >
            <div
              className={
                styles.search
              }
            >
              <Search
                size={17}
              />

              <input
                placeholder="Search..."
                aria-label="Search"
              />

              <kbd>
                /
              </kbd>
            </div>

            <button
              className={
                styles.headerIcon
              }
              onClick={() =>
                router.push(
                  "/protected/admin/notifications",
                )
              }
              aria-label="Notifications"
            >
              <Bell size={19} />

              {unread > 0 && (
                <span
                  className={
                    styles.notificationDot
                  }
                >
                  {unread >
                  9
                    ? "9+"
                    : unread}
                </span>
              )}
            </button>

            <button
              className={
                styles.headerProfile
              }
              onClick={
                openProfile
              }
            >
              <span
                className={
                  styles.headerAvatar
                }
              >
                {initials(
                  user?.name,
                )}
              </span>

              <span
                className={
                  styles.headerUserText
                }
              >
                <strong>
                  {user?.name ??
                    "LOOP User"}
                </strong>

                <small>
                  {roleLabel(
                    user?.role,
                  )}
                </small>
              </span>

              <ChevronDown
                size={15}
              />
            </button>
          </div>
        </header>

        <main
          className={
            styles.pageContent
          }
        >
          {children}
        </main>
      </section>
    </div>
  );
}
