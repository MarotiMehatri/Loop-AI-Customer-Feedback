"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiClient } from "../../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../../lib/api/api-error";

import { AdminShell } from "../../_components/AdminShell";
import ui from "../../_components/admin.module.css";

const TYPES = ["VOICE_OF_CUSTOMER", "INSIGHTS", "ANALYTICS", "SUMMARY", "SENTIMENT", "THEMES", "CUSTOM"] as const;
const SOURCES = ["SUPPORT", "APP_STORE", "SURVEY", "SALES", "SOCIAL", "WEBSITE", "EMAIL", "MANUAL"] as const;
const METRICS = [
  "TOTAL_FEEDBACK",
  "POSITIVE_FEEDBACK",
  "NEGATIVE_FEEDBACK",
  "NEUTRAL_FEEDBACK",
  "SENTIMENT_DISTRIBUTION",
  "TOP_THEMES",
  "FEEDBACK_TREND",
  "RESPONSE_RATE",
  "CHANNEL_DISTRIBUTION",
] as const;

export default function NewReportPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("VOICE_OF_CUSTOMER");
  const [sources, setSources] = useState<string[]>(["SUPPORT", "SURVEY", "EMAIL"]);
  const [metrics, setMetrics] = useState<string[]>(["TOTAL_FEEDBACK", "SENTIMENT_DISTRIBUTION", "TOP_THEMES"]);
  const [submitting, setSubmitting] = useState(false);

  const toggle = (list: string[], setter: (next: string[]) => void, value: string) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await apiClient.post<{ data: { id: string } }>("/reports", {
        title,
        description: description || undefined,
        type,
        sources,
        metrics,
        charts: [
          { type: "BAR", metric: "TOTAL_FEEDBACK", title: "Feedback volume" },
          { type: "PIE", metric: "SENTIMENT_DISTRIBUTION", title: "Sentiment split" },
        ],
      });
      toast.success("Report created");
      router.push(`/protected/admin/reports/${data.data.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="New report" subtitle="Configure a new customer feedback report" active="reports">
      <div className={ui.body}>
        <form onSubmit={handleSubmit}>
          <div className={ui.grid2}>
            <section className={ui.card}>
              <header>
                <div>
                  <h2>Details</h2>
                  <p>Basic information about the report</p>
                </div>
              </header>
              <label className={ui.field}>
                Title
                <input className={ui.input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Q3 Voice of Customer" required minLength={2} />
              </label>
              <label className={ui.field}>
                Description <span>Optional</span>
                <textarea className={ui.textarea} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this report about?" />
              </label>
              <label className={ui.field}>
                Type
                <select className={ui.select} value={type} onChange={(e) => setType(e.target.value)}>
                  {TYPES.map((value) => <option key={value} value={value}>{value.replace(/_/g, " ")}</option>)}
                </select>
              </label>
            </section>

            <section className={ui.card}>
              <header>
                <div>
                  <h2>Data</h2>
                  <p>Choose sources and metrics</p>
                </div>
              </header>
              <b style={{ fontSize: 12, display: "block", marginBottom: 8 }}>Sources</b>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                {SOURCES.map((source) => (
                  <button
                    key={source}
                    type="button"
                    className={ui.badge}
                    style={{
                      border: sources.includes(source) ? "1px solid #5b2cf0" : "1px solid #e2e3ea",
                      background: sources.includes(source) ? "#f6f3ff" : "#fff",
                      color: sources.includes(source) ? "#4338ca" : "#667085",
                    }}
                    onClick={() => toggle(sources, setSources, source)}
                  >
                    {source}
                  </button>
                ))}
              </div>
              <b style={{ fontSize: 12, display: "block", marginBottom: 8 }}>Metrics</b>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {METRICS.map((metric) => (
                  <button
                    key={metric}
                    type="button"
                    className={ui.badge}
                    style={{
                      border: metrics.includes(metric) ? "1px solid #5b2cf0" : "1px solid #e2e3ea",
                      background: metrics.includes(metric) ? "#f6f3ff" : "#fff",
                      color: metrics.includes(metric) ? "#4338ca" : "#667085",
                    }}
                    onClick={() => toggle(metrics, setMetrics, metric)}
                  >
                    {metric.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button className={ui.primary} type="submit" disabled={submitting}>
              {submitting ? "Creating…" : "Create report"}
            </button>
            <button className={ui.ghost} type="button" onClick={() => router.push("/protected/admin/reports")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
