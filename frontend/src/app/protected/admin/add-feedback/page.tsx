"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";

import { apiClient } from "../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../lib/api/api-error";

import { AdminShell } from "../_components/AdminShell";
import ui from "../_components/admin.module.css";

const SOURCES = [
  ["SUPPORT", "Support"],
  ["APP_STORE", "App store"],
  ["SURVEY", "Survey"],
  ["SALES", "Sales"],
  ["SOCIAL", "Social"],
  ["WEBSITE", "Website"],
  ["EMAIL", "Email"],
  ["MANUAL", "Manual"],
] as const;

const SENTIMENTS = [
  ["POS", "Positive"],
  ["NEU", "Neutral"],
  ["NEG", "Negative"],
] as const;

interface FeedbackRow {
  id: string;
  content: string;
  sentiment: string;
  status: string;
  source: string;
  customerName: string | null;
  createdAt: string;
}

export default function AddFeedbackPage() {
  const router = useRouter();
  const [source, setSource] = useState("SUPPORT");
  const [sentiment, setSentiment] = useState("POS");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [items, setItems] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRecent = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ data: { items: FeedbackRow[] } }>("/feedback", {
        params: { page: 1, limit: 6 },
      });
      setItems(data.data.items);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await apiClient.post("/feedback", {
        source,
        sentiment,
        customerName: customerName || undefined,
        customerEmail: customerEmail || undefined,
        category: category || undefined,
        content,
        status: "NEW",
        isImportant: false,
      });
      toast.success("Feedback added");
      setContent("");
      setCategory("");
      setCustomerName("");
      setCustomerEmail("");
      loadRecent();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminShell title="Data sources" subtitle="Add feedback manually or import it from files" active="add-feedback">
      <div className={ui.body}>
        <div className={ui.grid2}>
          <section className={ui.card}>
            <header>
              <div>
                <h2>Add feedback</h2>
                <p>Create a feedback entry from any channel</p>
              </div>
            </header>
            <form onSubmit={handleSubmit}>
              <div className={ui.grid2}>
                <label className={ui.field}>
                  Source
                  <select className={ui.select} value={source} onChange={(e) => setSource(e.target.value)}>
                    {SOURCES.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label className={ui.field}>
                  Sentiment
                  <select className={ui.select} value={sentiment} onChange={(e) => setSentiment(e.target.value)}>
                    {SENTIMENTS.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className={ui.field}>
                Customer name <span>Optional</span>
                <input className={ui.input} value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Priya Sharma" />
              </label>
              <label className={ui.field}>
                Customer email <span>Optional</span>
                <input className={ui.input} type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="priya@example.com" />
              </label>
              <label className={ui.field}>
                Category <span>Optional</span>
                <input className={ui.input} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Pricing, Product Bug, Feature Request…" />
              </label>
              <label className={ui.field}>
                Feedback
                <textarea className={ui.textarea} value={content} onChange={(e) => setContent(e.target.value)} placeholder="What did the customer say?" required />
              </label>
              <button className={ui.primary} type="submit" disabled={submitting}>
                {submitting ? "Adding…" : "Add feedback"}
              </button>
            </form>
          </section>

          <section className={ui.card}>
            <header>
              <div>
                <h2>Import feedback</h2>
                <p>Bulk import from a CSV file</p>
              </div>
              <button className={ui.primary} onClick={() => router.push("/protected/admin/add-feedback/import")}>
                Go to import
              </button>
            </header>
            <div className={ui.stack}>
              <p style={{ fontSize: 13, color: "#667085", margin: 0, lineHeight: 1.6 }}>
                Upload a CSV with columns such as <b>content</b>, <b>source</b>,{" "}
                <b>sentiment</b>, <b>status</b>, <b>customerName</b> and{" "}
                <b>customerEmail</b>. LOOP validates the rows, classifies them, and
                reports any errors so you can fix and retry.
              </p>
              <ul style={{ fontSize: 12, color: "#344054", lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
                <li>Up to 5,000 rows per file</li>
                <li>Supported: CSV files only</li>
                <li>Required columns: content, source</li>
              </ul>
            </div>
          </section>
        </div>

        <section className={ui.card}>
          <header>
            <div>
              <h2>Recent feedback</h2>
              <p>The latest entries in this workspace</p>
            </div>
            <button className={ui.ghost} onClick={loadRecent}>Refresh</button>
          </header>
          {loading && <p className={ui.empty}>Loading feedback…</p>}
          {!loading && items.length === 0 && (
            <p className={ui.empty}>No feedback yet. Add your first entry above.</p>
          )}
          {!loading && items.length > 0 && (
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Feedback</th>
                  <th>Source</th>
                  <th>Sentiment</th>
                  <th>Status</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} onClick={() => router.push(`/protected/admin/inbox/${item.id}`)} style={{ cursor: "pointer" }}>
                    <td><b>{item.customerName ?? "Anonymous"}</b></td>
                    <td className={ui.muted}>{item.content.slice(0, 90)}{item.content.length > 90 ? "…" : ""}</td>
                    <td>{item.source}</td>
                    <td>{item.sentiment}</td>
                    <td>{item.status}</td>
                    <td className={ui.muted}>{format(new Date(item.createdAt), "MMM d, HH:mm")}</td>
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
