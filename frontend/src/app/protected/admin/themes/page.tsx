"use client";

import { AdminShell } from "../_components/AdminShell";
import styles from "./themes.module.css";

export default function ThemesPage() {
  return (
    <AdminShell title="Themes" subtitle="Discover and analyze key themes from customer feedback" active="themes">
      <div className={styles.page}>
        <section className={styles.content}></section>
      </div>
    </AdminShell>
  );
}
