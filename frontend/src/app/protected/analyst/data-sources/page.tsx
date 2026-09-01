"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Database,
  FileSpreadsheet,
  Mail,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Server,
  UploadCloud,
  Webhook,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "../../../../lib/api/api-client";
import styles from "./data-sources.module.css";

type SourceType =
  | "API"
  | "WEBHOOK"
  | "CSV"
  | "DATABASE"
  | "EMAIL"
  | "SOCIAL_MEDIA"
  | "CUSTOM";

type SourceStatus = "ACTIVE" | "INACTIVE" | "ERROR" | "SYNCING";

type DataSource = {
  id: string;
  name: string;
  type: SourceType;
  description: string | null;
  config: Record<string, unknown>;
  isActive: boolean;
  status: SourceStatus;
  lastSyncAt: string | null;
  createdAt: string;
  feedbackImported: number;
  newThisWeek: number;
  successRate: number | null;
  errorsThisWeek: number;
};

type Summary = {
  totalSources: number;
  connectedSources: number;
  totalFeedback: number;
  autoImports: number;
  successRate: number;
  healthySources: number;
  warningSources: number;
  errorSources: number;
};

type PageResponse = {
  dataSources: DataSource[];
  summary: Summary;
  failedImports: Array<{
    source: string;
    errors: number;
    lastOccurred: string | null;
    status: string;
  }>;
};

const TYPE_LABEL: Record<SourceType, string> = {
  API: "API",
  WEBHOOK: "Webhook",
  CSV: "Manual",
  DATABASE: "Database",
  EMAIL: "IMAP",
  SOCIAL_MEDIA: "API",
  CUSTOM: "Custom",
};

const TYPE_ICON: Record<SourceType, typeof Database> = {
  API: Cloud,
  WEBHOOK: Webhook,
  CSV: FileSpreadsheet,
  DATABASE: Database,
  EMAIL: Mail,
  SOCIAL_MEDIA: Cloud,
  CUSTOM: Server,
};

const TYPE_CHANNEL: Record<SourceType, string> = {
  API: "Support",
  WEBHOOK: "Webhook",
  CSV: "Upload",
  DATABASE: "Database",
  EMAIL: "Email",
  SOCIAL_MEDIA: "Social Media",
  CUSTOM: "Custom",
};

const EMPTY_SUMMARY: Summary = {
  totalSources: 0,
  connectedSources: 0,
  totalFeedback: 0,
  autoImports: 0,
  successRate: 0,
  healthySources: 0,
  warningSources: 0,
  errorSources: 0,
};

function unwrap<T>(payload: unknown): T | undefined {
  if (payload === null || payload === undefined) return undefined;

  if (typeof payload === "object" && "data" in payload) {
    const nested = (payload as { data?: unknown }).data;
    if (nested !== undefined && nested !== null) {
      return nested as T;
    }
  }

  return payload as T;
}

function normalizePageResponse(payload: unknown): PageResponse {
  const unwrapped = unwrap<PageResponse>(payload);

  if (!unwrapped || typeof unwrapped !== "object") {
    return {
      dataSources: [],
      summary: EMPTY_SUMMARY,
      failedImports: [],
    };
  }

  const value = unwrapped as Partial<PageResponse> & {
    dataSources?: unknown;
    summary?: Partial<Summary>;
    failedImports?: unknown;
  };

  const summary: Partial<Summary> = value.summary ?? {};

  return {
    dataSources: Array.isArray(value.dataSources)
      ? (value.dataSources as DataSource[])
      : [],
    summary: {
      totalSources: Number(summary.totalSources ?? 0),
      connectedSources: Number(summary.connectedSources ?? 0),
      totalFeedback: Number(summary.totalFeedback ?? 0),
      autoImports: Number(summary.autoImports ?? 0),
      successRate: Number(summary.successRate ?? 0),
      healthySources: Number(summary.healthySources ?? 0),
      warningSources: Number(summary.warningSources ?? 0),
      errorSources: Number(summary.errorSources ?? 0),
    },
    failedImports: Array.isArray(value.failedImports)
      ? (value.failedImports as PageResponse["failedImports"])
      : [],
  };
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatSync(value: string | null) {
  if (!value) return "Never synced";
  const date = new Date(value);
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 60000),
  );
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
  return `${Math.floor(minutes / 1440)} day ago`;
}

function statusLabel(status: SourceStatus) {
  if (status === "ACTIVE") return "Connected";
  if (status === "SYNCING") return "Syncing";
  if (status === "ERROR") return "Error";
  return "Inactive";
}

export default function AnalystDataSourcesPage() {
  const [data, setData] = useState<PageResponse>({
    dataSources: [],
    summary: EMPTY_SUMMARY,
    failedImports: [],
  });
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | SourceStatus>("ALL");
  const [showModal, setShowModal] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "API" as SourceType,
    description: "",
  });

  async function loadSources() {
    try {
      setLoading(true);
      const response = await apiClient.get("/data-sources");
      const normalized = normalizePageResponse(response.data);
      setData(normalized);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load data sources.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSources();
  }, []);

  const filteredSources = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return data.dataSources.filter((source) => {
      const matchesText =
        !normalized ||
        source.name.toLowerCase().includes(normalized) ||
        TYPE_LABEL[source.type].toLowerCase().includes(normalized);
      const matchesStatus =
        statusFilter === "ALL" || source.status === statusFilter;
      return matchesText && matchesStatus;
    });
  }, [data.dataSources, query, statusFilter]);

  async function createSource() {
    const name = form.name.trim();
    if (!name) {
      toast.error("Source name is required.");
      return;
    }

    try {
      const response = await apiClient.post("/data-sources", {
        name,
        type: form.type,
        description: form.description.trim() || undefined,
        config: {},
      });

      const created = unwrap<DataSource>(response.data);

      if (created?.id) {
        await loadSources();
      } else {
        await loadSources();
      }

      setForm({ name: "", type: "API", description: "" });
      setShowModal(false);
      toast.success("Data source created.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to create data source.");
    }
  }

  async function syncSource(source: DataSource) {
    try {
      setSyncingId(source.id);
      await apiClient.post(`/data-sources/${source.id}/sync`);
      toast.success(`${source.name} sync started.`);
      await loadSources();
    } catch (error) {
      console.error(error);
      toast.error("Unable to start sync.");
    } finally {
      setSyncingId(null);
    }
  }

  async function toggleSource(source: DataSource) {
    try {
      const response = await apiClient.patch(`/data-sources/${source.id}`, {
        isActive: !source.isActive,
      });
      const updated = unwrap<DataSource>(response.data);
      await loadSources();
      setMenuId(null);
      toast.success(updated?.isActive ? "Source connected." : "Source paused.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to update source.");
    }
  }

  async function deleteSource(source: DataSource) {
    if (!window.confirm(`Delete "${source.name}"?`)) return;

    try {
      await apiClient.delete(`/data-sources/${source.id}`);
      setData((current) => ({
        ...current,
        dataSources: current.dataSources.filter(
          (item) => item.id !== source.id,
        ),
        summary: {
          ...current.summary,
          totalSources: Math.max(0, current.summary.totalSources - 1),
          connectedSources:
            source.status === "ACTIVE"
              ? Math.max(0, current.summary.connectedSources - 1)
              : current.summary.connectedSources,
        },
      }));
      setMenuId(null);
      toast.success("Data source deleted.");
    } catch (error) {
      console.error(error);
      toast.error("Unable to delete source.");
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div>
          <div className={styles.titleRow}>
            <h1>Data Sources</h1>
            <span className={styles.titleIcon}>
              <Database size={18} />
            </span>
          </div>
          <p>Connect, manage and monitor all your feedback data sources</p>
        </div>

        <div className={styles.topActions}>
          <button className={styles.dateButton} type="button">
            May 11 – May 17, 2024
            <span>▣</span>
          </button>
          <button
            className={styles.iconButton}
            type="button"
            aria-label="Notifications"
          >
            <span className={styles.notificationDot}>3</span>
            <Activity size={20} />
          </button>
          <button className={styles.iconButton} type="button" aria-label="Help">
            ?
          </button>
          <div className={styles.userMini}>
            <span className={styles.avatar}>AT</span>
            <span>
              <strong>Alex Thompson</strong>
              <small>Analyst</small>
            </span>
            <ChevronDown size={16} />
          </div>
        </div>
      </header>

      <section className={styles.metrics}>
        <Metric
          icon={<Database size={19} />}
          label="Total Sources"
          value={formatNumber(data.summary.totalSources)}
          note="All configured sources"
          tone="purple"
        />
        <Metric
          icon={<Cloud size={19} />}
          label="Connected Sources"
          value={formatNumber(data.summary.connectedSources)}
          note={`${data.summary.totalSources ? Math.round((data.summary.connectedSources / data.summary.totalSources) * 100) : 0}% of total`}
          tone="green"
        />
        <Metric
          icon={<UploadCloud size={19} />}
          label="Total Feedback"
          value={formatNumber(data.summary.totalFeedback)}
          note="Across all sources"
          tone="orange"
        />
        <Metric
          icon={<RefreshCw size={19} />}
          label="Last Synced"
          value={data.summary.connectedSources ? "Live" : "—"}
          note="All sources healthy"
          tone="blue"
        />
        <Metric
          icon={<FileSpreadsheet size={19} />}
          label="Auto Imports"
          value={formatNumber(data.summary.autoImports)}
          note="Completed imports"
          tone="purple"
        />
        <Metric
          icon={<CheckCircle2 size={19} />}
          label="Success Rate"
          value={`${data.summary.successRate.toFixed(1)}%`}
          note="Import reliability"
          tone="teal"
        />
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.mainColumn}>
          <div className={styles.card}>
            <div className={styles.tableHeader}>
              <div>
                <h2>All Data Sources ({data.dataSources.length})</h2>
                <span>Workspace feedback connections</span>
              </div>
              <div className={styles.tableActions}>
                <label className={styles.search}>
                  <Search size={17} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search sources..."
                  />
                </label>
                <select
                  className={styles.select}
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as "ALL" | SourceStatus)
                  }
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Connected</option>
                  <option value="SYNCING">Syncing</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ERROR">Error</option>
                </select>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={() => setShowModal(true)}
                >
                  <Plus size={17} />
                  Add New Source
                </button>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Source Name</th>
                    <th>Source Type</th>
                    <th>Channel</th>
                    <th>Status</th>
                    <th>Last Sync</th>
                    <th>Feedback Imported</th>
                    <th>New This Week</th>
                    <th>Success Rate</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className={styles.empty}>
                        Loading data sources…
                      </td>
                    </tr>
                  ) : filteredSources.length === 0 ? (
                    <tr>
                      <td colSpan={9} className={styles.empty}>
                        <Database size={26} />
                        <strong>No data sources found</strong>
                        <span>Add a source or change your search.</span>
                      </td>
                    </tr>
                  ) : (
                    filteredSources.map((source) => {
                      const Icon = TYPE_ICON[source.type];
                      return (
                        <tr key={source.id}>
                          <td>
                            <div className={styles.sourceName}>
                              <span className={styles.sourceIcon}>
                                <Icon size={18} />
                              </span>
                              <span>
                                <strong>{source.name}</strong>
                                <small>
                                  {source.description ||
                                    TYPE_LABEL[source.type]}
                                </small>
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={styles.typeBadge}>
                              {TYPE_LABEL[source.type]}
                            </span>
                          </td>
                          <td>{TYPE_CHANNEL[source.type]}</td>
                          <td>
                            <span
                              className={`${styles.status} ${styles[source.status.toLowerCase()]}`}
                            >
                              <i />
                              {statusLabel(source.status)}
                            </span>
                          </td>
                          <td>
                            <strong>{formatSync(source.lastSyncAt)}</strong>
                            {source.lastSyncAt && (
                              <small className={styles.subline}>
                                {new Date(source.lastSyncAt).toLocaleString(
                                  "en-IN",
                                )}
                              </small>
                            )}
                          </td>
                          <td>{formatNumber(source.feedbackImported)}</td>
                          <td>
                            <strong>{formatNumber(source.newThisWeek)}</strong>
                            <small className={styles.growth}>This week</small>
                          </td>
                          <td>
                            {source.successRate == null
                              ? "—"
                              : `${source.successRate.toFixed(1)}%`}
                          </td>
                          <td className={styles.actionCell}>
                            <button
                              className={styles.moreButton}
                              type="button"
                              onClick={() =>
                                setMenuId(
                                  menuId === source.id ? null : source.id,
                                )
                              }
                              aria-label={`Actions for ${source.name}`}
                            >
                              <MoreHorizontal size={18} />
                            </button>
                            {menuId === source.id && (
                              <div className={styles.menu}>
                                <button
                                  type="button"
                                  onClick={() => void syncSource(source)}
                                >
                                  <RefreshCw size={15} /> Sync now
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void toggleSource(source)}
                                >
                                  {source.isActive
                                    ? "Pause source"
                                    : "Connect source"}
                                </button>
                                <button
                                  className={styles.danger}
                                  type="button"
                                  onClick={() => void deleteSource(source)}
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.tableFooter}>
              Showing {filteredSources.length} of {data.dataSources.length}{" "}
              sources
            </div>
          </div>

          <div className={styles.bottomGrid}>
            <section className={styles.card}>
              <div className={styles.cardTitle}>
                <div>
                  <h3>Source Types</h3>
                  <span>Distribution by source type</span>
                </div>
              </div>
              <div className={styles.donutRow}>
                <div
                  className={styles.donut}
                  style={{
                    background: `conic-gradient(#5b2cf0 0 ${Math.min(100, data.summary.totalSources ? (data.summary.connectedSources / data.summary.totalSources) * 100 : 0)}%, #dbe4ff 0 100%)`,
                  }}
                >
                  <div>
                    <strong>{data.summary.totalSources}</strong>
                    <small>Total</small>
                  </div>
                </div>
                <div className={styles.legend}>
                  <p>
                    <i className={styles.purpleDot} />
                    API Integrations{" "}
                    <b>
                      {data.dataSources.filter((x) => x.type === "API").length}
                    </b>
                  </p>
                  <p>
                    <i className={styles.blueDot} />
                    Email / IMAP{" "}
                    <b>
                      {
                        data.dataSources.filter((x) => x.type === "EMAIL")
                          .length
                      }
                    </b>
                  </p>
                  <p>
                    <i className={styles.greenDot} />
                    Manual Upload{" "}
                    <b>
                      {data.dataSources.filter((x) => x.type === "CSV").length}
                    </b>
                  </p>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardTitle}>
                <div>
                  <h3>Top Sources by Feedback Volume</h3>
                  <span>This workspace</span>
                </div>
              </div>
              <div className={styles.bars}>
                {data.dataSources.slice(0, 5).map((source) => {
                  const max = Math.max(
                    ...data.dataSources.map((x) => x.feedbackImported),
                    1,
                  );
                  return (
                    <div className={styles.barRow} key={source.id}>
                      <span>{source.name}</span>
                      <div>
                        <i
                          style={{
                            width: `${(source.feedbackImported / max) * 100}%`,
                          }}
                        />
                      </div>
                      <b>{formatNumber(source.feedbackImported)}</b>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className={styles.card}>
              <div className={styles.cardTitle}>
                <div>
                  <h3>Failed Imports</h3>
                  <span>This week</span>
                </div>
              </div>
              <div className={styles.failedList}>
                {data.failedImports.length === 0 ? (
                  <div className={styles.noFailures}>
                    <CheckCircle2 size={18} /> No failed imports
                  </div>
                ) : (
                  data.failedImports.map((item) => (
                    <div
                      key={`${item.source}-${item.status}`}
                      className={styles.failedRow}
                    >
                      <strong>{item.source}</strong>
                      <span>{item.errors} errors</span>
                      <small>{item.status}</small>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </section>

        <aside className={styles.rightColumn}>
          <section className={styles.card}>
            <div className={styles.sideTitle}>
              <h3>Source Health</h3>
              <span>View all</span>
            </div>
            <div className={styles.health}>
              <div className={styles.healthDonut}>
                <div>
                  <strong>{data.summary.healthySources}</strong>
                  <small>Healthy</small>
                </div>
              </div>
              <div className={styles.healthLegend}>
                <p>
                  <i className={styles.greenDot} />
                  Healthy <b>{data.summary.healthySources}</b>
                </p>
                <p>
                  <i className={styles.orangeDot} />
                  Warning <b>{data.summary.warningSources}</b>
                </p>
                <p>
                  <i className={styles.redDot} />
                  Error <b>{data.summary.errorSources}</b>
                </p>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sideTitle}>
              <h3>Data Ingestion Overview</h3>
              <span>This Week</span>
            </div>
            <div className={styles.ingestion}>
              <p>
                Total Feedback Ingested{" "}
                <b>{formatNumber(data.summary.totalFeedback)}</b>
              </p>
              <p>
                Auto Imports <b>{formatNumber(data.summary.autoImports)}</b>
              </p>
              <p>
                Manual Uploads{" "}
                <b>
                  {formatNumber(
                    Math.max(
                      0,
                      data.summary.totalFeedback - data.summary.autoImports,
                    ),
                  )}
                </b>
              </p>
              <p>
                Processing Errors{" "}
                <b>{formatNumber(data.summary.errorSources)}</b>
              </p>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.sideTitle}>
              <h3>Recent Activity</h3>
              <span>View all</span>
            </div>
            <div className={styles.activity}>
              {data.dataSources.slice(0, 4).map((source) => (
                <div key={source.id}>
                  <i />
                  <p>
                    <strong>{source.name}</strong>
                    <span>{source.feedbackImported} feedback imported</span>
                    <small>{formatSync(source.lastSyncAt)}</small>
                  </p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>

      {showModal && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={() => setShowModal(false)}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-source-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 id="add-source-title">Add New Data Source</h2>
                <p>Create a workspace data connection.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <label>
              Source name
              <input
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                placeholder="Support Tickets"
              />
            </label>
            <label>
              Source type
              <select
                value={form.type}
                onChange={(event) =>
                  setForm({ ...form, type: event.target.value as SourceType })
                }
              >
                <option value="API">API</option>
                <option value="WEBHOOK">Webhook</option>
                <option value="CSV">CSV / Manual</option>
                <option value="DATABASE">Database</option>
                <option value="EMAIL">Email / IMAP</option>
                <option value="SOCIAL_MEDIA">Social Media</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </label>
            <label>
              Description
              <textarea
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                placeholder="Optional description"
              />
            </label>
            <div className={styles.modalActions}>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.primaryButton}
                type="button"
                onClick={() => void createSource()}
              >
                Create Source
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
  tone: string;
}) {
  return (
    <article className={styles.metric}>
      <span className={`${styles.metricIcon} ${styles[tone]}`}>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}
