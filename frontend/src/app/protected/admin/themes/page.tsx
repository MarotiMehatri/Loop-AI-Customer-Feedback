"use client";

import { useEffect, useState } from "react";

import { AdminShell } from "../_components/AdminShell";
import { apiClient } from "../../../../lib/api/api-client";
import styles from "./themes.module.css";

type Theme = { id: string; name: string; description: string | null; status: string; feedbackCount: number; createdAt: string };
type Summary = { totalThemes: number; activeAssignments: number; aiGeneratedThemes: number; manuallyCreatedThemes: number; byStatus: Array<{ status: string; count: number }> };
const tones = ["purple", "blue", "green", "orange", "teal", "violet", "cyan"];

function count(summary: Summary | null, status: string) { return summary?.byStatus.find((item) => item.status === status)?.count ?? 0; }
function label(status: string) { return status[0] + status.slice(1).toLowerCase(); }

export default function ThemesPage() {
  const [items, setItems] = useState<Theme[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [themes, summaryResult] = await Promise.all([
        apiClient.get<{ data: { items: Theme[] } }>("/theme", { params: { page: 1, limit: 100, sortBy: "updatedAt", sortOrder: "desc" } }),
        apiClient.get<{ data: Summary }>("/theme/summary"),
      ]);
      setItems(themes.data.data.items ?? []);
      setSummary(summaryResult.data.data);
    } catch { setItems([]); setSummary(null); } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  return (
    <AdminShell title="Themes" subtitle="Discover and analyze key themes from customer feedback" active="themes">
      <div className={styles.page}>
        <section className={styles.content}>
          {loading ? <p>Loading themes…</p> : null}
        </section>
      </div>
    </AdminShell>
  );
}
