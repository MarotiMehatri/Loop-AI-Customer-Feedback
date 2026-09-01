
"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  Download,
  FileBarChart,
  Lightbulb,
  MessageSquare,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

import { toast } from "sonner";

import { apiClient } from "../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../lib/api/api-error";

import {
  useAnalytics,
  useClassificationsCount,
  useInboxStatusCount,
} from "../../../../Features/analytics/hooks/useAnalytics";

import { useFeedbackInbox } from "../../../../Features/feedback/hooks/useFeedbackInbox";

import { useAuthStore } from "../../../../store";

import styles from "./dashboard.module.css";

const SOURCE_META: Record<
  string,
  {
    label: string;
    color: string;
  }
> = {
  SUPPORT: {
    label: "Support Ticket",
    color: "#5b2cf0",
  },

  APP_STORE: {
    label: "App Store",
    color: "#2563eb",
  },

  SURVEY: {
    label: "Survey",
    color: "#22a66d",
  },

  SALES: {
    label: "Sales",
    color: "#f59e0b",
  },

  SOCIAL: {
    label: "Social Media",
    color: "#e45bb9",
  },

  WEBSITE: {
    label: "Website",
    color: "#8b5cf6",
  },

  EMAIL: {
    label: "Email",
    color: "#f97316",
  },

  MANUAL: {
    label: "Manual",
    color: "#98a2b3",
  },
};

type LatestFeedback = {
  id: string;

  text?: string | null;

  content?: string | null;

  customerName?: string | null;

  source?: string | null;

  sentiment?: string | null;

  createdAt?: string | null;

  feedbackDate?: string | null;

  theme?: string | null;
};

function numberValue(value: unknown): number {
  const result = Number(value);

  return Number.isFinite(result) ? result : 0;
}

function percentage(value: unknown): number {
  return Math.round(numberValue(value) * 10) / 10;
}

function safeDate(value?: string | null): Date | null {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function shortDate(value: string): string {
  const date = safeDate(value);

  if (!date) {
    return value;
  }

  return format(date, "MMM d");
}

function formatDateRange(
  start?: string,
  end?: string,
): string {
  const startDate = safeDate(start);
  const endDate = safeDate(end);

  if (!startDate || !endDate) {
    return "This week";
  }

  return `${format(
    startDate,
    "MMM d",
  )} – ${format(endDate, "MMM d, yyyy")}`;
}

function feedbackText(
  feedback: LatestFeedback,
): string {
  return (
    feedback.text?.trim() ||
    feedback.content?.trim() ||
    "Customer feedback"
  );
}

function sourceLabel(
  source?: string | null,
): string {
  if (!source) {
    return "Unknown";
  }

  return (
    SOURCE_META[source]?.label ||
    source
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase(),
      )
  );
}

function sentimentLabel(
  sentiment?: string | null,
): string {
  if (!sentiment) {
    return "Unknown";
  }

  return (
    sentiment.charAt(0) +
    sentiment.slice(1).toLowerCase()
  );
}

function formatFeedbackDate(
  feedback: LatestFeedback,
): string {
  const date = safeDate(
    feedback.feedbackDate ||
      feedback.createdAt,
  );

  if (!date) {
    return "—";
  }

  return format(
    date,
    "MMM d, yyyy h:mm a",
  );
}

function Card({
  title,
  action,
  children,
  className = "",
}: {
  title: string;

  action?: React.ReactNode;

  children: React.ReactNode;

  className?: string;
}) {
  return (
    <article
      className={`${styles.card} ${className}`}
    >
      <header className={styles.cardHeader}>
        <h2>{title}</h2>

        {action}
      </header>

      {children}
    </article>
  );
}

function MetricCard({
  icon,
  label,
  value,
  change,
  tone,
  down = false,
}: {
  icon: React.ReactNode;

  label: string;

  value: string;

  change: string;

  tone:
    | "purple"
    | "red"
    | "green"
    | "blue"
    | "orange";

  down?: boolean;
}) {
  return (
    <article className={styles.metricCard}>
      <div
        className={`${styles.metricIcon} ${styles[tone]}`}
      >
        {icon}
      </div>

      <div className={styles.metricText}>
        <span>{label}</span>

        <strong>{value}</strong>

        <small
          className={
            down
              ? styles.changeDown
              : styles.changeUp
          }
        >
          {down ? "↓" : "↑"} {change}

          <em>vs last week</em>
        </small>
      </div>
    </article>
  );
}

function EmptyChart({
  message,
}: {
  message: string;
}) {
  return (
    <div className={styles.emptyChart}>
      <BarChart3 size={20} />

      <strong>{message}</strong>

      <span>
        Data will appear here when feedback
        is available.
      </span>
    </div>
  );
}

function LoadingChart() {
  return (
    <div className={styles.emptyChart}>
      <BarChart3 size={20} />

      <strong>Loading analytics...</strong>

      <span>
        Fetching your workspace feedback data.
      </span>
    </div>
  );
}

export default function AnalystDashboardPage() {
  const user = useAuthStore(
    (state) => state.user,
  );

  const [days, setDays] = useState(7);

  /*
   * ------------------------------------------------
   * ANALYTICS
   * ------------------------------------------------
   */

  const analyticsQuery = useAnalytics({
    days,
    groupBy: "day",
  });

  /*
   * ------------------------------------------------
   * STATUS COUNTS
   * ------------------------------------------------
   */

  const newQuery =
    useInboxStatusCount("NEW");

  const reviewedQuery =
    useInboxStatusCount("REVIEWED");

  const actionedQuery =
    useInboxStatusCount("ACTIONED");

  const archivedQuery =
    useInboxStatusCount("ARCHIVED");

  /*
   * ------------------------------------------------
   * AI CLASSIFICATION
   * ------------------------------------------------
   */

  const classifiedQuery =
    useClassificationsCount();

  /*
   * ------------------------------------------------
   * LATEST FEEDBACK
   *
   * IMPORTANT:
   * This comes from the inbox endpoint.
   * We do NOT depend on analytics.latestFeedback.
   * ------------------------------------------------
   */

  const latestQuery = useFeedbackInbox({
    page: 1,

    limit: 5,
  });

  /*
   * ------------------------------------------------
   * DASHBOARD DATA
   * ------------------------------------------------
   */

  const dashboard =
    analyticsQuery.data;

  const overview =
    dashboard?.overview;

  const total = numberValue(
    overview?.totalFeedback,
  );

  const positive = numberValue(
    overview?.positive?.count,
  );

  const neutral = numberValue(
    overview?.neutral?.count,
  );

  const negative = numberValue(
    overview?.negative?.count,
  );

  const topTheme =
    dashboard?.topThemes?.[0];

  /*
   * ------------------------------------------------
   * LATEST FEEDBACK
   * ------------------------------------------------
   */

  const latestFeedback =
    useMemo<LatestFeedback[]>(() => {
      const items =
        latestQuery.data?.items ?? [];

      return items
        .slice(0, 5)
        .map((item: any) => ({
          id: String(item.id),

          text:
            item.text ??
            item.feedback ??
            item.message ??
            null,

          content:
            item.content ??
            null,

          customerName:
            item.customerName ??
            item.customer?.name ??
            item.customer?.fullName ??
            null,

          source:
            item.source ??
            null,

          sentiment:
            item.sentiment ??
            null,

          createdAt:
            item.createdAt ??
            null,

          feedbackDate:
            item.feedbackDate ??
            null,

          theme:
            item.theme?.name ??
            item.theme ??
            null,
        }));
    }, [latestQuery.data]);

  /*
   * ------------------------------------------------
   * AI COVERAGE
   * ------------------------------------------------
   */

  const classified =
    numberValue(
      classifiedQuery.data,
    );

  const aiCoverage =
    total > 0
      ? Math.min(
          Math.round(
            (classified / total) * 100,
          ),
          100,
        )
      : 0;

  /*
   * ------------------------------------------------
   * FEEDBACK TREND
   * ------------------------------------------------
   */

  const feedbackTrend =
    useMemo(() => {
      return (
        dashboard?.feedbackTrend ?? []
      ).map((point) => ({
        date: shortDate(
          point.period,
        ),

        total: numberValue(
          point.total,
        ),
      }));
    }, [dashboard]);

  /*
   * ------------------------------------------------
   * SENTIMENT TREND
   * ------------------------------------------------
   */

  const sentimentTrend =
    useMemo(() => {
      return (
        dashboard?.feedbackTrend ?? []
      ).map((point) => ({
        date: shortDate(
          point.period,
        ),

        positive: numberValue(
          point.positive,
        ),

        neutral: numberValue(
          point.neutral,
        ),

        negative: numberValue(
          point.negative,
        ),
      }));
    }, [dashboard]);

  /*
   * ------------------------------------------------
   * SOURCES
   * ------------------------------------------------
   */

  const sources =
    useMemo(() => {
      return (
        dashboard?.sourceDistribution ??
        []
      ).map((item) => ({
        name:
          SOURCE_META[item.key]
            ?.label ??
          item.label ??
          item.key,

        value: numberValue(
          item.percentage,
        ),

        count: numberValue(
          item.count,
        ),

        color:
          SOURCE_META[item.key]
            ?.color ??
          "#98a2b3",
      }));
    }, [dashboard]);

  /*
   * ------------------------------------------------
   * THEMES
   * ------------------------------------------------
   */

  const themes =
    useMemo(() => {
      return (
        dashboard?.topThemes ?? []
      )
        .slice(0, 5)
        .map((theme) => ({
          id: theme.id,

          name: theme.name,

          count: numberValue(
            theme.count,
          ),

          percentage:
            percentage(
              theme.percentage,
            ),
        }));
    }, [dashboard]);

  /*
   * ------------------------------------------------
   * STATUS
   * ------------------------------------------------
   */

  const statusRows =
    useMemo(
      () =>
        [
          [
            "New",
            numberValue(
              newQuery.data,
            ),
            styles.statusNew,
          ],

          [
            "Reviewed",
            numberValue(
              reviewedQuery.data,
            ),
            styles.statusReviewed,
          ],

          [
            "In Progress",
            numberValue(
              actionedQuery.data,
            ),
            styles.statusProgress,
          ],

          [
            "Closed",
            numberValue(
              archivedQuery.data,
            ),
            styles.statusClosed,
          ],
        ] as const,
      [
        newQuery.data,
        reviewedQuery.data,
        actionedQuery.data,
        archivedQuery.data,
      ],
    );

  const statusTotal =
    statusRows.reduce(
      (sum, [, value]) =>
        sum + value,
      0,
    ) || 1;

  /*
   * ------------------------------------------------
   * INSIGHTS
   * ------------------------------------------------
   */

  const insights =
    useMemo(() => {
      return (
        dashboard?.insights ?? []
      )
        .slice(0, 3)
        .map((item) => ({
          title: item.title,

          description:
            item.description,

          type: item.type,
        }));
    }, [dashboard]);

  /*
   * ------------------------------------------------
   * DATE RANGE
   * ------------------------------------------------
   */

  const range =
    formatDateRange(
      dashboard?.range?.startDate,
      dashboard?.range?.endDate,
    );

  /*
   * ------------------------------------------------
   * ACTIONS
   * ------------------------------------------------
   */

  const handleAddFeedback =
    () => {
      window.location.href =
        "/protected/analyst/add-feedback";
    };

  const handleCreateReport =
    () => {
      window.location.href =
        "/protected/analyst/reports";
    };

  const handleAskAI =
    () => {
      window.location.href =
        "/protected/analyst/ask-loop";
    };

  const handleViewInbox =
    () => {
      window.location.href =
        "/protected/analyst/inbox";
    };

  /*
   * ------------------------------------------------
   * EXPORT
   * ------------------------------------------------
   */

  const handleExport =
    async () => {
      try {
        const response =
          await apiClient.get(
            "/analytics/export",
            {
              params: {
                format: "csv",
                days,
                groupBy: "day",
              },

              responseType: "blob",
            },
          );

        const blob =
          new Blob(
            [
              response.data as BlobPart,
            ],
            {
              type:
                "text/csv;charset=utf-8",
            },
          );

        const url =
          URL.createObjectURL(
            blob,
          );

        const anchor =
          document.createElement(
            "a",
          );

        anchor.href = url;

        anchor.download =
          `loop-analytics-${Date.now()}.csv`;

        document.body.appendChild(
          anchor,
        );

        anchor.click();

        anchor.remove();

        URL.revokeObjectURL(
          url,
        );

        toast.success(
          "Analytics CSV exported.",
        );
      } catch (error) {
        toast.error(
          getErrorMessage(error),
        );
      }
    };

  const loading =
    analyticsQuery.isLoading;

  const latestLoading =
    latestQuery.isLoading;

  return (
    <main className={styles.page}>
      {/* =========================================
          HEADER
      ========================================== */}

      <header
        className={styles.topbar}
      >
        <div
          className={styles.heading}
        >
          <div
            className={
              styles.headingTitle
            }
          >
            <h1>Dashboard</h1>

            <BarChart3 size={20} />
          </div>

          <p>
            Welcome back,{" "}
            {user?.name ??
              "there"}
            ! 👋
          </p>
        </div>

        <div
          className={
            styles.topActions
          }
        >
          <div
            className={
              styles.dateButton
            }
          >
            <span>
              {range}
            </span>

            <CalendarDays
              size={16}
            />
          </div>

          <button
            type="button"
            className={
              styles.headerIconButton
            }
            aria-label="Notifications"
          >
            <Bell size={21} />

            {numberValue(
              overview?.unresolved,
            ) > 0 && (
              <i>
                {numberValue(
                  overview?.unresolved,
                )}
              </i>
            )}
          </button>

          <div
            className={
              styles.headerUser
            }
          >
            <span
              className={
                styles.avatar
              }
            >
              {(user?.name ??
                "LOOP")
                .split(" ")
                .map(
                  (part) =>
                    part[0],
                )
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </span>

            <div>
              <strong>
                {user?.name ??
                  "LOOP User"}
              </strong>

              <small>
                {user?.role
                  ? user.role
                      .charAt(0)
                      .toUpperCase() +
                    user.role
                      .slice(1)
                      .toLowerCase()
                  : "Analyst"}
              </small>
            </div>

            <ChevronDown
              size={15}
            />
          </div>
        </div>
      </header>

      {/* =========================================
          CONTENT
      ========================================== */}

      <section
        className={styles.content}
      >
        <div
          className={
            styles.mainColumn
          }
        >
          {/* =====================================
              METRICS
          ====================================== */}

          <section
            className={
              styles.metricsGrid
            }
          >
            <MetricCard
              icon={
                <MessageSquare
                  size={20}
                />
              }
              label="Total Feedback"
              value={
                loading
                  ? "…"
                  : total.toLocaleString(
                      "en-IN",
                    )
              }
              change="0%"
              tone="purple"
            />

            <MetricCard
              icon={
                <Activity
                  size={20}
                />
              }
              label="Negative Feedback"
              value={
                loading
                  ? "…"
                  : total > 0
                    ? `${(
                        (negative /
                          total) *
                        100
                      ).toFixed(1)}%`
                    : "0%"
              }
              change="0%"
              tone="red"
              down
            />

            <MetricCard
              icon={
                <Plus
                  size={20}
                />
              }
              label="New Feedback"
              value={
                newQuery.isLoading
                  ? "…"
                  : numberValue(
                      newQuery.data,
                    ).toLocaleString(
                      "en-IN",
                    )
              }
              change="0%"
              tone="green"
            />

            <MetricCard
              icon={
                <Users
                  size={20}
                />
              }
              label="Unique Customers"
              value="—"
              change="—"
              tone="blue"
            />

            <MetricCard
              icon={
                <Lightbulb
                  size={20}
                />
              }
              label="Top Theme"
              value={
                topTheme?.name ??
                "—"
              }
              change={
                topTheme
                  ? `${percentage(
                      topTheme.percentage,
                    )}% of total`
                  : "—"
              }
              tone="orange"
            />
          </section>

          {/* =====================================
              EMPTY STATE
          ====================================== */}

          {!loading &&
            total === 0 && (
              <section
                className={
                  styles.emptyBanner
                }
              >
                <div>
                  <MessageSquare
                    size={21}
                  />

                  <div>
                    <strong>
                      No feedback yet
                    </strong>

                    <span>
                      Add feedback or
                      import a CSV to
                      populate the
                      dashboard.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    handleAddFeedback
                  }
                >
                  Add Feedback
                </button>
              </section>
            )}

          {/* =====================================
              ROW 1
              FEEDBACK OVER TIME
              SENTIMENT DISTRIBUTION
          ====================================== */}

          <section
            className={
              styles.gridTwo
            }
          >
            <Card
              title="Feedback Over Time"
              action={
                <select
                  className={
                    styles.periodSelect
                  }
                  value={days}
                  onChange={(
                    event,
                  ) =>
                    setDays(
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                >
                  <option value={7}>
                    7 Days
                  </option>

                  <option value={14}>
                    14 Days
                  </option>

                  <option value={30}>
                    30 Days
                  </option>

                  <option value={90}>
                    90 Days
                  </option>
                </select>
              }
            >
              {loading ? (
                <LoadingChart />
              ) : feedbackTrend.length ===
                0 ? (
                <EmptyChart
                  message="No feedback trend yet"
                />
              ) : (
                <div
                  className={
                    styles.chart
                  }
                >
                  <ResponsiveContainer
                    width="100%"
                    height={235}
                  >
                    <AreaChart
                      data={
                        feedbackTrend
                      }
                    >
                      <defs>
                        <linearGradient
                          id="dashboardFeedbackFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#5b2cf0"
                            stopOpacity={
                              0.3
                            }
                          />

                          <stop
                            offset="100%"
                            stopColor="#5b2cf0"
                            stopOpacity={
                              0.02
                            }
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        vertical={
                          false
                        }
                        stroke="#ececf2"
                      />

                      <XAxis
                        dataKey="date"
                        axisLine={
                          false
                        }
                        tickLine={
                          false
                        }
                        tick={{
                          fontSize: 10,
                          fill: "#667085",
                        }}
                      />

                      <YAxis
                        axisLine={
                          false
                        }
                        tickLine={
                          false
                        }
                        allowDecimals={
                          false
                        }
                        tick={{
                          fontSize: 10,
                          fill: "#667085",
                        }}
                      />

                      <Tooltip />

                      <Area
                        type="monotone"
                        dataKey="total"
                        name="Total Feedback"
                        stroke="#5b2cf0"
                        strokeWidth={
                          2.5
                        }
                        fill="url(#dashboardFeedbackFill)"
                        dot={{
                          r: 3,
                          fill: "#5b2cf0",
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            <Card title="Sentiment Distribution">
              {loading ? (
                <LoadingChart />
              ) : total === 0 ? (
                <EmptyChart
                  message="No sentiment data yet"
                />
              ) : (
                <div
                  className={
                    styles.donutLayout
                  }
                >
                  <div
                    className={
                      styles.donutWrap
                    }
                  >
                    <ResponsiveContainer
                      width="100%"
                      height={210}
                    >
                      <PieChart>
                        <Pie
                          data={[
                            {
                              name: "Positive",
                              value: positive,
                            },
                            {
                              name: "Neutral",
                              value: neutral,
                            },
                            {
                              name: "Negative",
                              value: negative,
                            },
                          ]}
                          dataKey="value"
                          innerRadius={
                            58
                          }
                          outerRadius={
                            84
                          }
                          startAngle={
                            90
                          }
                          endAngle={
                            -270
                          }
                        >
                          <Cell fill="#16a34a" />
                          <Cell fill="#f59e0b" />
                          <Cell fill="#ef2b36" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    <div
                      className={
                        styles.donutCenter
                      }
                    >
                      <strong>
                        {total.toLocaleString(
                          "en-IN",
                        )}
                      </strong>

                      <span>
                        Total
                      </span>
                    </div>
                  </div>

                  <div
                    className={
                      styles.legend
                    }
                  >
                    {[
                      [
                        "Positive",
                        positive,
                      ],
                      [
                        "Neutral",
                        neutral,
                      ],
                      [
                        "Negative",
                        negative,
                      ],
                    ].map(
                      ([
                        label,
                        value,
                      ]) => (
                        <div
                          key={String(
                            label,
                          )}
                        >
                          <span>
                            {label}
                          </span>

                          <strong>
                            {total >
                            0
                              ? `${Math.round(
                                  (Number(
                                    value,
                                  ) /
                                    total) *
                                    100,
                                )}%`
                              : "0%"}
                          </strong>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </Card>
          </section>

          {/* =====================================
              ROW 2
              SOURCE
              TOP THEMES
              SENTIMENT TREND
          ====================================== */}

          <section
            className={
              styles.gridThree
            }
          >
            <Card title="Feedback by Source">
              {loading ||
              sources.length === 0 ? (
                loading ? (
                  <LoadingChart />
                ) : (
                  <EmptyChart
                    message="No source data yet"
                  />
                )
              ) : (
                <div
                  className={
                    styles.sourceLayout
                  }
                >
                  <div
                    className={
                      styles.sourceDonut
                    }
                  >
                    <ResponsiveContainer
                      width="100%"
                      height={190}
                    >
                      <PieChart>
                        <Pie
                          data={
                            sources
                          }
                          dataKey="value"
                          innerRadius={
                            47
                          }
                          outerRadius={
                            70
                          }
                        >
                          {sources.map(
                            (
                              source,
                            ) => (
                              <Cell
                                key={
                                  source.name
                                }
                                fill={
                                  source.color
                                }
                              />
                            ),
                          )}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div
                    className={
                      styles.sourceLegend
                    }
                  >
                    {sources
                      .slice(
                        0,
                        6,
                      )
                      .map(
                        (
                          source,
                        ) => (
                          <div
                            key={
                              source.name
                            }
                          >
                            <span>
                              {
                                source.name
                              }
                            </span>

                            <strong>
                              {
                                source.value
                              }
                              %
                            </strong>
                          </div>
                        ),
                      )}
                  </div>
                </div>
              )}
            </Card>

            <Card
              title="Top Themes"
              action={
                <button
                  type="button"
                  className={
                    styles.textButton
                  }
                  onClick={() =>
                    (window.location.href =
                      "/protected/analyst/themes")
                  }
                >
                  View all
                </button>
              }
            >
              {loading ? (
                <LoadingChart />
              ) : themes.length ===
                0 ? (
                <EmptyChart
                  message="No themes discovered yet"
                />
              ) : (
                <div
                  className={
                    styles.themeList
                  }
                >
                  {themes.map(
                    (
                      theme,
                    ) => (
                      <div
                        key={
                          theme.id
                        }
                      >
                        <span
                          className={
                            styles.themeName
                          }
                        >
                          {
                            theme.name
                          }
                        </span>

                        <strong>
                          {
                            theme.count
                          }
                        </strong>

                        <div
                          className={
                            styles.themeTrack
                          }
                        >
                          <i
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  theme.percentage,
                                  0,
                                ),
                                100,
                              )}%`,
                            }}
                          />
                        </div>

                        <em>
                          {
                            theme.percentage
                          }
                          %
                        </em>
                      </div>
                    ),
                  )}
                </div>
              )}
            </Card>

            <Card
              title="Sentiment Trend"
              action={
                <select
                  className={
                    styles.periodSelect
                  }
                  value={days}
                  onChange={(
                    event,
                  ) =>
                    setDays(
                      Number(
                        event.target
                          .value,
                      ),
                    )
                  }
                >
                  <option value={7}>
                    7 Days
                  </option>

                  <option value={14}>
                    14 Days
                  </option>

                  <option value={30}>
                    30 Days
                  </option>

                  <option value={90}>
                    90 Days
                  </option>
                </select>
              }
            >
              {loading ? (
                <LoadingChart />
              ) : sentimentTrend.length ===
                0 ? (
                <EmptyChart
                  message="No sentiment trend yet"
                />
              ) : (
                <>
                  <div
                    className={
                      styles.chart
                    }
                  >
                    <ResponsiveContainer
                      width="100%"
                      height={185}
                    >
                      <LineChart
                        data={
                          sentimentTrend
                        }
                      >
                        <CartesianGrid
                          vertical={
                            false
                          }
                          stroke="#ececf2"
                        />

                        <XAxis
                          dataKey="date"
                          axisLine={
                            false
                          }
                          tickLine={
                            false
                          }
                          tick={{
                            fontSize: 10,
                            fill: "#667085",
                          }}
                        />

                        <YAxis
                          axisLine={
                            false
                          }
                          tickLine={
                            false
                          }
                          allowDecimals={
                            false
                          }
                          tick={{
                            fontSize: 10,
                            fill: "#667085",
                          }}
                        />

                        <Tooltip />

                        <Line
                          type="monotone"
                          dataKey="positive"
                          name="Positive"
                          stroke="#16a34a"
                          strokeWidth={
                            2
                          }
                          dot={false}
                        />

                        <Line
                          type="monotone"
                          dataKey="neutral"
                          name="Neutral"
                          stroke="#f59e0b"
                          strokeWidth={
                            2
                          }
                          dot={false}
                        />

                        <Line
                          type="monotone"
                          dataKey="negative"
                          name="Negative"
                          stroke="#ef2b36"
                          strokeWidth={
                            2
                          }
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div
                    className={
                      styles.chartLegend
                    }
                  >
                    <span>
                      <i
                        className={
                          styles.positiveDot
                        }
                      />
                      Positive
                    </span>

                    <span>
                      <i
                        className={
                          styles.neutralDot
                        }
                      />
                      Neutral
                    </span>

                    <span>
                      <i
                        className={
                          styles.negativeDot
                        }
                      />
                      Negative
                    </span>
                  </div>
                </>
              )}
            </Card>
          </section>

          {/* =====================================
              STATUS + AI
          ====================================== */}

          <section
            className={
              styles.gridTwo
            }
          >
            <Card title="Feedback Status Breakdown">
              <div
                className={
                  styles.statusBar
                }
              >
                {statusRows.map(
                  ([
                    label,
                    value,
                    className,
                  ]) => (
                    <i
                      key={label}
                      className={
                        className
                      }
                      style={{
                        width: `${Math.max(
                          (value /
                            statusTotal) *
                            100,
                          value >
                            0
                            ? 1
                            : 0,
                        )}%`,
                      }}
                    />
                  ),
                )}
              </div>

              <div
                className={
                  styles.statusLegend
                }
              >
                {statusRows.map(
                  ([
                    label,
                    value,
                  ]) => (
                    <div
                      key={
                        label
                      }
                    >
                      <span>
                        {label}
                      </span>

                      <strong>
                        {value.toLocaleString(
                          "en-IN",
                        )}
                      </strong>
                    </div>
                  ),
                )}
              </div>
            </Card>

            <Card title="AI Classification Overview">
              <div
                className={
                  styles.aiOverview
                }
              >
                <div
                  className={
                    styles.coverageRing
                  }
                  style={{
                    background: `conic-gradient(#5b2cf0 ${aiCoverage}%, #ececf2 0)`,
                  }}
                >
                  <div>
                    <strong>
                      {
                        aiCoverage
                      }
                      %
                    </strong>

                    <span>
                      Coverage
                    </span>
                  </div>
                </div>

                <div
                  className={
                    styles.aiStats
                  }
                >
                  <p>
                    Total processed

                    <strong>
                      {total.toLocaleString(
                        "en-IN",
                      )}
                    </strong>
                  </p>

                  <p>
                    Auto classified

                    <strong>
                      {classified.toLocaleString(
                        "en-IN",
                      )}{" "}
                      (
                      {
                        aiCoverage
                      }
                      %)
                    </strong>
                  </p>

                  <p>
                    Needs review

                    <strong>
                      {Math.max(
                        total -
                          classified,
                        0,
                      ).toLocaleString(
                        "en-IN",
                      )}
                    </strong>
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* =====================================
              LATEST FEEDBACK
              THIS IS NOW INDEPENDENT FROM ANALYTICS
          ====================================== */}

          <section
            className={`${styles.card} ${styles.latestCard}`}
          >
            <header
              className={
                styles.cardHeader
              }
            >
              <h2>
                Latest Feedback
              </h2>

              <button
                type="button"
                className={
                  styles.textButton
                }
                onClick={
                  handleViewInbox
                }
              >
                View all
              </button>
            </header>

            {latestLoading ? (
              <div
                className={
                  styles.latestEmpty
                }
              >
                <MessageSquare
                  size={22}
                />

                <strong>
                  Loading latest
                  feedback...
                </strong>
              </div>
            ) : latestQuery.error ? (
              <div
                className={
                  styles.latestEmpty
                }
              >
                <MessageSquare
                  size={22}
                />

                <strong>
                  Failed to load
                  latest feedback.
                </strong>

                <span>
                  Check the
                  feedback-inbox
                  API request.
                </span>
              </div>
            ) : latestFeedback.length ===
              0 ? (
              <div
                className={
                  styles.latestEmpty
                }
              >
                <MessageSquare
                  size={22}
                />

                <strong>
                  No feedback yet.
                </strong>

                <span>
                  Add feedback to
                  populate the
                  dashboard.
                </span>

                <button
                  type="button"
                  onClick={
                    handleAddFeedback
                  }
                >
                  Add Feedback
                </button>
              </div>
            ) : (
              <div
                className={
                  styles.tableWrap
                }
              >
                <table>
                  <thead>
                    <tr>
                      <th>
                        Feedback
                      </th>

                      <th>
                        Source
                      </th>

                      <th>
                        Customer
                      </th>

                      <th>
                        Sentiment
                      </th>

                      <th>
                        Theme
                      </th>

                      <th>
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {latestFeedback.map(
                      (
                        item,
                      ) => (
                        <tr
                          key={
                            item.id
                          }
                        >
                          <td
                            className={
                              styles.feedbackCell
                            }
                          >
                            {
                              feedbackText(
                                item,
                              )
                            }
                          </td>

                          <td>
                            {sourceLabel(
                              item.source,
                            )}
                          </td>

                          <td>
                            {
                              item.customerName ??
                              "—"
                            }
                          </td>

                          <td>
                            <span
                              className={`${styles.sentimentBadge} ${
                                styles[
                                  `sentiment${
                                    item.sentiment ??
                                    "UNKNOWN"
                                  }`
                                ] ??
                                ""
                              }`}
                            >
                              {sentimentLabel(
                                item.sentiment,
                              )}
                            </span>
                          </td>

                          <td>
                            {item.theme ??
                              "—"}
                          </td>

                          <td>
                            {formatFeedbackDate(
                              item,
                            )}
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

        {/* =======================================
            RIGHT RAIL
        ======================================== */}

        <aside
          className={
            styles.rail
          }
        >
          <section
            className={
              styles.filterCard
            }
          >
            <div
              className={
                styles.filterHeader
              }
            >
              <h2>
                Filters
              </h2>

              <button
                type="button"
                onClick={() =>
                  setDays(7)
                }
              >
                Clear all
              </button>
            </div>

            <label>
              Workspace

              <select disabled>
                <option>
                  Current workspace
                </option>
              </select>
            </label>

            <label>
              Date Range

              <select
                value={days}
                onChange={(
                  event,
                ) =>
                  setDays(
                    Number(
                      event.target
                        .value,
                    ),
                  )
                }
              >
                <option value={7}>
                  Last 7 days
                </option>

                <option value={14}>
                  Last 14 days
                </option>

                <option value={30}>
                  Last 30 days
                </option>

                <option value={90}>
                  Last 90 days
                </option>
              </select>
            </label>

            <label>
              Source

              <select>
                <option value="">
                  All sources
                </option>

                {Object.entries(
                  SOURCE_META,
                ).map(
                  ([
                    value,
                    meta,
                  ]) => (
                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {
                        meta.label
                      }
                    </option>
                  ),
                )}
              </select>
            </label>

            <label>
              Channel

              <select disabled>
                <option>
                  Uses feedback
                  source
                </option>
              </select>
            </label>

            <button
              type="button"
              className={
                styles.applyButton
              }
              onClick={() =>
                analyticsQuery.refetch()
              }
              disabled={
                analyticsQuery.isFetching
              }
            >
              {analyticsQuery.isFetching
                ? "Applying…"
                : "Apply Filters"}
            </button>
          </section>

          {/* TOP THEMES RAIL */}

          <section
            className={
              styles.railCard
            }
          >
            <div
              className={
                styles.railHeader
              }
            >
              <h2>
                Top Themes
              </h2>

              <button
                type="button"
                onClick={() =>
                  (window.location.href =
                    "/protected/analyst/themes")
                }
              >
                View all
              </button>
            </div>

            <div
              className={
                styles.railThemes
              }
            >
              {themes.length ===
              0 ? (
                <span
                  className={
                    styles.muted
                  }
                >
                  No themes yet.
                </span>
              ) : (
                themes.map(
                  (
                    theme,
                  ) => (
                    <div
                      key={
                        theme.id
                      }
                    >
                      <span>
                        <i />

                        {
                          theme.name
                        }
                      </span>

                      <strong>
                        {
                          theme.percentage
                        }
                        %
                      </strong>
                    </div>
                  ),
                )
              )}
            </div>
          </section>

          {/* AI INSIGHTS */}

          <section
            className={
              styles.railCard
            }
          >
            <div
              className={
                styles.railHeader
              }
            >
              <h2>
                AI Insights
              </h2>

              <Sparkles
                size={16}
              />
            </div>

            <div
              className={
                styles.insights
              }
            >
              {insights.length ===
              0 ? (
                <span
                  className={
                    styles.muted
                  }
                >
                  No AI insights
                  available yet.
                </span>
              ) : (
                insights.map(
                  (
                    insight,
                    index,
                  ) => (
                    <div
                      key={`${insight.title}-${index}`}
                    >
                      <i
                        className={
                          insight.type ===
                          "WARNING"
                            ? styles.insightWarning
                            : insight.type ===
                                "POSITIVE"
                              ? styles.insightPositive
                              : styles.insightInfo
                        }
                      >
                        {insight.type ===
                        "WARNING"
                          ? "!"
                          : insight.type ===
                              "POSITIVE"
                            ? "↗"
                            : "i"}
                      </i>

                      <p>
                        <strong>
                          {
                            insight.title
                          }
                        </strong>

                        <span>
                          {
                            insight.description
                          }
                        </span>
                      </p>
                    </div>
                  ),
                )
              )}
            </div>
          </section>

          {/* QUICK ACTIONS */}

          <section
            className={
              styles.railCard
            }
          >
            <div
              className={
                styles.railHeader
              }
            >
              <h2>
                Quick Actions
              </h2>
            </div>

            <div
              className={
                styles.quickActions
              }
            >
              <button
                type="button"
                onClick={
                  handleCreateReport
                }
              >
                <FileBarChart
                  size={17}
                />

                Create Report
              </button>

              <button
                type="button"
                onClick={
                  handleExport
                }
              >
                <Download
                  size={17}
                />

                Export CSV
              </button>

              <button
                type="button"
                onClick={
                  handleAskAI
                }
              >
                <Sparkles
                  size={17}
                />

                Ask LOOP AI
              </button>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}