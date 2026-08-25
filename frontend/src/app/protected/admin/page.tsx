import DashboardPage from "./dashboard/page";

/**
 * Admin landing page.
 *
 * The admin dashboard is already implemented in ./dashboard/page.tsx.
 * Rendering that page here makes /protected/admin a valid route while
 * keeping one source of truth for the dashboard UI and logic.
 */
export default function AdminPage() {
  return <DashboardPage />;
}