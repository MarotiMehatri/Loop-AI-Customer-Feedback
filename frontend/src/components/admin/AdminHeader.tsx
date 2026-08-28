"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

function SearchIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

const pageMeta: Record<
  string,
  { title: string; description: string }
> = {
  "/protected/admin/dashboard": {
    title: "Dashboard 👋",
    description: "Welcome back! Here's what's happening with your feedback.",
  },
  "/protected/admin/inbox": {
    title: "Feedback Inbox",
    description: "All customer feedback from different sources.",
  },
  "/protected/admin/add-feedback": {
    title: "Add New Feedback",
    description: "Manually add customer feedback.",
  },
  "/protected/admin/analytics": {
    title: "Analytics",
    description: "Deep insights from customer feedback.",
  },
  "/protected/admin/ask-loop": {
    title: "Ask LOOP AI",
    description: "Ask questions about your customer feedback in plain language.",
  },
  "/protected/admin/reports": {
    title: "Reports",
    description: "Create, view and download insights from your customer feedback.",
  },
  "/protected/admin/team": {
    title: "Team",
    description: "Manage workspace members and invitations.",
  },
  "/protected/admin/themes": {
    title: "Themes",
    description: "Discover and manage customer feedback themes.",
  },
  "/protected/admin/notifications": {
    title: "Notifications",
    description: "Updates, alerts and activity in your workspace.",
  },
  "/protected/admin/settings": {
    title: "Settings",
    description: "Workspace settings and preferences.",
  },
  "/protected/admin/profile": {
    title: "Profile",
    description: "Your account details and preferences.",
  },
};

export default function AdminHeader() {
  const pathname = usePathname();

  const [search, setSearch] = useState("");

  const meta = useMemo(() => {
    if (pageMeta[pathname]) {
      return pageMeta[pathname];
    }

    const matching = Object.entries(pageMeta).find(([route]) =>
      pathname.startsWith(route),
    );

    return (
      matching?.[1] ?? {
        title: "LOOP",
        description: "AI Customer Feedback Intelligence Platform.",
      }
    );
  }, [pathname]);

  return (
    <header className="loop-header">
      <div className="loop-header-title">
        <div className="loop-title-accent" />

        <div>
          <h1>{meta.title}</h1>
          <p>{meta.description}</p>
        </div>
      </div>

      <div className="loop-header-actions">
        <div className="loop-global-search">
          <SearchIcon />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search feedback, customers, themes..."
            aria-label="Search"
          />

          <kbd>⌘ K</kbd>
        </div>

        <Link
          href="/protected/admin/notifications"
          className="loop-header-icon-button"
          aria-label="Notifications"
        >
          <BellIcon />
          <span className="loop-header-notification-count">8</span>
        </Link>

        <Link
          href="/protected/admin/profile"
          className="loop-header-profile"
        >
          <span className="loop-header-avatar">JA</span>

          <span className="loop-header-profile-copy">
            <strong>John Admin</strong>
            <small>Administrator</small>
          </span>

          <span className="loop-header-chevron">⌄</span>
        </Link>
      </div>
    </header>
  );
}