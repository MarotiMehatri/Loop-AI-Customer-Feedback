
"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  CircleAlert,
  Clock3,
  Info,
  Mail,
  MailOpen,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../lib/api/api-error";

import styles from "./notifications.module.css";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
}

type Filter = "all" | "unread" | "read";

function getNotificationIcon(type: string) {
  const normalized = type.toLowerCase();

  if (
    normalized.includes("security") ||
    normalized.includes("alert") ||
    normalized.includes("error")
  ) {
    return <CircleAlert size={18} />;
  }

  if (
    normalized.includes("report") ||
    normalized.includes("analytics")
  ) {
    return <Info size={18} />;
  }

  if (
    normalized.includes("feedback") ||
    normalized.includes("import")
  ) {
    return <BellRing size={18} />;
  }

  return <Bell size={18} />;
}

function getTypeClass(type: string) {
  const normalized = type.toLowerCase();

  if (
    normalized.includes("security") ||
    normalized.includes("alert") ||
    normalized.includes("error")
  ) {
    return styles.typeDanger;
  }

  if (
    normalized.includes("report") ||
    normalized.includes("analytics")
  ) {
    return styles.typeInfo;
  }

  if (
    normalized.includes("feedback") ||
    normalized.includes("import")
  ) {
    return styles.typeSuccess;
  }

  return styles.typeDefault;
}

function getPriorityClass(priority: string) {
  const normalized = priority.toLowerCase();

  if (normalized === "high" || normalized === "urgent") {
    return styles.priorityHigh;
  }

  if (normalized === "medium") {
    return styles.priorityMedium;
  }

  return styles.priorityLow;
}

function formatType(type: string) {
  return type
    .replace(/[_-]/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async (showRefreshState = false) => {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data } = await apiClient.get<{
        data: { items: Notification[] };
      }>("/notifications", {
        params: {
          page: 1,
          limit: 30,
        },
      });

      setItems(data.data.items ?? []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.isRead).length,
    [items],
  );

  const readCount = items.length - unreadCount;

  const filteredItems = useMemo(() => {
    if (filter === "unread") {
      return items.filter((item) => !item.isRead);
    }

    if (filter === "read") {
      return items.filter((item) => item.isRead);
    }

    return items;
  }, [items, filter]);

  const markRead = async (id: string) => {
    setActionId(id);

    try {
      await apiClient.patch(`/notifications/${id}/read`);

      setItems((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                isRead: true,
              }
            : item,
        ),
      );

      toast.success("Notification marked as read");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionId(null);
    }
  };

  const markAllRead = async () => {
    if (unreadCount === 0) {
      toast.info("You're all caught up");
      return;
    }

    setActionId("all");

    try {
      await apiClient.patch("/notifications/read-all");

      setItems((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
        })),
      );

      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionId(null);
    }
  };

  const remove = async (id: string) => {
    setActionId(id);

    try {
      await apiClient.delete(`/notifications/${id}`);

      setItems((current) =>
        current.filter((item) => item.id !== id),
      );

      toast.success("Notification removed");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.backgroundGlow} />

      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.titleRow}>
              <div className={styles.titleIcon}>
                <BellRing size={22} />
              </div>

              <div>
                <p className={styles.eyebrow}>ADMIN CENTER</p>
                <h1>Notifications</h1>
                <p className={styles.subtitle}>
                  Stay updated with everything happening across your
                  feedback workspace.
                </p>
              </div>
            </div>

            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => void load(true)}
                disabled={refreshing || loading}
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? styles.spin : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => void markAllRead()}
                disabled={unreadCount === 0 || actionId === "all"}
              >
                <CheckCheck size={16} />
                {actionId === "all"
                  ? "Marking..."
                  : "Mark all read"}
              </button>
            </div>
          </div>
        </header>

        {/* Summary cards */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconPurple}`}>
              <Bell size={18} />
            </div>

            <div>
              <span className={styles.statLabel}>Total</span>
              <strong>{items.length}</strong>
              <small>All notifications</small>
            </div>
          </div>

          <div className={`${styles.statCard} ${styles.unreadCard}`}>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
              <Mail size={18} />
            </div>

            <div>
              <span className={styles.statLabel}>Unread</span>
              <strong>{unreadCount}</strong>
              <small>
                {unreadCount === 0
                  ? "You're all caught up"
                  : "Need your attention"}
              </small>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
              <MailOpen size={18} />
            </div>

            <div>
              <span className={styles.statLabel}>Read</span>
              <strong>{readCount}</strong>
              <small>Already reviewed</small>
            </div>
          </div>
        </section>

        {/* Main panel */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>Your notifications</h2>
              <p>
                Important updates, feedback activity and workspace
                events.
              </p>
            </div>

            <div className={styles.filters}>
              <button
                type="button"
                className={
                  filter === "all"
                    ? `${styles.filterButton} ${styles.filterActive}`
                    : styles.filterButton
                }
                onClick={() => setFilter("all")}
              >
                All
                <span>{items.length}</span>
              </button>

              <button
                type="button"
                className={
                  filter === "unread"
                    ? `${styles.filterButton} ${styles.filterActive}`
                    : styles.filterButton
                }
                onClick={() => setFilter("unread")}
              >
                Unread
                <span>{unreadCount}</span>
              </button>

              <button
                type="button"
                className={
                  filter === "read"
                    ? `${styles.filterButton} ${styles.filterActive}`
                    : styles.filterButton
                }
                onClick={() => setFilter("read")}
              >
                Read
                <span>{readCount}</span>
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className={styles.notificationList}>
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className={styles.skeletonItem}
                >
                  <div className={styles.skeletonIcon} />

                  <div className={styles.skeletonContent}>
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonText} />
                    <div className={styles.skeletonDate} />
                  </div>

                  <div className={styles.skeletonAction} />
                </div>
              ))}
            </div>
          )}

          {/* Empty */}
          {!loading && filteredItems.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                {filter === "unread" ? (
                  <CheckCheck size={30} />
                ) : (
                  <Bell size={30} />
                )}
              </div>

              <h3>
                {filter === "unread"
                  ? "You're all caught up"
                  : filter === "read"
                    ? "No read notifications"
                    : "No notifications yet"}
              </h3>

              <p>
                {filter === "unread"
                  ? "There are no unread notifications waiting for you."
                  : "New workspace activity and feedback updates will appear here."}
              </p>

              {filter !== "all" && (
                <button
                  type="button"
                  className={styles.emptyButton}
                  onClick={() => setFilter("all")}
                >
                  View all notifications
                </button>
              )}
            </div>
          )}

          {/* Notifications */}
          {!loading && filteredItems.length > 0 && (
            <div className={styles.notificationList}>
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  className={
                    item.isRead
                      ? styles.notification
                      : `${styles.notification} ${styles.notificationUnread}`
                  }
                >
                  <div
                    className={`${styles.notificationIcon} ${getTypeClass(item.type)}`}
                  >
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className={styles.notificationContent}>
                    <div className={styles.notificationTop}>
                      <div className={styles.titleGroup}>
                        <h3>{item.title}</h3>

                        {!item.isRead && (
                          <span className={styles.newBadge}>
                            <span />
                            New
                          </span>
                        )}
                      </div>

                      <span
                        className={`${styles.priority} ${getPriorityClass(item.priority)}`}
                      >
                        {item.priority}
                      </span>
                    </div>

                    <p className={styles.message}>{item.message}</p>

                    <div className={styles.notificationMeta}>
                      <span>
                        <Clock3 size={13} />
                        {format(
                          new Date(item.createdAt),
                          "MMM d, yyyy · HH:mm",
                        )}
                      </span>

                      <span className={styles.type}>
                        {formatType(item.type)}
                      </span>
                    </div>
                  </div>

                  <div className={styles.notificationActions}>
                    {!item.isRead && (
                      <button
                        type="button"
                        className={styles.readButton}
                        onClick={() => void markRead(item.id)}
                        disabled={actionId === item.id}
                        title="Mark as read"
                      >
                        <Check size={15} />
                        <span>Read</span>
                      </button>
                    )}

                    <button
                      type="button"
                      className={styles.deleteButton}
                      onClick={() => void remove(item.id)}
                      disabled={actionId === item.id}
                      title="Delete notification"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        {!loading && items.length > 0 && (
          <footer className={styles.footer}>
            <div className={styles.footerStatus}>
              <span className={styles.statusDot} />
              Notifications are synced with your workspace
            </div>

            <span>
              Showing {filteredItems.length} of {items.length}
            </span>
          </footer>
        )}
      </div>
    </main>
  );
}
