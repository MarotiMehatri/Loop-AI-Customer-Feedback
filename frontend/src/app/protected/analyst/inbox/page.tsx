"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  Eye,
  FileEdit,
  Filter,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";

import { useFeedbackInbox } from "../../../../Features/feedback/hooks/useFeedbackInbox";

import styles from "./inbox.module.css";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function labelize(value?: string | null) {
  if (!value) return "-";

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function AnalystInboxPage() {
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [theme, setTheme] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useFeedbackInbox({
    page,
    limit: pageSize,
    search: search.trim() || undefined,
    source: source || undefined,
    sentiment: sentiment || undefined,
    theme: theme || undefined,
    status: status || undefined,
  });

  useEffect(() => {
    setPage(1);
  }, [search, source, sentiment, theme, status, pageSize]);

  const feedback = data?.items ?? [];

  const total = data?.pagination?.total ?? 0;

  const totalPages = Math.max(
    1,
    data?.pagination?.totalPages ??
      Math.ceil(total / pageSize),
  );

  const firstResult =
    total === 0 ? 0 : (page - 1) * pageSize + 1;

  const lastResult =
    total === 0
      ? 0
      : Math.min(page * pageSize, total);

  const metrics = useMemo(() => {
    return {
      total: data?.metrics?.total ?? total,
      new: data?.metrics?.new ?? 0,
      negative: data?.metrics?.negative ?? 0,
      pending: data?.metrics?.pending ?? 0,
      classified: data?.metrics?.classified ?? 0,
    };
  }, [data, total]);

  function clearFilters() {
    setSearch("");
    setSource("");
    setSentiment("");
    setTheme("");
    setStatus("");
    setPage(1);
  }

  function exportCsv() {
    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (source) params.set("source", source);
    if (sentiment) params.set("sentiment", sentiment);
    if (theme) params.set("theme", theme);
    if (status) params.set("status", status);

    window.open(
      `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1"}/feedback-inbox/export?${params.toString()}`,
      "_blank",
    );
  }

  return (
    <div className={styles.page}>
      {/* =====================================
          HEADER
      ====================================== */}

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.mobileMenu}>
            <button
              type="button"
              aria-label="Open navigation"
            >
              <SlidersHorizontal size={24} />
            </button>
          </div>

          <div>
            <h1>Inbox</h1>
            <p>All customer feedback in one place</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.dateButton}>
            <span>May 11 – May 17, 2024</span>
            <CalendarDays size={17} />
          </button>

          <button
            className={styles.iconButton}
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className={styles.notificationBadge}>
              3
            </span>
          </button>

          <button
            className={styles.iconButton}
            aria-label="Help"
          >
            <CircleHelp size={20} />
          </button>

          <div className={styles.userHeader}>
            <div className={styles.headerAvatar}>
              AT
            </div>

            <div>
              <strong>Alex Thompson</strong>
              <span>Analyst</span>
            </div>

            <ChevronDown size={16} />
          </div>
        </div>
      </header>

      {/* =====================================
          METRICS
      ====================================== */}

      <section className={styles.metricsGrid}>
        <Metric
          icon="feedback"
          title="Total Feedback"
          value={metrics.total}
          change="12.5%"
        />

        <Metric
          icon="new"
          title="New Feedback"
          value={metrics.new}
          change="8.7%"
        />

        <Metric
          icon="negative"
          title="Negative Feedback"
          value={metrics.negative}
          change="3.2%"
          down
        />

        <Metric
          icon="pending"
          title="Pending Review"
          value={metrics.pending}
          change="5.4%"
        />

        <Metric
          icon="ai"
          title="AI Classified"
          value={metrics.classified}
          change="15.3%"
        />
      </section>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <div className={styles.mainGrid}>
        <section className={styles.contentCard}>
          {/* Toolbar */}

          <div className={styles.toolbar}>
            <div className={styles.titleArea}>
              <h2>
                All Feedback{" "}
                <span>
                  ({formatNumber(total)})
                </span>
              </h2>
            </div>

            <div className={styles.toolbarActions}>
              <label className={styles.searchBox}>
                <Search size={18} />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search feedback, customer, source..."
                />
              </label>

              <button
                type="button"
                className={styles.secondaryButton}
              >
                <SlidersHorizontal size={16} />
                Bulk Actions
                <ChevronDown size={15} />
              </button>

              <button
                type="button"
                className={styles.secondaryButton}
                onClick={exportCsv}
              >
                <Upload size={17} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Table */}

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.checkboxCell}>
                    <input
                      type="checkbox"
                      aria-label="Select all feedback"
                    />
                  </th>

                  <th>Feedback</th>
                  <th>Source</th>
                  <th>Customer</th>
                  <th>Sentiment</th>
                  <th>Theme</th>
                  <th>Status</th>
                  <th>Date ↓</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading && (
                  <tr>
                    <td
                      colSpan={9}
                      className={styles.loading}
                    >
                      Loading feedback...
                    </td>
                  </tr>
                )}

                {!isLoading && error && (
                  <tr>
                    <td
                      colSpan={9}
                      className={styles.error}
                    >
                      <strong>
                        Unable to load feedback.
                      </strong>

                      <button
                        type="button"
                        onClick={() => refetch()}
                      >
                        Try again
                      </button>
                    </td>
                  </tr>
                )}

                {!isLoading &&
                  !error &&
                  feedback.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className={styles.empty}
                      >
                        No feedback found.
                      </td>
                    </tr>
                  )}

                {!isLoading &&
                  !error &&
                  feedback.map((item) => (
                    <FeedbackRow
                      key={item.id}
                      item={item}
                    />
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}

          <footer className={styles.pagination}>
            <span>
              Showing {firstResult} to {lastResult} of{" "}
              {formatNumber(total)} results
            </span>

            <div className={styles.paginationControls}>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1),
                  )
                }
              >
                <ChevronLeft size={17} />
              </button>

              {Array.from(
                {
                  length: Math.min(totalPages, 5),
                },
                (_, index) => index + 1,
              ).map((pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  className={
                    pageNumber === page
                      ? styles.currentPage
                      : ""
                  }
                  onClick={() =>
                    setPage(pageNumber)
                  }
                >
                  {pageNumber}
                </button>
              ))}

              {totalPages > 5 && (
                <>
                  <span>...</span>

                  <button
                    type="button"
                    onClick={() =>
                      setPage(totalPages)
                    }
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages, current + 1),
                  )
                }
              >
                <ChevronRight size={17} />
              </button>

              <select
                value={pageSize}
                onChange={(event) =>
                  setPageSize(
                    Number(event.target.value),
                  )
                }
                aria-label="Rows per page"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
            </div>
          </footer>
        </section>

        {/* =================================
            FILTER PANEL
        ================================== */}

        <aside className={styles.filterPanel}>
          <div className={styles.filterHeader}>
            <h2>Filters</h2>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear all
            </button>
          </div>

          <FilterSelect
            label="Workspace"
            value="Acme Corp"
            options={["Acme Corp"]}
            onChange={() => undefined}
          />

          <FilterSelect
            label="Source"
            value={source}
            options={[
              "",
              "SUPPORT",
              "APP_STORE",
              "SURVEY",
              "EMAIL",
              "WEB_FORM",
              "GOOGLE_PLAY",
              "SOCIAL",
              "WEBSITE",
              "SALES",
              "MANUAL",
            ]}
            onChange={setSource}
          />

          <FilterSelect
            label="Channel"
            value=""
            options={[
              "",
              "ALL",
            ]}
            onChange={() => undefined}
          />

          <FilterSelect
            label="Sentiment"
            value={sentiment}
            options={[
              "",
              "POSITIVE",
              "NEUTRAL",
              "NEGATIVE",
            ]}
            onChange={setSentiment}
          />

          <FilterSelect
            label="Theme"
            value={theme}
            options={[
              "",
              "PRICING",
              "UI_UX",
              "PRODUCT_BUG",
              "FEATURE_REQUEST",
              "CUSTOMER_SUPPORT",
              "PERFORMANCE",
            ]}
            onChange={setTheme}
          />

          <FilterSelect
            label="Status"
            value={status}
            options={[
              "",
              "NEW",
              "REVIEWED",
              "IN_PROGRESS",
              "CLOSED",
            ]}
            onChange={setStatus}
          />

          <div className={styles.dateFilter}>
            <span>Date Range</span>

            <button type="button">
              May 11 – May 17, 2024
              <CalendarDays size={15} />
            </button>
          </div>

          <button
            type="button"
            className={styles.applyButton}
            onClick={() => {
              setPage(1);
              refetch();
            }}
          >
            Apply Filters
          </button>

          {/* Saved views */}

          <div className={styles.savedViews}>
            <div className={styles.savedHeader}>
              <h2>Saved Views</h2>
              <button type="button">
                Manage
              </button>
            </div>

            <button
              type="button"
              className={styles.savedActive}
              onClick={clearFilters}
            >
              All Feedback
            </button>

            <button
              type="button"
              onClick={() =>
                setSentiment("NEGATIVE")
              }
            >
              Negative Feedback
            </button>

            <button
              type="button"
              onClick={() =>
                setStatus("NEW")
              }
            >
              Pending Review
            </button>

            <button
              type="button"
              onClick={() =>
                setTheme("PRODUCT_BUG")
              }
            >
              Product Bugs
            </button>

            <div className={styles.savedDivider} />

            <button
              type="button"
              className={styles.saveView}
            >
              + &nbsp; Save Current View
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* =========================================
   METRIC
========================================= */

function Metric({
  icon,
  title,
  value,
  change,
  down = false,
}: {
  icon: string;
  title: string;
  value: number;
  change: string;
  down?: boolean;
}) {
  return (
    <article
      className={`${styles.metricCard} ${
        styles[`metric-${icon}`]
      }`}
    >
      <div className={styles.metricIcon}>
        {icon === "feedback" && "▣"}
        {icon === "new" && "◫"}
        {icon === "negative" && "☹"}
        {icon === "pending" && "◷"}
        {icon === "ai" && "✦"}
      </div>

      <div>
        <p>{title}</p>

        <strong>{formatNumber(value)}</strong>

        <small
          className={
            down
              ? styles.changeDown
              : styles.changeUp
          }
        >
          {down ? "↓" : "↑"} {change}
          <span> vs last week</span>
        </small>
      </div>
    </article>
  );
}

/* =========================================
   FILTER
========================================= */

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className={styles.filterGroup}>
      <span>{label}</span>

      <div className={styles.selectWrapper}>
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
        >
          {options.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option
                ? labelize(option)
                : `All ${label}s`}
            </option>
          ))}
        </select>

        <ChevronDown size={15} />
      </div>
    </label>
  );
}

/* =========================================
   FEEDBACK ROW
========================================= */

function FeedbackRow({
  item,
}: {
  item: {
    id: string;
    text: string;
    customerName?: string | null;
    source?: string | null;
    sentiment?: string | null;
    theme?: string | null;
    status?: string | null;
    createdAt: string;
    externalId?: string | null;
  };
}) {
  return (
    <tr>
      <td className={styles.checkboxCell}>
        <input
          type="checkbox"
          aria-label={`Select ${item.id}`}
        />
      </td>

      <td className={styles.feedbackCell}>
        <strong>{item.text}</strong>

        <small>
          #{item.externalId ?? item.id}
        </small>
      </td>

      <td>
        <span className={styles.sourceBadge}>
          {labelize(item.source)}
        </span>
      </td>

      <td>
        {item.customerName ?? "Unknown customer"}
      </td>

      <td>
        <span
          className={`${styles.sentimentBadge} ${
            styles[
              `sentiment-${(
                item.sentiment ?? ""
              ).toLowerCase()}`
            ]
          }`}
        >
          {labelize(item.sentiment)}
        </span>
      </td>

      <td>
        {labelize(item.theme)}
      </td>

      <td>
        <span
          className={`${styles.statusBadge} ${
            styles[
              `status-${(
                item.status ?? ""
              ).toLowerCase()}`
            ]
          }`}
        >
          {labelize(item.status)}
        </span>
      </td>

      <td className={styles.dateCell}>
        {formatDate(item.createdAt)}
      </td>

      <td>
        <div className={styles.rowActions}>
          <button
            type="button"
            aria-label="View feedback"
          >
            <Eye size={17} />
          </button>

          <button
            type="button"
            aria-label="Edit feedback"
          >
            <FileEdit size={17} />
          </button>

          <button
            type="button"
            aria-label="More actions"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </td>
    </tr>
  );
}