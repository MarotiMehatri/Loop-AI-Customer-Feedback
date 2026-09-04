
"use client";

import { ReactNode, useState } from "react";

import {
  AnalystSidebar,
  AnalystSidebarTrigger,
} from "../../../components/analyst/sidebar";

import styles from "./layout.module.css";

interface AnalystLayoutProps {
  children: ReactNode;
}

export default function AnalystLayout({
  children,
}: AnalystLayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Sidebar collapsed state is controlled here so the
  // children/main content can resize automatically.
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`${styles.layout} ${
        collapsed ? styles.layoutCollapsed : ""
      }`}
    >
      {/* =========================
          SIDEBAR
      ========================== */}
      <AnalystSidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* =========================
          MAIN APPLICATION AREA
      ========================== */}
      <div
        className={`${styles.mainArea} ${
          collapsed ? styles.mainAreaCollapsed : ""
        }`}
      >
        {/* =========================
            MOBILE HEADER
        ========================== */}
        <header
          className={styles.mobileHeader}
          aria-label="Analyst mobile navigation"
        >
          <div className={styles.mobileHeaderLeft}>
            <AnalystSidebarTrigger
              onClick={() => setMobileSidebarOpen(true)}
            />

            <div className={styles.mobileBrand}>
              <span className={styles.mobileBrandIcon}>∞</span>

              <div className={styles.mobileBrandText}>
                <span className={styles.mobileBrandName}>LOOP</span>
                <span className={styles.mobileBrandSubtitle}>
                  Analyst
                </span>
              </div>
            </div>
          </div>

          <div className={styles.mobileStatus}>
            <span className={styles.statusDot} />
            <span>Live</span>
          </div>
        </header>

        {/* =========================
            PAGE CONTENT
        ========================== */}
        <main className={styles.content}>
          <div className={styles.contentInner}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
