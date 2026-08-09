"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Download, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "../../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../../lib/api/api-error";

import { AdminShell } from "../../_components/AdminShell";
import ui from "../../_components/admin.module.css";

interface ReportDetail {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  aiSummary: string | null;
  data: unknown;
  tags: string[];
  sources: string[];
  metrics: string[];
  createdAt: string;
  generatedAt: string | null;
}

const STATUS_CLASS: Record<string, string> = {
  DRAFT: "new",
  GENERATING: "generating",
  COMPLETED: "completed",
  SCHEDULED: "pending",
  FAILED: "failed",
};

export default function ReportDetailPage() {
  const params = useParams<{ reportId: string }>();
  const router = useRouter();
  const reportId = params.reportId;
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ data: ReportDetail }>(`/reports/${reportId}`);
      setReport(data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (reportId) load();
  }, [load, reportId]);

  const generate = async () => {
    try {
      await apiClient.post(`/reports/${reportId}/generate`);
      toast.success("Generation started — this may take a moment");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const exportReport = async () => {
    try {
      const response = await apiClient.get(`/reports/${reportId}/export`, {
        params: { format: "csv" },
        responseType: "blob",
      });
      const url = URL.createObjectURL(new Blob([response.data as BlobPart]));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${report?.title ?? "report"}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AdminShell title="Report" subtitle={report?.title ?? "Loading…"} active="reports">
      <div className={ui.body}>
        <button className={ui.ghost} onClick={() => router.push("/protected/admin/reports")}>
          <ArrowLeft size={15} /> Back to reports
        </button>

        {loading && <p className={ui.empty}>Loading report…</p>}
        {!loading && !report && <p className={ui.empty}>Report not found.</p>}

        {!loading && report && (
          <div className={ui.grid2}>
            <section className={ui.card}>
              <header>
                <div>
                  <h2>{report.title}</h2>
                  <p>{report.description ?? report.type.replace(/_/g, " ")}</p>
                </div>
                <span className={`${ui.badge} ${STATUS_CLASS[report.status] ?? ui.pending}`}>{report.status}</span>
              </header>

              <div className={ui.stack}>
                <div>
                  <b style={{ fontSize: 12 }}>AI summary</b>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#475467", lineHeight: 1.6 }}>
                    {report.aiSummary ?? "Not generated yet. Run generation to produce the AI summary."}
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <b style={{ fontSize: 12 }}>Type</b>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#667085" }}>{report.type.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <b style={{ fontSize: 12 }}>Created</b>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#667085" }}>
                      {format(new Date(report.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div>
                    <b style={{ fontSize: 12 }}>Sources</b>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#667085" }}>{report.sources.join(", ")}</p>
                  </div>
                  <div>
                    <b style={{ fontSize: 12 }}>Generated</b>
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#667085" }}>
                      {report.generatedAt ? format(new Date(report.generatedAt), "MMM d, yyyy HH:mm") : "—"}
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", paddingTop: 8 }}>
                  <button className={ui.primary} onClick={generate} disabled={report.status === "GENERATING"}>
                    <Play size={14} /> {report.status === "GENERATING" ? "Generating…" : "Generate report"}
                  </button>
                  <button className={ui.ghost} onClick={exportReport} disabled={report.status !== "COMPLETED"}>
                    <Download size={15} /> Export CSV
                  </button>
                  <button className={ui.ghost} onClick={() => router.push(`/protected/admin/reports/${reportId}/preview`)}>
                    <Sparkles size={15} /> Preview
                  </button>
                </div>
              </div>
            </section>

            <section className={ui.card}>
              <header>
                <div>
                  <h2>Metrics</h2>
                  <p>Selected metrics for this report</p>
                </div>
              </header>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {report.metrics.map((metric) => (
                  <span key={metric} className={`${ui.badge} ${ui.new}`}>{metric.replace(/_/g, " ")}</span>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
