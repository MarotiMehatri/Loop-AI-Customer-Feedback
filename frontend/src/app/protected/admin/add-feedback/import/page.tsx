"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";

import { apiClient } from "../../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../../lib/api/api-error";

import ui from "../../_components/admin.module.css";

interface ImportRecord {
  id: string;
  fileName: string;
  status: string;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  createdAt: string;
}

export default function FeedbackImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [history, setHistory] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get<{ data: { items: ImportRecord[] } }>("/feedback-import/history", {
        params: { page: 1, limit: 8 },
      });
      setHistory(data.data.items ?? []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setImporting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await apiClient.post<{ data: ImportRecord }>("/feedback-import/csv", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Import started");
      setFile(null);
      if (data.data?.id) {
        router.push(`/protected/admin/inbox`);
      }
      loadHistory();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setImporting(false);
    }
  };

  const statusBadge = (status: string) => {
    const key = status.toLowerCase();
    return <span className={`${ui.badge} ${ui[key] ?? ui.pending}`}>{status}</span>;
  };

  return (
    
      <div className={ui.body}>
        <div className={ui.grid2}>
          <section className={ui.card}>
            <header>
              <div>
                <h2>Upload CSV</h2>
                <p>Supported columns: content, source, sentiment, status, customerName, customerEmail</p>
              </div>
            </header>
            <div className={ui.stack}>
              <label
                style={{
                  border: "2px dashed #d5d7e3",
                  borderRadius: 12,
                  padding: "34px 18px",
                  textAlign: "center",
                  display: "grid",
                  gap: 10,
                  cursor: "pointer",
                  background: "#fafafe",
                }}
              >
                <UploadCloud size={30} color="#5b2cf0" style={{ margin: "0 auto" }} />
                <b style={{ fontSize: 13 }}>{file ? file.name : "Choose a CSV file"}</b>
                <span style={{ fontSize: 11, color: "#98a2b3" }}>
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : "Click to browse your files"}
                </span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  style={{ display: "none" }}
                />
              </label>
              <button className={ui.primary} onClick={handleUpload} disabled={importing || !file}>
                {importing ? "Importing…" : "Start import"}
              </button>
            </div>
          </section>

          <section className={ui.card}>
            <header>
              <div>
                <h2>CSV template</h2>
                <p>Copy this structure into your file</p>
              </div>
            </header>
            <pre style={{ fontSize: 11, background: "#f4f4f9", padding: 14, borderRadius: 8, overflowX: "auto", lineHeight: 1.7 }}>
{`content,source,sentiment,status,customerName,customerEmail
"App crashes on upload",APP_STORE,NEGATIVE,NEW,Vikram Singh,vikram@example.com
"Great support experience",SUPPORT,POSITIVE,ACTIONED,Sneha Kulkarni,sneha@example.com
"Please add Slack integration",WEBSITE,NEUTRAL,NEW,Karan Mehta,karan@example.com`}
            </pre>
          </section>
        </div>

        <section className={ui.card}>
          <header>
            <div>
              <h2>Import history</h2>
              <p>Recent import jobs and their status</p>
            </div>
            <button className={ui.ghost} onClick={loadHistory}>Refresh</button>
          </header>
          {loading && <p className={ui.empty}>Loading history…</p>}
          {!loading && history.length === 0 && (
            <p className={ui.empty}>No imports yet. Upload your first CSV above.</p>
          )}
          {!loading && history.length > 0 && (
            <table className={ui.table}>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Imported</th>
                  <th>Failed</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id}>
                    <td><b>{item.fileName}</b></td>
                    <td>{statusBadge(item.status)}</td>
                    <td>{item.totalRows}</td>
                    <td>{item.importedRows}</td>
                    <td className={ui.muted}>{item.failedRows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    
  );
}
