"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "../../../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../../../lib/api/api-error";

import { AdminShell } from "../../../_components/AdminShell";
import ui from "../../../_components/admin.module.css";

interface ReportConfig {
  sources: string[];
  metrics: string[];
  startDate?: string | null;
  endDate?: string | null;
}

interface PreviewData {
  totalFeedback: number;
  positive: number;
  neutral: number;
  negative: number;
  sentimentDistribution: Array<{ name: string; value: number; percentage: number }>;
  channelDistribution: Array<{ name: string; value: number }>;
  feedbackOverTime: Array<{ date: string; value: number }>;
  topThemes: Array<{ name: string; value: number; percentage: number }>;
  generatedAt: string;
}

export default function ReportPreviewPage() {
  const params = useParams<{ reportId: string }>();
  const router = useRouter();
  const reportId = params.reportId;
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: reportData } = await apiClient.get<{ data: ReportConfig & { title: string } }>(`/reports/${reportId}`);
      const { data } = await apiClient.post<{ data: PreviewData }>("/reports/preview", {
        startDate: reportData.data.startDate ?? undefined,
        endDate: reportData.data.endDate ?? undefined,
        sources: reportData.data.sources,
        metrics: reportData.data.metrics,
      });
      setPreview(data.data);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    if (reportId) load();
  }, [load, reportId]);

  const maxValue = Math.max(...(preview?.feedbackOverTime.map((point) => point.value) ?? [1]));
  const themeMax = Math.max(...(preview?.topThemes.map((theme) => theme.value) ?? [1]));

  return (
    <AdminShell title="Report preview" subtitle="Live preview of the report data" active="reports">
      <div className={ui.body}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button className={ui.ghost} onClick={() => router.push(`/protected/admin/reports/${reportId}`)}>
            <ArrowLeft size={15} /> Back to report
          </button>
          <button className={ui.ghost} onClick={load}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {loading && <p className={ui.empty}>Generating preview…</p>}

        {!loading && preview && (
          <>
            <section className={ui.metrics}>
              {[
                ["Total feedback", preview.totalFeedback],
                ["Positive", preview.positive],
                ["Neutral", preview.neutral],
                ["Negative", preview.negative],
              ].map(([label, value]) => (
                <div key={label as string} className={ui.card}>
                  <p style={{ margin: 0, fontSize: 12, color: "#667085" }}>{label}</p>
                  <b style={{ fontSize: 22, letterSpacing: "-.5px" }}>{value as number}</b>
                </div>
              ))}
            </section>

            <div className={ui.grid2}>
              <section className={ui.card}>
                <header>
                  <div>
                    <h2>Feedback over time</h2>
                    <p>Volume across the selected period</p>
                  </div>
                </header>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120 }}>
                  {preview.feedbackOverTime.map((point) => (
                    <div key={point.date} style={{ flex: 1, display: "grid", gap: 4, alignItems: "end", textAlign: "center" }}>
                      <b style={{ fontSize: 9, color: "#667085" }}>{point.value}</b>
                      <div style={{ height: Math.max((point.value / maxValue) * 80, 3), background: "#5b2cf0", borderRadius: "4px 4px 0 0" }} />
                      <small style={{ fontSize: 8, color: "#98a2b3" }}>{point.date}</small>
                    </div>
                  ))}
                </div>
              </section>

              <section className={ui.card}>
                <header>
                  <div>
                    <h2>Top themes</h2>
                    <p>Most frequent themes in this period</p>
                  </div>
                </header>
                <div className={ui.stack}>
                  {preview.topThemes.map((theme) => (
                    <div key={theme.name} style={{ display: "grid", gridTemplateColumns: "110px 1fr 44px", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#344054" }}>{theme.name}</span>
                      <div style={{ height: 8, borderRadius: 99, background: "#f2f2f6", overflow: "hidden" }}>
                        <div style={{ width: `${(theme.value / themeMax) * 100}%`, height: "100%", background: "#5b2cf0" }} />
                      </div>
                      <b style={{ fontSize: 11, textAlign: "right" }}>{theme.percentage}%</b>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <section className={ui.card}>
              <header>
                <div>
                  <h2>Sentiment distribution</h2>
                  <p>Share of positive, neutral and negative feedback</p>
                </div>
              </header>
              <div className={ui.statusBar}>
                {[
                  ["#16a34a", preview.sentimentDistribution.find((item) => item.name.toLowerCase().includes("pos"))?.percentage ?? 0],
                  ["#f59e0b", preview.sentimentDistribution.find((item) => item.name.toLowerCase().includes("neu"))?.percentage ?? 0],
                  ["#ef2b36", preview.sentimentDistribution.find((item) => item.name.toLowerCase().includes("neg"))?.percentage ?? 0],
                ].map(([color, width]) => (
                  <div key={color as string} style={{ width: `${width}%`, background: color as string }} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
                {preview.sentimentDistribution.map((item) => (
                  <span key={item.name} style={{ fontSize: 12, color: "#667085" }}>
                    {item.name} <b style={{ color: "#161723" }}>{item.percentage}%</b>
                  </span>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </AdminShell>
  );
}
