import type { ReactNode } from "react";

import AdminSidebar from "../../../components/admin/AdminSidebar";
import AdminHeader from "../../../components/admin/AdminHeader";

import "./admin-shell.css";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <div className="loop-admin-shell">
      <AdminSidebar />

      <div className="loop-admin-main">
        <AdminHeader />

        <main className="loop-admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}