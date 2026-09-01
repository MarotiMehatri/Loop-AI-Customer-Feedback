"use client";

import Link from "next/link";

import styles from "../../auth/login/login.module.css";

export default function UnauthorizedPage() {
  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <i>∞</i> LOOP
          </span>
          <p className={styles.tagline}>
            AI Customer Feedback
            <br />
            Intelligence Platform
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ margin: 0, fontSize: 22, letterSpacing: "-.5px" }}>
            403 · Access denied
          </h1>
          <p style={{ margin: "8px 0 22px", fontSize: 12, color: "#667085" }}>
            You do not have permission to view this page. Contact your workspace
            administrator if you believe this is a mistake.
          </p>
          <Link href="/protected/admin/dashboard">
            <span
              className={styles.submit}
              style={{ display: "block", lineHeight: "44px" }}
            >
              Back to dashboard
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
