"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import styles from "./reports.module.css";

import {
  createReport,
  getReports,
  deleteReport,
} from "../../../../Features/reports/api/reports.api";

/* =========================================================
   TYPES
========================================================= */

type ReportType =
  | "VOICE_OF_CUSTOMER"
  | "INSIGHTS"
  | "ANALYTICS"
  | "SUMMARY"
  | "SENTIMENT"
  | "THEMES"
  | "CUSTOM";

type ReportStatus =
  | "DRAFT"
  | "GENERATING"
  | "COMPLETED"
  | "FAILED"
  | "SCHEDULED";

/*
 * IMPORTANT
 *
 * These values MUST match the backend validation schema.
 */
type ReportMetric =
  | "TOTAL_FEEDBACK"
  | "POSITIVE_FEEDBACK"
  | "NEGATIVE_FEEDBACK"
  | "NEUTRAL_FEEDBACK"
  | "SENTIMENT_DISTRIBUTION"
  | "TOP_THEMES"
  | "FEEDBACK_TREND"
  | "RESPONSE_RATE"
  | "CHANNEL_DISTRIBUTION";

/*
 * Keep sources as strings because the backend requires
 * sources to be an array.
 *
 * If your backend has a stricter source enum, these values
 * can be changed to match it.
 */
type Source =
  | "SUPPORT"
  | "APP_STORE"
  | "SURVEY"
  | "SALES"
  | "SOCIAL"
  | "WEBSITE"
  | "EMAIL"
  | "MANUAL";

interface Report {
  id: string;
  title: string;
  description?: string | null;
  type: ReportType;
  status: ReportStatus;

  startDate?: string | null;
  endDate?: string | null;

  sources?: Source[] | null;
  metrics?: ReportMetric[] | null;

  aiSummary?: string | null;
  generatedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

interface CreateReportForm {
  reportName: string;
  description: string;
  reportType: ReportType;
  sources: Source[];
  startDate: string;
  endDate: string;
  metrics: ReportMetric[];
}

/* =========================================================
   REPORT TYPES
========================================================= */

const REPORT_TYPES: Array<{
  value: ReportType;
  label: string;
  description: string;
}> = [
  {
    value: "VOICE_OF_CUSTOMER",
    label: "Voice of Customer",
    description: "Understand what customers are saying.",
  },
  {
    value: "INSIGHTS",
    label: "Product Insights",
    description: "Discover product opportunities.",
  },
  {
    value: "ANALYTICS",
    label: "Analytics",
    description: "Analyze feedback performance.",
  },
  {
    value: "SUMMARY",
    label: "Executive Summary",
    description: "High-level workspace summary.",
  },
  {
    value: "SENTIMENT",
    label: "Sentiment Analysis",
    description:
      "Analyze positive, neutral and negative feedback.",
  },
  {
    value: "THEMES",
    label: "Theme Deep Dive",
    description: "Explore customer feedback themes.",
  },
  {
    value: "CUSTOM",
    label: "Custom Report",
    description: "Build a custom feedback report.",
  },
];

/* =========================================================
   SOURCES
========================================================= */

const SOURCES: Array<{
  value: Source;
  label: string;
}> = [
  {
    value: "SUPPORT",
    label: "Support Ticket",
  },
  {
    value: "APP_STORE",
    label: "App Store",
  },
  {
    value: "SURVEY",
    label: "Survey",
  },
  {
    value: "SALES",
    label: "Sales",
  },
  {
    value: "SOCIAL",
    label: "Social Media",
  },
  {
    value: "WEBSITE",
    label: "Website",
  },
  {
    value: "EMAIL",
    label: "Email",
  },
  {
    value: "MANUAL",
    label: "Manual",
  },
];

/*
 * IMPORTANT:
 *
 * These are the ONLY metric values sent to the backend.
 */
const METRICS: Array<{
  value: ReportMetric;
  label: string;
}> = [
  {
    value: "TOTAL_FEEDBACK",
    label: "Total Feedback",
  },
  {
    value: "POSITIVE_FEEDBACK",
    label: "Positive Feedback",
  },
  {
    value: "NEGATIVE_FEEDBACK",
    label: "Negative Feedback",
  },
  {
    value: "NEUTRAL_FEEDBACK",
    label: "Neutral Feedback",
  },
  {
    value: "SENTIMENT_DISTRIBUTION",
    label: "Sentiment Distribution",
  },
  {
    value: "TOP_THEMES",
    label: "Top Themes",
  },
  {
    value: "FEEDBACK_TREND",
    label: "Feedback Trend",
  },
  {
    value: "RESPONSE_RATE",
    label: "Response Rate",
  },
  {
    value: "CHANNEL_DISTRIBUTION",
    label: "Channel Distribution",
  },
];

/*
 * Backend-compatible defaults.
 */
const DEFAULT_METRICS: ReportMetric[] = [
  "TOTAL_FEEDBACK",
  "SENTIMENT_DISTRIBUTION",
  "TOP_THEMES",
  "FEEDBACK_TREND",
  "CHANNEL_DISTRIBUTION",
];

/*
 * Send all sources by default.
 *
 * This is important because the backend requires
 * body.sources to be an array.
 */
const DEFAULT_SOURCES: Source[] = SOURCES.map(
  (source) => source.value,
);

/* =========================================================
   HELPERS
========================================================= */

function formatInputDate(date: Date): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createInitialForm(): CreateReportForm {
  const today = new Date();

  const firstDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
  );

  return {
    reportName: "",
    description: "",
    reportType: "ANALYTICS",

    /*
     * Always an array.
     */
    sources: [...DEFAULT_SOURCES],

    startDate: formatInputDate(firstDay),
    endDate: formatInputDate(today),

    /*
     * Backend enum values.
     */
    metrics: [...DEFAULT_METRICS],
  };
}

function formatDate(
  value?: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function getStatusLabel(
  status?: ReportStatus,
): string {
  switch (status) {
    case "COMPLETED":
      return "Completed";

    case "GENERATING":
      return "Generating";

    case "SCHEDULED":
      return "Scheduled";

    case "FAILED":
      return "Failed";

    case "DRAFT":
      return "Draft";

    default:
      return "Unknown";
  }
}

function getTypeLabel(
  type?: ReportType,
): string {
  return (
    REPORT_TYPES.find(
      (item) => item.value === type,
    )?.label ?? "Report"
  );
}

function getMetricLabel(
  metric: ReportMetric,
): string {
  return (
    METRICS.find(
      (item) => item.value === metric,
    )?.label ?? metric
  );
}

/* =========================================================
   API RESPONSE NORMALIZER
========================================================= */

function extractReports(
  response: unknown,
): Report[] {
  if (Array.isArray(response)) {
    return response as Report[];
  }

  if (
    !response ||
    typeof response !== "object"
  ) {
    return [];
  }

  const raw = response as {
    data?: unknown;
    reports?: unknown;
  };

  if (Array.isArray(raw.reports)) {
    return raw.reports as Report[];
  }

  if (Array.isArray(raw.data)) {
    return raw.data as Report[];
  }

  if (
    raw.data &&
    typeof raw.data === "object"
  ) {
    const data = raw.data as {
      reports?: unknown;
    };

    if (Array.isArray(data.reports)) {
      return data.reports as Report[];
    }
  }

  return [];
}

/* =========================================================
   COMPONENT
========================================================= */

export default function AnalystReportsPage() {
  const [reports, setReports] =
    useState<Report[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [creating, setCreating] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [form, setForm] =
    useState<CreateReportForm>(
      createInitialForm(),
    );

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"ALL" | ReportStatus>("ALL");

  /* =======================================================
     LOAD REPORTS
  ======================================================= */

  const loadReports = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getReports();

        const result =
          extractReports(response);

        const normalized =
          result.map(
            (report): Report => ({
              ...report,

              sources:
                Array.isArray(
                  report.sources,
                )
                  ? report.sources
                  : [],

              metrics:
                Array.isArray(
                  report.metrics,
                )
                  ? report.metrics
                  : [],
            }),
          );

        setReports(normalized);
      } catch (err) {
        console.error(
          "Failed to load reports:",
          err,
        );

        setReports([]);

        setError(
          "Unable to load reports. Please check your backend connection.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredReports =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return reports.filter(
        (report) => {
          const matchesSearch =
            !query ||
            report.title
              .toLowerCase()
              .includes(query) ||
            (
              report.description ??
              ""
            )
              .toLowerCase()
              .includes(query);

          const matchesStatus =
            statusFilter === "ALL" ||
            report.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        },
      );
    }, [
      reports,
      search,
      statusFilter,
    ]);

  /* =======================================================
     FORM UPDATE
  ======================================================= */

  function updateForm<
    K extends keyof CreateReportForm,
  >(
    field: K,
    value: CreateReportForm[K],
  ) {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );

    setError("");
  }

  /* =======================================================
     SOURCE TOGGLE
  ======================================================= */

  function toggleSource(
    source: Source,
  ) {
    setForm((current) => {
      const exists =
        current.sources.includes(
          source,
        );

      if (exists) {
        return {
          ...current,

          sources:
            current.sources.filter(
              (item) =>
                item !== source,
            ),
        };
      }

      return {
        ...current,

        sources: [
          ...current.sources,
          source,
        ],
      };
    });

    setError("");
  }

  function selectAllSources() {
    setForm((current) => ({
      ...current,
      sources: [...DEFAULT_SOURCES],
    }));

    setError("");
  }

  function clearSources() {
    /*
     * IMPORTANT:
     *
     * We allow the user to clear the UI,
     * but before submitting we restore all
     * sources because backend requires array.
     */
    setForm((current) => ({
      ...current,
      sources: [],
    }));

    setError("");
  }

  /* =======================================================
     METRIC TOGGLE
  ======================================================= */

  function toggleMetric(
    metric: ReportMetric,
  ) {
    setForm((current) => {
      const exists =
        current.metrics.includes(
          metric,
        );

      if (exists) {
        return {
          ...current,

          metrics:
            current.metrics.filter(
              (item) =>
                item !== metric,
            ),
        };
      }

      return {
        ...current,

        metrics: [
          ...current.metrics,
          metric,
        ],
      };
    });

    setError("");
  }

  /* =======================================================
     VALIDATION
  ======================================================= */

  function validateForm(): string | null {
    if (!form.reportName.trim()) {
      return "Report name is required.";
    }

    if (
      form.reportName.trim().length <
      3
    ) {
      return (
        "Report name must contain at least 3 characters."
      );
    }

    if (!form.startDate) {
      return "Start date is required.";
    }

    if (!form.endDate) {
      return "End date is required.";
    }

    if (
      form.startDate >
      form.endDate
    ) {
      return (
        "End date cannot be earlier than start date."
      );
    }

    if (
      form.metrics.length === 0
    ) {
      return (
        "Select at least one report metric."
      );
    }

    return null;
  }

  /* =======================================================
     CREATE REPORT
  ======================================================= */

  async function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(
        validationError,
      );
      return;
    }

    try {
      setCreating(true);
      setError("");
      setSuccess("");

      /*
       * IMPORTANT:
       *
       * The backend requires sources to be
       * an array.
       *
       * Therefore NEVER omit sources.
       */
      const sources: Source[] =
        form.sources.length > 0
          ? [...form.sources]
          : [...DEFAULT_SOURCES];

      /*
       * IMPORTANT:
       *
       * Only backend-supported metric enums
       * are sent.
       */
      const metrics: ReportMetric[] =
        [...form.metrics];

      /*
       * Final frontend safety check.
       */
      const validMetricValues =
        new Set<ReportMetric>(
          METRICS.map(
            (metric) =>
              metric.value,
          ),
        );

      const invalidMetrics =
        metrics.filter(
          (metric) =>
            !validMetricValues.has(
              metric,
            ),
        );

      if (
        invalidMetrics.length > 0
      ) {
        throw new Error(
          `Invalid report metrics: ${invalidMetrics.join(
            ", ",
          )}`,
        );
      }

      /*
       * ISO dates.
       */
      const startDate =
        new Date(
          `${form.startDate}T00:00:00`,
        ).toISOString();

      const endDate =
        new Date(
          `${form.endDate}T23:59:59.999`,
        ).toISOString();

      /*
       * THIS is the exact payload sent to
       * createReport().
       */
      const payload = {
        title:
          form.reportName.trim(),

        description:
          form.description.trim(),

        type:
          form.reportType,

        startDate,

        endDate,

        /*
         * REQUIRED ARRAY
         */
        sources,

        /*
         * REQUIRED BACKEND ENUM ARRAY
         */
        metrics,
      };

      console.log(
        "[Reports] Creating report:",
        JSON.stringify(
          payload,
          null,
          2,
        ),
      );

      /*
       * DO NOT add:
       *
       * filters: {}
       * tags: []
       *
       * unless your backend explicitly
       * requires them.
       */
      await createReport(
        payload,
      );

      setSuccess(
        "Report created successfully.",
      );

      setShowCreateModal(false);

      setForm(
        createInitialForm(),
      );

      await loadReports();
    } catch (err: unknown) {
      console.error(
        "[Reports] Failed to create report:",
        err,
      );

      const apiError =
        err as {
          response?: {
            data?: {
              message?: string;
              errors?: unknown;
            };
          };
          message?: string;
        };

      const serverMessage =
        apiError.response?.data
          ?.message ||
        apiError.message ||
        "Failed to create report.";

      setError(
        serverMessage,
      );
    } finally {
      setCreating(false);
    }
  }

  /* =======================================================
     DELETE REPORT
  ======================================================= */

  async function handleDelete(
    reportId: string,
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this report?",
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(
        reportId,
      );

      setError("");
      setSuccess("");

      await deleteReport(
        reportId,
      );

      setReports(
        (current) =>
          current.filter(
            (report) =>
              report.id !==
              reportId,
          ),
      );

      setSuccess(
        "Report deleted successfully.",
      );
    } catch (err) {
      console.error(
        "Failed to delete report:",
        err,
      );

      setError(
        "Failed to delete report.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* =======================================================
     STATS
  ======================================================= */

  const stats =
    useMemo(() => {
      return {
        total: reports.length,

        completed:
          reports.filter(
            (report) =>
              report.status ===
              "COMPLETED",
          ).length,

        generating:
          reports.filter(
            (report) =>
              report.status ===
              "GENERATING",
          ).length,

        scheduled:
          reports.filter(
            (report) =>
              report.status ===
              "SCHEDULED",
          ).length,
      };
    }, [reports]);

  /* =======================================================
     OPEN CREATE MODAL
  ======================================================= */

  function openCreateModal() {
    setError("");
    setSuccess("");

    setForm(
      createInitialForm(),
    );

    setShowCreateModal(true);
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className={styles.page}>
      <div
        className={styles.container}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className={
            styles.header
          }
        >
          <div>
            <div
              className={
                styles.eyebrow
              }
            >
              ANALYST WORKSPACE
            </div>

            <h1
              className={
                styles.title
              }
            >
              Reports
            </h1>

            <p
              className={
                styles.subtitle
              }
            >
              Create, analyze and
              manage customer
              feedback reports from
              your workspace.
            </p>
          </div>

          <button
            type="button"
            className={
              styles.primaryButton
            }
            onClick={
              openCreateModal
            }
          >
            <span
              className={
                styles.buttonIcon
              }
            >
              +
            </span>

            Generate Report
          </button>
        </header>

        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div
            className={`${styles.alert} ${styles.alertError}`}
            role="alert"
          >
            <span
              className={
                styles.alertIcon
              }
            >
              !
            </span>

            <div>
              <strong>
                Something went wrong
              </strong>

              <p>{error}</p>
            </div>

            <button
              type="button"
              className={
                styles.alertClose
              }
              onClick={() =>
                setError("")
              }
              aria-label="Close error"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div
            className={`${styles.alert} ${styles.alertSuccess}`}
            role="status"
          >
            <span
              className={
                styles.alertIcon
              }
            >
              ✓
            </span>

            <div>
              <strong>
                Success
              </strong>

              <p>{success}</p>
            </div>

            <button
              type="button"
              className={
                styles.alertClose
              }
              onClick={() =>
                setSuccess("")
              }
              aria-label="Close success"
            >
              ×
            </button>
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <section
          className={
            styles.statsGrid
          }
        >
          <div
            className={
              styles.statCard
            }
          >
            <div
              className={
                styles.statTop
              }
            >
              <span
                className={
                  styles.statLabel
                }
              >
                Total Reports
              </span>

              <span
                className={
                  styles.statIcon
                }
              >
                ▤
              </span>
            </div>

            <strong
              className={
                styles.statValue
              }
            >
              {stats.total}
            </strong>

            <span
              className={
                styles.statHint
              }
            >
              Workspace reports
            </span>
          </div>

          <div
            className={
              styles.statCard
            }
          >
            <div
              className={
                styles.statTop
              }
            >
              <span
                className={
                  styles.statLabel
                }
              >
                Completed
              </span>

              <span
                className={
                  styles.statIcon
                }
              >
                ✓
              </span>
            </div>

            <strong
              className={
                styles.statValue
              }
            >
              {stats.completed}
            </strong>

            <span
              className={
                styles.statHint
              }
            >
              Ready to view
            </span>
          </div>

          <div
            className={
              styles.statCard
            }
          >
            <div
              className={
                styles.statTop
              }
            >
              <span
                className={
                  styles.statLabel
                }
              >
                Generating
              </span>

              <span
                className={
                  styles.statIcon
                }
              >
                ◌
              </span>
            </div>

            <strong
              className={
                styles.statValue
              }
            >
              {stats.generating}
            </strong>

            <span
              className={
                styles.statHint
              }
            >
              Currently
              processing
            </span>
          </div>

          <div
            className={
              styles.statCard
            }
          >
            <div
              className={
                styles.statTop
              }
            >
              <span
                className={
                  styles.statLabel
                }
              >
                Scheduled
              </span>

              <span
                className={
                  styles.statIcon
                }
              >
                ◷
              </span>
            </div>

            <strong
              className={
                styles.statValue
              }
            >
              {stats.scheduled}
            </strong>

            <span
              className={
                styles.statHint
              }
            >
              Scheduled reports
            </span>
          </div>
        </section>

        {/* =================================================
            REPORT LIST
        ================================================= */}

        <section
          className={
            styles.panel
          }
        >
          <div
            className={
              styles.panelHeader
            }
          >
            <div>
              <h2>Reports</h2>

              <p>
                View and manage
                reports generated
                for this workspace.
              </p>
            </div>

            <button
              type="button"
              className={
                styles.secondaryButton
              }
              onClick={() =>
                void loadReports()
              }
              disabled={loading}
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>

          <div
            className={
              styles.toolbar
            }
          >
            <div
              className={
                styles.searchBox
              }
            >
              <span
                className={
                  styles.searchIcon
                }
              >
                ⌕
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search reports..."
                aria-label="Search reports"
              />
            </div>

            <select
              className={
                styles.filterSelect
              }
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target
                    .value as
                    | "ALL"
                    | ReportStatus,
                )
              }
              aria-label="Filter by status"
            >
              <option value="ALL">
                All Status
              </option>

              <option value="COMPLETED">
                Completed
              </option>

              <option value="GENERATING">
                Generating
              </option>

              <option value="SCHEDULED">
                Scheduled
              </option>

              <option value="DRAFT">
                Draft
              </option>

              <option value="FAILED">
                Failed
              </option>
            </select>
          </div>

          {loading ? (
            <div
              className={
                styles.loadingState
              }
            >
              <div
                className={
                  styles.spinner
                }
              />

              <p>
                Loading reports...
              </p>
            </div>
          ) : filteredReports.length ===
            0 ? (
            <div
              className={
                styles.emptyState
              }
            >
              <div
                className={
                  styles.emptyIcon
                }
              >
                ▤
              </div>

              <h3>
                {reports.length ===
                0
                  ? "No reports yet"
                  : "No reports found"}
              </h3>

              <p>
                {reports.length ===
                0
                  ? "Create your first customer feedback report to get started."
                  : "Try changing your search or status filter."}
              </p>

              {reports.length ===
                0 && (
                <button
                  type="button"
                  className={
                    styles.primaryButton
                  }
                  onClick={
                    openCreateModal
                  }
                >
                  Generate your
                  first report
                </button>
              )}
            </div>
          ) : (
            <div
              className={
                styles.tableWrapper
              }
            >
              <table
                className={
                  styles.table
                }
              >
                <thead>
                  <tr>
                    <th>
                      Report
                    </th>

                    <th>
                      Type
                    </th>

                    <th>
                      Date Range
                    </th>

                    <th>
                      Metrics
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Created
                    </th>

                    <th
                      className={
                        styles.actionHeader
                      }
                    >
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReports.map(
                    (report) => (
                      <tr
                        key={
                          report.id
                        }
                      >
                        <td>
                          <div
                            className={
                              styles.reportCell
                            }
                          >
                            <div
                              className={
                                styles.reportAvatar
                              }
                            >
                              {report.title
                                .charAt(
                                  0,
                                )
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {
                                  report.title
                                }
                              </strong>

                              {report.description && (
                                <span>
                                  {
                                    report.description
                                  }
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              styles.typeBadge
                            }
                          >
                            {getTypeLabel(
                              report.type,
                            )}
                          </span>
                        </td>

                        <td>
                          <div
                            className={
                              styles.dateRange
                            }
                          >
                            <span>
                              {formatDate(
                                report.startDate,
                              )}
                            </span>

                            <span>
                              →
                            </span>

                            <span>
                              {formatDate(
                                report.endDate,
                              )}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span
                            className={
                              styles.metricCount
                            }
                            title={
                              report.metrics
                                ?.map(
                                  getMetricLabel,
                                )
                                .join(
                                  ", ",
                                ) ??
                              ""
                            }
                          >
                            {Array.isArray(
                              report.metrics,
                            )
                              ? report
                                  .metrics
                                  .length
                              : 0}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              styles[
                                `status${report.status}`
                              ] ?? ""
                            }`}
                          >
                            <span
                              className={
                                styles.statusDot
                              }
                            />

                            {getStatusLabel(
                              report.status,
                            )}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            report.createdAt,
                          )}
                        </td>

                        <td>
                          <div
                            className={
                              styles.rowActions
                            }
                          >
                            <button
                              type="button"
                              className={
                                styles.viewButton
                              }
                              onClick={() => {
                                console.log(
                                  "Report:",
                                  report,
                                );
                              }}
                            >
                              View
                            </button>

                            <button
                              type="button"
                              className={
                                styles.deleteButton
                              }
                              disabled={
                                deletingId ===
                                report.id
                              }
                              onClick={() =>
                                void handleDelete(
                                  report.id,
                                )
                              }
                              aria-label={`Delete ${report.title}`}
                            >
                              {deletingId ===
                              report.id
                                ? "..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ===================================================
          CREATE REPORT MODAL
      =================================================== */}

      {showCreateModal && (
        <div
          className={
            styles.modalOverlay
          }
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !creating
            ) {
              setShowCreateModal(
                false,
              );
            }
          }}
        >
          <section
            className={
              styles.modal
            }
            role="dialog"
            aria-modal="true"
            aria-labelledby="generate-report-title"
          >
            <div
              className={
                styles.modalHeader
              }
            >
              <div>
                <span
                  className={
                    styles.modalEyebrow
                  }
                >
                  REPORT BUILDER
                </span>

                <h2 id="generate-report-title">
                  Generate New Report
                </h2>

                <p>
                  Create an insight
                  report from your
                  workspace feedback.
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.modalClose
                }
                disabled={creating}
                onClick={() =>
                  setShowCreateModal(
                    false,
                  )
                }
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form
              className={
                styles.form
              }
              onSubmit={
                handleCreate
              }
            >
              {/* =========================================
                  BASIC INFORMATION
              ========================================= */}

              <div
                className={
                  styles.formSection
                }
              >
                <div
                  className={
                    styles.sectionTitle
                  }
                >
                  <span>
                    01
                  </span>

                  <div>
                    <h3>
                      Basic Information
                    </h3>

                    <p>
                      Give your
                      report a clear
                      name and
                      description.
                    </p>
                  </div>
                </div>

                <div
                  className={
                    styles.formGrid
                  }
                >
                  <label
                    className={
                      styles.field
                    }
                  >
                    <span>
                      Report Name{" "}
                      <b
                        className={
                          styles.required
                        }
                      >
                        *
                      </b>
                    </span>

                    <input
                      type="text"
                      value={
                        form.reportName
                      }
                      onChange={(
                        event,
                      ) =>
                        updateForm(
                          "reportName",
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="e.g. August Customer Feedback Report"
                      maxLength={
                        150
                      }
                      required
                    />

                    <small>
                      {
                        form
                          .reportName
                          .length
                      }
                      /150
                    </small>
                  </label>

                  <label
                    className={
                      styles.field
                    }
                  >
                    <span>
                      Description
                    </span>

                    <textarea
                      value={
                        form.description
                      }
                      onChange={(
                        event,
                      ) =>
                        updateForm(
                          "description",
                          event
                            .target
                            .value,
                        )
                      }
                      placeholder="Describe what this report should analyze..."
                      rows={4}
                      maxLength={
                        500
                      }
                    />

                    <small>
                      {
                        form
                          .description
                          .length
                      }
                      /500
                    </small>
                  </label>
                </div>
              </div>

              {/* =========================================
                  REPORT TYPE
              ========================================= */}

              <div
                className={
                  styles.formSection
                }
              >
                <div
                  className={
                    styles.sectionTitle
                  }
                >
                  <span>
                    02
                  </span>

                  <div>
                    <h3>
                      Report Type
                    </h3>

                    <p>
                      Select the
                      type of
                      analysis you
                      need.
                    </p>
                  </div>
                </div>

                <div
                  className={
                    styles.typeGrid
                  }
                >
                  {REPORT_TYPES.map(
                    (type) => (
                      <label
                        key={
                          type.value
                        }
                        className={`${styles.typeOption} ${
                          form.reportType ===
                          type.value
                            ? styles.typeOptionActive
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name="reportType"
                          value={
                            type.value
                          }
                          checked={
                            form.reportType ===
                            type.value
                          }
                          onChange={() =>
                            updateForm(
                              "reportType",
                              type.value,
                            )
                          }
                        />

                        <span
                          className={
                            styles.radioVisual
                          }
                        />

                        <span
                          className={
                            styles.typeContent
                          }
                        >
                          <strong>
                            {
                              type.label
                            }
                          </strong>

                          <small>
                            {
                              type.description
                            }
                          </small>
                        </span>
                      </label>
                    ),
                  )}
                </div>
              </div>

              {/* =========================================
                  SOURCES
              ========================================= */}

              <div
                className={
                  styles.formSection
                }
              >
                <div
                  className={
                    styles.sectionTitle
                  }
                >
                  <span>
                    03
                  </span>

                  <div>
                    <h3>
                      Sources
                    </h3>

                    <p>
                      Select feedback
                      sources to
                      include.
                    </p>
                  </div>
                </div>

                <div
                  className={
                    styles.sourceActions
                  }
                >
                  <button
                    type="button"
                    className={
                      styles.textButton
                    }
                    onClick={
                      selectAllSources
                    }
                  >
                    Select All
                  </button>

                  <button
                    type="button"
                    className={
                      styles.textButton
                    }
                    onClick={
                      clearSources
                    }
                  >
                    Clear
                  </button>

                  <span>
                    {form.sources
                      .length ===
                    0
                      ? "No sources selected"
                      : `${form.sources.length} selected`}
                  </span>
                </div>

                <div
                  className={
                    styles.sourceGrid
                  }
                >
                  {SOURCES.map(
                    (source) => {
                      const selected =
                        form.sources.includes(
                          source.value,
                        );

                      return (
                        <label
                          key={
                            source.value
                          }
                          className={`${styles.checkboxOption} ${
                            selected
                              ? styles.checkboxActive
                              : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selected
                            }
                            onChange={() =>
                              toggleSource(
                                source.value,
                              )
                            }
                          />

                          <span
                            className={
                              styles.checkboxVisual
                            }
                          >
                            {selected
                              ? "✓"
                              : ""}
                          </span>

                          <span>
                            {
                              source.label
                            }
                          </span>
                        </label>
                      );
                    },
                  )}
                </div>
              </div>

              {/* =========================================
                  DATE RANGE
              ========================================= */}

              <div
                className={
                  styles.formSection
                }
              >
                <div
                  className={
                    styles.sectionTitle
                  }
                >
                  <span>
                    04
                  </span>

                  <div>
                    <h3>
                      Date Range
                    </h3>

                    <p>
                      Choose the
                      feedback
                      period for
                      this report.
                    </p>
                  </div>
                </div>

                <div
                  className={
                    styles.dateGrid
                  }
                >
                  <label
                    className={
                      styles.field
                    }
                  >
                    <span>
                      Start Date{" "}
                      <b
                        className={
                          styles.required
                        }
                      >
                        *
                      </b>
                    </span>

                    <input
                      type="date"
                      value={
                        form.startDate
                      }
                      onChange={(
                        event,
                      ) =>
                        updateForm(
                          "startDate",
                          event
                            .target
                            .value,
                        )
                      }
                      required
                    />
                  </label>

                  <label
                    className={
                      styles.field
                    }
                  >
                    <span>
                      End Date{" "}
                      <b
                        className={
                          styles.required
                        }
                      >
                        *
                      </b>
                    </span>

                    <input
                      type="date"
                      value={
                        form.endDate
                      }
                      min={
                        form.startDate
                      }
                      onChange={(
                        event,
                      ) =>
                        updateForm(
                          "endDate",
                          event
                            .target
                            .value,
                        )
                      }
                      required
                    />
                  </label>
                </div>
              </div>

              {/* =========================================
                  METRICS
              ========================================= */}

              <div
                className={
                  styles.formSection
                }
              >
                <div
                  className={
                    styles.sectionTitle
                  }
                >
                  <span>
                    05
                  </span>

                  <div>
                    <h3>
                      Report Metrics
                    </h3>

                    <p>
                      Select the
                      insights you
                      want in the
                      report.
                    </p>
                  </div>
                </div>

                <div
                  className={
                    styles.metricGrid
                  }
                >
                  {METRICS.map(
                    (metric) => {
                      const selected =
                        form.metrics.includes(
                          metric.value,
                        );

                      return (
                        <label
                          key={
                            metric.value
                          }
                          className={`${styles.metricOption} ${
                            selected
                              ? styles.metricActive
                              : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={
                              selected
                            }
                            onChange={() =>
                              toggleMetric(
                                metric.value,
                              )
                            }
                          />

                          <span
                            className={
                              styles.metricCheck
                            }
                          >
                            {selected
                              ? "✓"
                              : ""}
                          </span>

                          <span>
                            {
                              metric.label
                            }
                          </span>
                        </label>
                      );
                    },
                  )}
                </div>
              </div>

              {/* =========================================
                  ERROR
              ========================================= */}

              {error && (
                <div
                  className={`${styles.formError} ${styles.alertError}`}
                >
                  <span>
                    !
                  </span>

                  <p>
                    {error}
                  </p>
                </div>
              )}

              {/* =========================================
                  FOOTER
              ========================================= */}

              <div
                className={
                  styles.modalFooter
                }
              >
                <button
                  type="button"
                  className={
                    styles.cancelButton
                  }
                  disabled={
                    creating
                  }
                  onClick={() =>
                    setShowCreateModal(
                      false,
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    styles.primaryButton
                  }
                  disabled={
                    creating
                  }
                >
                  {creating ? (
                    <>
                      <span
                        className={
                          styles.buttonSpinner
                        }
                      />

                      Creating...
                    </>
                  ) : (
                    <>
                      <span>
                        ✦
                      </span>

                      Generate Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}