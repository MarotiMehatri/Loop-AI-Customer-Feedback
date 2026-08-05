"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../lib/api/api-error";

import { AdminShell } from "../_components/AdminShell";
import ui from "../_components/admin.module.css";

interface ReportRow {
  id: string;
  title: string;
  type: string;
  status: string;
  aiSummary: string | null;
  generatedAt: string | null;
  createdAt: string;
}

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "new",
  GENERATING: "generating",
  COMPLETED: "completed",
  SCHEDULED: "pending",
  FAILED: "failed",
};

function statusBadge(status: string) {
  return <span className={`${ui.badge} ${STATUS_CLASS[status] ?? ui.pending}`}>{status}</span>;
}

export default function ReportsPage() {
  const router = useRouter();
  const [items, setItems] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ data: { items: ReportRow[] } }>("/reports", {
        params: { page: 1, limit: 20 },
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

  const generate = async (id: string) => {
    try {
      await apiClient.post(`/reports/${id}/generate`);
      toast.success("Report generation started");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      await apiClient.delete(`/reports/${id}`);
      toast.success("Report deleted");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AdminShell title="Reports" subtitle="Generate and manage customer feedback reports" active="reports">
      <div className={ui.body}>
        <section className={ui.card}>
          <header>
            <div>
              <h2>All reports</h2>
              <p>Feedback summaries, sentiment analysis, theme analysis and trends</p>
            </div>
            <button className={ui.primary} onClick={() => router.push("/protected/admin/reports/new")}>
              <Plus size={15} /> New report
            </button>
          </header>

          {loading && <p className={ui.empty}>Loading reports…</p>}
          {!loading && items.length === 0 && (
            <p className={ui.empty}>No reports yet. Create your first report to get started.</p>
          )}

          {!loading && items.length > 0 && (
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <button className={ui.link} onClick={() => router.push(`/protected/admin/reports/${item.id}`)}>
                        {item.title}
                      </button>
                      <p className={ui.muted} style={{ margin: "3px 0 0", fontSize: 11, maxWidth: 420 }}>
                        {item.aiSummary ?? item.type.replace(/_/g, " ")}
                      </p>
                    </td>
                    <td><span style={{ fontSize: 12, color: "#667085" }}>{item.type.replace(/_/g, " ")}</span></td>
                    <td>{statusBadge(item.status)}</td>
                    <td className={ui.muted}>{format(new Date(item.createdAt), "MMM d, yyyy")}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8 }}>
                        {item.status !== "COMPLETED" && (
                          <button className={ui.ghost} onClick={() => generate(item.id)}>Generate</button>
                        )}
                        <button className={ui.danger} onClick={() => remove(item.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </AdminShell>
  );
}
