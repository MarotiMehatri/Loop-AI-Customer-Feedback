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
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  return (
    <div className={styles.layout}>
      <AnalystSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className={styles.mainArea}>
        <header className={styles.mobileHeader}>
          <AnalystSidebarTrigger
            onClick={() => setMobileSidebarOpen(true)}
          />

          <div className={styles.mobileLogo}>
            <span className={styles.mobileLogoIcon}>∞</span>
            <span>LOOP</span>
          </div>
        </header>

        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}