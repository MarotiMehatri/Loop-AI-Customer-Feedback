 "use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  Eye,
  FileBarChart2,
  FileText,
  Filter,
  Info,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { createReport, deleteReport, exportReport, listReports } from "../../../../Features/reports/api/reports.api";
import type {
  CreateReportPayload,
  Report,
  ReportStatus,
  ReportType,
} from "../../../../Features/reports/reports.types";

import styles from "./reports.module.css";

const EMPTY_REPORTS: Report[] = [];

const TYPE_LABELS: Record<ReportType, string> = {
  VOICE_OF_CUSTOMER: "Voice of Customer",
  INSIGHTS: "Product Insights",
  ANALYTICS: "Analytics",
  SUMMARY: "Executive Summary",
  SENTIMENT: "Sentiment Analysis",
  THEMES: "Theme Deep Dive",
  CUSTOM: "Custom Report",
};

const TYPE_TONES: Record<ReportType, string> = {
  VOICE_OF_CUSTOMER: "purple",
  INSIGHTS: "blue",
  ANALYTICS: "blue",
  SUMMARY: "purple",
  SENTIMENT: "orange",
  THEMES: "green",
  CUSTOM: "red",
};

const SOURCE_LABELS: Record<string, string> = {
  SUPPORT: "Support Ticket",
  APP_STORE: "App Store",
  SURVEY: "Survey",
  SALES: "Sales",
  SOCIAL: "Social Media",
  WEBSITE: "Website",
  EMAIL: "Email",
  MANUAL: "Manual",
};

const PAGE_SIZE = 8;

function unwrapDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value?: string | null) {
  const date = unwrapDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string | null) {
  const date = unwrapDate(value);
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function getSources(report: Report): string[] {
  if (!Array.isArray(report.sources)) return [];

  return report.sources
    .map((item) => {
      if (typeof item === "string") return item;
      return "";
    })
    .filter(Boolean);
}

function sourceLabel(report: Report) {
  const source = getSources(report)[0];
  return source ? SOURCE_LABELS[source] ?? source.replaceAll("_", " ") : "All Sources";
}

function statusLabel(status: ReportStatus) {
  return {
    DRAFT: "Draft",
    GENERATING: "Generating",
    COMPLETED: "Completed",
    FAILED: "Failed",
    SCHEDULED: "Scheduled",
  }[status];
}

function statusTone(status: ReportStatus) {
  return {
    DRAFT: "draft",
    GENERATING: "generating",
    COMPLETED: "completed",
    FAILED: "failed",
    SCHEDULED: "scheduled",
  }[status];
}

function reportCountForDay(reports: Report[], date: Date) {
  return reports.filter((report) => {
    const created = unwrapDate(report.createdAt);
    return (
      created &&
      created.getFullYear() === date.getFullYear() &&
      created.getMonth() === date.getMonth() &&
      created.getDate() === date.getDate()
    );
  }).length;
}

function Donut({
  segments,
  center,
}: {
  segments: Array<{ value: number; className: string }>;
  center: string;
}) {
  const total = segments.reduce((sum, item) => sum + item.value, 0) || 1;
  let cursor = 0;

  const gradient = segments
    .map((segment) => {
      const start = (cursor / total) * 100;
      cursor += segment.value;
      const end = (cursor / total) * 100;
      return `var(--${segment.className}) ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div
      className={styles.donut}
      style={{ background: `conic-gradient(${gradient})` }}
      aria-label={`${center} total`}
    >
      <div className={styles.donutInner}>
        <strong>{center}</strong>
        <span>Total</span>
      </div>
    </div>
  );
}

export default function AnalystReportsPage() {
  const [reports, setReports] = useState<Report[]>(EMPTY_REPORTS);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<ReportType | "">("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);

  const [form, setForm] = useState<{
    title: string;
    description: string;
    type: ReportType;
    source: string;
    startDate: string;
    endDate: string;
    schedule: boolean;
    scheduledAt: string;
  }>({
    title: "",
    description: "",
    type: "SUMMARY",
    source: "",
    startDate: "",
    endDate: "",
    schedule: false,
    scheduledAt: "",
  });

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await listReports();
      setReports(Array.isArray(response.reports) ? response.reports : []);
    } catch (error) {
      console.error("Failed to load reports", error);
      setReports([]);
      toast.error("Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !query ||
        report.title.toLowerCase().includes(query) ||
        (report.description ?? "").toLowerCase().includes(query) ||
        TYPE_LABELS[report.type].toLowerCase().includes(query);

      const matchesStatus =
        !statusFilter || report.status === statusFilter;

      const matchesType =
        !typeFilter || report.type === typeFilter;

      const matchesSource =
        !sourceFilter || getSources(report).includes(sourceFilter);

      return matchesSearch && matchesStatus && matchesType && matchesSource;
    });
  }, [reports, search, statusFilter, typeFilter, sourceFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, typeFilter, sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
  const visibleReports = filteredReports.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const stats = useMemo(() => {
    const total = reports.length;
    const completed = reports.filter((r) => r.status === "COMPLETED").length;
    const scheduled = reports.filter((r) => r.status === "SCHEDULED").length;
    const downloads = reports.reduce(
      (sum, report) =>
        sum +
        (Array.isArray(report.exports) ? report.exports.length : 0),
      0,
    );

    const generationTimes = reports
      .filter((report) => report.createdAt && report.generatedAt)
      .map((report) => {
        const start = new Date(report.createdAt).getTime();
        const end = new Date(report.generatedAt as string).getTime();
        return end > start ? end - start : 0;
      })
      .filter(Boolean);

    const averageMs =
      generationTimes.length > 0
        ? generationTimes.reduce((a, b) => a + b, 0) / generationTimes.length
        : 0;

    return {
      total,
      completed,
      scheduled,
      downloads,
      average:
        averageMs > 0
          ? `${Math.floor(averageMs / 60000)}m ${Math.max(
              1,
              Math.round((averageMs % 60000) / 1000),
            )}s`
          : "—",
    };
  }, [reports]);

  const topViewed = useMemo(() => {
    return [...reports]
      .map((report) => ({
        report,
        views:
          typeof report.data === "object" &&
          report.data !== null &&
          "views" in report.data
            ? Number((report.data as { views?: unknown }).views ?? 0)
            : 0,
      }))
      .sort((a, b) => b.views - a.views)[0];
  }, [reports]);

  const typeCounts = useMemo(() => {
    return (Object.keys(TYPE_LABELS) as ReportType[])
      .map((type) => ({
        type,
        count: reports.filter((report) => report.type === type).length,
      }))
      .filter((item) => item.count > 0);
  }, [reports]);

  const sourceCounts = useMemo(() => {
    const counts = new Map<string, number>();

    reports.forEach((report) => {
      const sources = getSources(report);
      const key = sources[0] ?? "ALL";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return [...counts.entries()]
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }, [reports]);

  const chartDays = useMemo(() => {
    const result: Array<{ label: string; value: number }> = [];
    const now = new Date();

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now);
      date.setHours(0, 0, 0, 0);
      date.setDate(now.getDate() - i);

      result.push({
        label: new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(date),
        value: reportCountForDay(reports, date),
      });
    }

    return result;
  }, [reports]);

  const chartMax = Math.max(1, ...chartDays.map((item) => item.value));

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) {
      toast.error("Report name is required.");
      return;
    }

    if (form.schedule && !form.scheduledAt) {
      toast.error("Select a schedule date and time.");
      return;
    }

    const payload: CreateReportPayload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      startDate: form.startDate
        ? new Date(`${form.startDate}T00:00:00`).toISOString()
        : undefined,
      endDate: form.endDate
        ? new Date(`${form.endDate}T23:59:59`).toISOString()
        : undefined,
      sources: form.source ? [form.source] : undefined,
      status: form.schedule ? "SCHEDULED" : "GENERATING",
      scheduledAt: form.schedule
        ? new Date(form.scheduledAt).toISOString()
        : undefined,
      filters: {},
      metrics: ["feedback", "sentiment", "themes"],
      tags: [],
    };

    setCreating(true);

    try {
      await createReport(payload);
      toast.success(
        form.schedule ? "Report scheduled." : "Report generation started.",
      );
      setShowCreate(false);
      setForm({
        title: "",
        description: "",
        type: "SUMMARY",
        source: "",
        startDate: "",
        endDate: "",
        schedule: false,
        scheduledAt: "",
      });
      await loadReports();
    } catch (error) {
      console.error("Failed to create report", error);
      toast.error("Unable to create the report.");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(report: Report) {
    const confirmed = window.confirm(
      `Delete "${report.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await deleteReport(report.id);
      setMenuId(null);
      setSelectedReport(null);
      toast.success("Report deleted.");
      await loadReports();
    } catch (error) {
      console.error("Failed to delete report", error);
      toast.error("Unable to delete report.");
    }
  }

  async function handleExport(report: Report) {
    setExportingId(report.id);

    try {
      const firstExport = Array.isArray(report.exports)
        ? report.exports[0]
        : null;

      if (firstExport?.fileUrl) {
        window.open(firstExport.fileUrl, "_blank", "noopener,noreferrer");
      } else {
        const response = await exportReport(report.id, "PDF");

        const unwrapped =
          response &&
          typeof response === "object" &&
          "data" in response
            ? (response as { data?: unknown }).data
            : response;

        const fileUrl =
          typeof unwrapped === "object" &&
          unwrapped !== null &&
          "fileUrl" in unwrapped
            ? String((unwrapped as { fileUrl?: unknown }).fileUrl ?? "")
            : "";

        if (fileUrl) {
          window.open(fileUrl, "_blank", "noopener,noreferrer");
        } else {
          toast.success("Export request submitted.");
        }
      }
    } catch (error) {
      console.error("Failed to export report", error);
      toast.error("Unable to export this report.");
    } finally {
      setExportingId(null);
    }
  }

  function clearFilters() {
    setStatusFilter("");
    setTypeFilter("");
    setSourceFilter("");
    setSearch("");
  }

  const hasFilters =
    Boolean(search) ||
    Boolean(statusFilter) ||
    Boolean(typeFilter) ||
    Boolean(sourceFilter);

  return (
    <main className={styles.page} onClick={() => setMenuId(null)}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <div className={styles.titleRow}>
            <button
              className={styles.mobileMenu}
              type="button"
              aria-label="Open navigation"
            >
              <BarChart3 size={20} />
            </button>
            <h1>Reports</h1>
            <span className={styles.titleIcon}>
              <FileText size={17} />
            </span>
          </div>
          <p>Create, view and download insights from your customer feedback</p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.dateButton} type="button">
            <span>May 11 – May 17, 2024</span>
            <CalendarDays size={16} />
          </button>
          <button className={styles.iconButton} type="button" aria-label="Notifications">
            <Activity size={20} />
            <b>3</b>
          </button>
          <button className={styles.iconButton} type="button" aria-label="Help">
            <CircleHelp size={20} />
          </button>
          <div className={styles.profile}>
            <div className={styles.avatar}>AT</div>
            <div>
              <strong>Alex Thompson</strong>
              <span>Analyst</span>
            </div>
            <ChevronDown size={15} />
          </div>
        </div>
      </header>

      <section className={styles.metrics}>
        <article className={`${styles.metricCard} ${styles.blueCard}`}>
          <span className={styles.metricIcon}><FileBarChart2 size={20} /></span>
          <div>
            <p>Total Reports</p>
            <strong>{formatNumber(stats.total)}</strong>
            <small className={styles.up}>↑ 26.7% <em>vs last week</em></small>
          </div>
        </article>

        <article className={`${styles.metricCard} ${styles.greenCard}`}>
          <span className={styles.metricIcon}><FileText size={20} /></span>
          <div>
            <p>Completed</p>
            <strong>{formatNumber(stats.completed)}</strong>
            <small className={styles.up}>↑ 12.5% <em>vs last week</em></small>
          </div>
        </article>

        <article className={`${styles.metricCard} ${styles.orangeCard}`}>
          <span className={styles.metricIcon}><CalendarDays size={20} /></span>
          <div>
            <p>Scheduled</p>
            <strong>{formatNumber(stats.scheduled)}</strong>
            <small className={styles.up}>↑ 33.3% <em>vs last week</em></small>
          </div>
        </article>

        <article className={`${styles.metricCard} ${styles.purpleCard}`}>
          <span className={styles.metricIcon}><Download size={20} /></span>
          <div>
            <p>Downloads</p>
            <strong>{formatNumber(stats.downloads)}</strong>
            <small className={styles.up}>↑ 18.6% <em>vs last week</em></small>
          </div>
        </article>

        <article className={`${styles.metricCard} ${styles.redCard}`}>
          <span className={styles.metricIcon}><Activity size={20} /></span>
          <div>
            <p>Avg. Generation Time</p>
            <strong>{stats.average}</strong>
            <small className={styles.down}>↓ 8.2% <em>vs last week</em></small>
          </div>
        </article>

        <article className={`${styles.metricCard} ${styles.tealCard}`}>
          <span className={styles.metricIcon}><Sparkles size={20} /></span>
          <div>
            <p>Most Viewed</p>
            <strong className={styles.compactValue}>
              {topViewed?.report.title ?? "No reports"}
            </strong>
            <small>{topViewed?.views ?? 0} views</small>
          </div>
        </article>
      </section>

      <section className={styles.analyticsGrid}>
        <article className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h2>Reports Generated Over Time</h2>
            <button className={styles.selectButton} type="button">
              7 Days <ChevronDown size={14} />
            </button>
          </div>

          <div className={styles.lineChart}>
            <div className={styles.yAxis}>
              {[10, 8, 6, 4, 2, 0].map((value) => (
                <span key={value}>{value}</span>
              ))}
            </div>

            <div className={styles.chartArea}>
              <div className={styles.gridLines}>
                {[0, 1, 2, 3, 4, 5].map((item) => (
                  <span key={item} />
                ))}
              </div>

              <div className={styles.bars}>
                {chartDays.map((item) => (
                  <div className={styles.barColumn} key={item.label}>
                    <span
                      className={styles.bar}
                      style={{ height: `${Math.max(5, (item.value / chartMax) * 82)}%` }}
                      title={`${item.label}: ${item.value} reports`}
                    />
                    <small>{item.label}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.chartLegend}>
            <i />
            Reports
          </div>
        </article>

        <article className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h2>Reports by Type</h2>
          </div>

          <div className={styles.donutLayout}>
            <Donut
              center={String(stats.total)}
              segments={typeCounts.map((item, index) => ({
                value: item.count,
                className:
                  ["purple", "blue", "green", "orange", "red", "muted"][
                    index % 6
                  ],
              }))}
            />
            <div className={styles.legendList}>
              {typeCounts.length === 0 ? (
                <span className={styles.emptySmall}>No report data</span>
              ) : (
                typeCounts.slice(0, 6).map((item, index) => (
                  <div key={item.type}>
                    <i className={styles[`dot${index % 6}`]} />
                    <span>{TYPE_LABELS[item.type]}</span>
                    <strong>
                      {stats.total
                        ? Math.round((item.count / stats.total) * 100)
                        : 0}
                      % ({item.count})
                    </strong>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>

        <article className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h2>Reports by Source</h2>
          </div>

          <div className={styles.donutLayout}>
            <Donut
              center={String(stats.total)}
              segments={sourceCounts.map((item, index) => ({
                value: item.count,
                className:
                  ["purple", "blue", "green", "orange", "red", "muted"][
                    index % 6
                  ],
              }))}
            />
            <div className={styles.legendList}>
              {sourceCounts.length === 0 ? (
                <span className={styles.emptySmall}>No report data</span>
              ) : (
                sourceCounts.slice(0, 6).map((item, index) => (
                  <div key={item.source}>
                    <i className={styles[`dot${index % 6}`]} />
                    <span>
                      {item.source === "ALL"
                        ? "All Sources"
                        : SOURCE_LABELS[item.source] ?? item.source}
                    </span>
                    <strong>
                      {stats.total
                        ? Math.round((item.count / stats.total) * 100)
                        : 0}
                      % ({item.count})
                    </strong>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.mainTableCard}>
          <div className={styles.tableHeader}>
            <div className={styles.tableTitle}>
              <h2>All Reports ({filteredReports.length})</h2>
              {hasFilters && (
                <button type="button" className={styles.clearInline} onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>

            <div className={styles.tableTools}>
              <label className={styles.searchBox}>
                <Search size={16} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search reports..."
                />
              </label>

              <button
                className={`${styles.toolButton} ${showFilters ? styles.toolActive : ""}`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowFilters((value) => !value);
                }}
              >
                <Filter size={15} />
                Filters
              </button>

              <button className={styles.exportCsv} type="button" onClick={() => toast.info("CSV export uses the report export endpoint.")}>
                <Download size={15} />
                Export CSV
              </button>

              <button className={styles.generateButton} type="button" onClick={() => setShowCreate(true)}>
                <Plus size={17} />
                Generate New Report
              </button>
            </div>
          </div>

          {showFilters && (
            <div className={styles.filtersPanel} onClick={(event) => event.stopPropagation()}>
              <label>
                <span>Report Type</span>
                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value as ReportType | "")
                  }
                >
                  <option value="">All Types</option>
                  {(Object.keys(TYPE_LABELS) as ReportType[]).map((type) => (
                    <option value={type} key={type}>
                      {TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Status</span>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as ReportStatus | "")
                  }
                >
                  <option value="">All Statuses</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="GENERATING">Generating</option>
                  <option value="DRAFT">Draft</option>
                  <option value="FAILED">Failed</option>
                </select>
              </label>

              <label>
                <span>Source</span>
                <select
                  value={sourceFilter}
                  onChange={(event) => setSourceFilter(event.target.value)}
                >
                  <option value="">All Sources</option>
                  {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                    <option value={key} key={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <button type="button" onClick={clearFilters}>
                Clear All
              </button>
            </div>
          )}

          <div className={styles.tableWrap}>
            <table>
              <thead>
                <tr>
                  <th>Report Name</th>
                  <th>Type</th>
                  <th>Source</th>
                  <th>Date Range</th>
                  <th>Generated On</th>
                  <th>Status</th>
                  <th>By</th>
                  <th>Views</th>
                  <th>Downloads</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10}>
                      <div className={styles.loadingRow}>Loading reports…</div>
                    </td>
                  </tr>
                ) : visibleReports.length === 0 ? (
                  <tr>
                    <td colSpan={10}>
                      <div className={styles.emptyState}>
                        <FileText size={28} />
                        <strong>No reports found</strong>
                        <span>Create a report or change your filters.</span>
                        <button type="button" onClick={() => setShowCreate(true)}>
                          <Plus size={15} /> Generate Report
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  visibleReports.map((report) => {
                    const views =
                      typeof report.data === "object" &&
                      report.data !== null &&
                      "views" in report.data
                        ? Number((report.data as { views?: unknown }).views ?? 0)
                        : 0;

                    const downloads = Array.isArray(report.exports)
                      ? report.exports.length
                      : 0;

                    return (
                      <tr key={report.id}>
                        <td>
                          <div className={styles.reportName}>
                            <span className={`${styles.fileIcon} ${styles[TYPE_TONES[report.type]]}`}>
                              <FileText size={17} />
                            </span>
                            <div>
                              <strong>{report.title}</strong>
                              <small>{report.description ?? "Customer feedback insights"}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.typePill} ${styles[TYPE_TONES[report.type]]}`}>
                            {TYPE_LABELS[report.type]}
                          </span>
                        </td>
                        <td>
                          <span className={styles.sourceCell}>{sourceLabel(report)}</span>
                        </td>
                        <td>
                          {report.startDate || report.endDate
                            ? `${formatDate(report.startDate)} – ${formatDate(report.endDate)}`
                            : "All time"}
                        </td>
                        <td>
                          <span className={styles.dateCell}>
                            {formatDate(report.generatedAt ?? report.createdAt)}
                            <small>
                              {formatDateTime(report.generatedAt ?? report.createdAt).split(", ").slice(1).join(", ")}
                            </small>
                          </span>
                        </td>
                        <td>
                          <span className={`${styles.statusPill} ${styles[statusTone(report.status)]}`}>
                            {statusLabel(report.status)}
                          </span>
                        </td>
                        <td>
                          <span className={styles.author}>
                            <span>{(report.user?.name ?? "System").slice(0, 1).toUpperCase()}</span>
                            {report.user?.name ?? "System"}
                          </span>
                        </td>
                        <td>{views || "—"}</td>
                        <td>{downloads || "—"}</td>
                        <td>
                          <div className={styles.actions} onClick={(event) => event.stopPropagation()}>
                            <button
                              type="button"
                              aria-label="View report"
                              onClick={() => setSelectedReport(report)}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              aria-label="Download report"
                              disabled={exportingId === report.id}
                              onClick={() => void handleExport(report)}
                            >
                              <Download size={15} />
                            </button>
                            <button
                              type="button"
                              aria-label="More actions"
                              onClick={() =>
                                setMenuId((current) =>
                                  current === report.id ? null : report.id,
                                )
                              }
                            >
                              <MoreHorizontal size={16} />
                            </button>

                            {menuId === report.id && (
                              <div className={styles.actionMenu}>
                                <button type="button" onClick={() => setSelectedReport(report)}>
                                  <Eye size={14} /> View
                                </button>
                                <button type="button" onClick={() => void handleExport(report)}>
                                  <Download size={14} /> Export PDF
                                </button>
                                <button
                                  className={styles.dangerAction}
                                  type="button"
                                  onClick={() => void handleDelete(report)}
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <footer className={styles.pagination}>
            <span>
              Showing {filteredReports.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(page * PAGE_SIZE, filteredReports.length)} of {filteredReports.length} reports
            </span>

            <div>
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .slice(0, 5)
                .map((number) => (
                  <button
                    key={number}
                    className={page === number ? styles.currentPage : ""}
                    type="button"
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </button>
                ))}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <select defaultValue={String(PAGE_SIZE)} aria-label="Rows per page">
              <option value="8">8 / page</option>
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
            </select>
          </footer>
        </div>

        <aside className={styles.rail}>
          <section className={styles.railCard}>
            <div className={styles.railHeader}>
              <h2>Filters</h2>
              <button type="button" onClick={clearFilters}>Clear all</button>
            </div>

            <label>
              <span>Workspace</span>
              <select defaultValue="Acme Corp">
                <option>Acme Corp</option>
              </select>
            </label>

            <label>
              <span>Date Range</span>
              <button type="button" className={styles.dateField}>
                May 11 – May 17, 2024 <CalendarDays size={14} />
              </button>
            </label>

            <label>
              <span>Source</span>
              <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}>
                <option value="">All Sources</option>
                {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                  <option value={key} key={key}>{label}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Channel</span>
              <select defaultValue="">
                <option value="">All Channels</option>
                <option value="SUPPORT">Support</option>
                <option value="APP_STORE">App Store</option>
                <option value="EMAIL">Email</option>
                <option value="SURVEY">Survey</option>
              </select>
            </label>

            <label>
              <span>Report Type</span>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as ReportType | "")}
              >
                <option value="">All Types</option>
                {(Object.keys(TYPE_LABELS) as ReportType[]).map((type) => (
                  <option key={type} value={type}>{TYPE_LABELS[type]}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as ReportStatus | "")}
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="GENERATING">Generating</option>
                <option value="DRAFT">Draft</option>
                <option value="FAILED">Failed</option>
              </select>
            </label>

            <button className={styles.applyFilters} type="button" onClick={() => setShowFilters(false)}>
              Apply Filters
            </button>
          </section>

          <section className={styles.railCard}>
            <div className={styles.railHeader}>
              <h2>Report Insights</h2>
              <button type="button">View all</button>
            </div>
            <div className={styles.insight}>
              <i className={styles.greenInsight}>↗</i>
              <p>Report generation activity is based on the reports currently stored in your workspace.<small>Live data</small></p>
            </div>
            <div className={styles.insight}>
              <i className={styles.orangeInsight}>!</i>
              <p>Completed reports are available for export when an export record exists.<small>Export status</small></p>
            </div>
            <div className={styles.insight}>
              <i className={styles.blueInsight}>i</i>
              <p>Scheduled reports use the scheduledAt value stored with the report.<small>Scheduling</small></p>
            </div>
          </section>

          <section className={styles.railCard}>
            <div className={styles.railHeader}>
              <h2>Quick Actions</h2>
            </div>
            <button className={styles.quickAction} type="button" onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Generate New Report
            </button>
            <button
              className={styles.quickAction}
              type="button"
              onClick={() => {
                setShowCreate(true);
                setForm((current) => ({ ...current, schedule: true }));
              }}
            >
              <CalendarDays size={16} /> Schedule Report
            </button>
            <button
              className={styles.quickAction}
              type="button"
              onClick={() => toast.info("Select a report and use its download action.")}
            >
              <Download size={16} /> Export Reports
            </button>
          </section>
        </aside>
      </section>

      {showCreate && (
        <div className={styles.modalBackdrop} onMouseDown={() => !creating && setShowCreate(false)}>
          <section className={styles.modal} onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <h2>Generate New Report</h2>
                <p>Create an insight report from your workspace feedback.</p>
              </div>
              <button type="button" onClick={() => setShowCreate(false)} disabled={creating}>
                <X size={18} />
              </button>
            </header>

            <form onSubmit={handleCreate}>
              <label>
                <span>Report Name *</span>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Executive Summary – Weekly"
                  autoFocus
                />
              </label>

              <label>
                <span>Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Describe what this report should cover..."
                  rows={3}
                />
              </label>

              <div className={styles.formGrid}>
                <label>
                  <span>Report Type</span>
                  <select
                    value={form.type}
                    onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as ReportType }))}
                  >
                    {(Object.keys(TYPE_LABELS) as ReportType[]).map((type) => (
                      <option key={type} value={type}>{TYPE_LABELS[type]}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span>Source</span>
                  <select
                    value={form.source}
                    onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))}
                  >
                    <option value="">All Sources</option>
                    {Object.entries(SOURCE_LABELS).map(([key, label]) => (
                      <option value={key} key={key}>{label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className={styles.formGrid}>
                <label>
                  <span>Start Date</span>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))}
                  />
                </label>

                <label>
                  <span>End Date</span>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(event) => setForm((current) => ({ ...current, endDate: event.target.value }))}
                  />
                </label>
              </div>

              <label className={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={form.schedule}
                  onChange={(event) => setForm((current) => ({ ...current, schedule: event.target.checked }))}
                />
                <span>
                  <strong>Schedule this report</strong>
                  <small>Store it as a scheduled report in the workspace.</small>
                </span>
              </label>

              {form.schedule && (
                <label>
                  <span>Scheduled For *</span>
                  <input
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={(event) => setForm((current) => ({ ...current, scheduledAt: event.target.value }))}
                  />
                </label>
              )}

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelButton} onClick={() => setShowCreate(false)} disabled={creating}>
                  Cancel
                </button>
                <button type="submit" className={styles.generateButton} disabled={creating}>
                  {creating ? "Creating…" : form.schedule ? "Schedule Report" : "Generate Report"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedReport && (
        <div className={styles.modalBackdrop} onMouseDown={() => setSelectedReport(null)}>
          <section className={`${styles.modal} ${styles.detailModal}`} onMouseDown={(event) => event.stopPropagation()}>
            <header>
              <div>
                <h2>{selectedReport.title}</h2>
                <p>{selectedReport.description ?? "Customer feedback report"}</p>
              </div>
              <button type="button" onClick={() => setSelectedReport(null)}>
                <X size={18} />
              </button>
            </header>

            <div className={styles.detailGrid}>
              <div><span>Type</span><strong>{TYPE_LABELS[selectedReport.type]}</strong></div>
              <div><span>Status</span><strong>{statusLabel(selectedReport.status)}</strong></div>
              <div><span>Created</span><strong>{formatDateTime(selectedReport.createdAt)}</strong></div>
              <div><span>Generated</span><strong>{formatDateTime(selectedReport.generatedAt)}</strong></div>
              <div><span>Date Range</span><strong>{formatDate(selectedReport.startDate)} – {formatDate(selectedReport.endDate)}</strong></div>
              <div><span>Source</span><strong>{sourceLabel(selectedReport)}</strong></div>
            </div>

            <div className={styles.summaryBox}>
              <Info size={17} />
              <p>{selectedReport.aiSummary ?? "No AI summary has been generated for this report yet."}</p>
            </div>

            <div className={styles.modalFooter}>
              <button type="button" className={styles.cancelButton} onClick={() => void handleDelete(selectedReport)}>
                <Trash2 size={15} /> Delete
              </button>
              <button type="button" className={styles.generateButton} onClick={() => void handleExport(selectedReport)}>
                <Download size={15} /> Export PDF
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
