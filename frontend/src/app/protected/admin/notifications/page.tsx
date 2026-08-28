"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Bell, CheckCheck, Mail, MailOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../lib/api/api-error";

import ui from "../_components/admin.module.css";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ data: { items: Notification[] } }>("/notifications", {
        params: { page: 1, limit: 30 },
      });
      setItems(data.data.items ?? []);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setItems((current) => current.map((item) => (item.id === id ? { ...item, isRead: true } : item)));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch("/notifications/read-all");
      setItems((current) => current.map((item) => ({ ...item, isRead: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async (id: string) => {
    try {
      await apiClient.delete(`/notifications/${id}`);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const unread = items.filter((item) => !item.isRead).length;

  return (
    
      <div className={ui.body}>
        <section className={ui.card}>
          <header>
            <div>
              <h2>Notifications {unread > 0 && `(${unread} unread)`}</h2>
              <p>What&apos;s happening across your feedback</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className={ui.ghost} onClick={markAllRead}><CheckCheck size={15} /> Mark all read</button>
              <button className={ui.ghost} onClick={load}>Refresh</button>
            </div>
          </header>

          {loading && <p className={ui.empty}>Loading notifications…</p>}
          {!loading && items.length === 0 && (
            <p className={ui.empty}>
              <Bell size={22} style={{ display: "block", margin: "0 auto 10px" }} />
              No notifications yet.
            </p>
          )}

          {!loading && items.length > 0 && (
            <div className={ui.stack}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    padding: "13px 4px",
                    borderBottom: "1px solid #f2f2f6",
                  }}
                >
                  <span style={{ marginTop: 2 }}>
                    {item.isRead ? <MailOpen size={17} color="#98a2b3" /> : <Mail size={17} color="#5b2cf0" />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <b style={{ fontSize: 13 }}>{item.title}</b>
                      {!item.isRead && <span className={`${ui.badge} ${ui.new}`}>New</span>}
                    </div>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#667085", lineHeight: 1.55 }}>{item.message}</p>
                    <small style={{ fontSize: 10, color: "#98a2b3" }}>
                      {format(new Date(item.createdAt), "MMM d, HH:mm")}
                    </small>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {!item.isRead && (
                      <button className={ui.ghost} style={{ height: 30, padding: "0 9px" }} onClick={() => markRead(item.id)}>
                        Read
                      </button>
                    )}
                    <button className={ui.danger} style={{ height: 30, padding: "0 9px" }} onClick={() => remove(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    
  );
}
