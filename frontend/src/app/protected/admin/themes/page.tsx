"use client";

import { AdminShell } from "../_components/AdminShell";
import styles from "./themes.module.css";

type Theme = { id: string; name: string; description: string | null; status: string; feedbackCount: number; createdAt: string };
type Summary = { totalThemes: number; activeAssignments: number; aiGeneratedThemes: number; manuallyCreatedThemes: number; byStatus: Array<{ status: string; count: number }> };
const tones = ["purple", "blue", "green", "orange", "teal", "violet", "cyan"];

function count(summary: Summary | null, status: string) { return summary?.byStatus.find((item) => item.status === status)?.count ?? 0; }
function label(status: string) { return status[0] + status.slice(1).toLowerCase(); }

export default function ThemesPage() {
  return (
    <AdminShell title="Themes" subtitle="Discover and analyze key themes from customer feedback" active="themes">
      <div className={styles.page}>
        <section className={styles.content}></section>
      </div>
    </AdminShell>
  );
}
