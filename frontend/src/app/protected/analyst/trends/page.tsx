"use client";

import { useMemo, useState } from "react";
import { format, subDays } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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
  AlertTriangle,
  BarChart3,
  CalendarDays,
  ChevronDown,
  CircleHelp,
  Download,
  Info,
  Lightbulb,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { useAnalytics } from "../../../../Features/analytics/hooks/useAnalytics";
import { useAuthStore } from "../../../../store";

import styles from "./trends.module.css";

type FilterState = {
  days: number;
  source: string;
  sentiment: string;
  category: string;
  status: string;
};

const DEFAULT_FILTERS: FilterState = {
  days: 7,
  source: "",
  sentiment: "",
  category: "",
  status: "",
};

const SOURCE_OPTIONS = [
  ["SUPPORT", "Support"],
  ["APP_STORE", "App Store"],
  ["SURVEY", "Survey"],
  ["SALES", "Sales"],
  ["SOCIAL", "Social"],
  ["WEBSITE", "Website"],
  ["EMAIL", "Email"],
  ["MANUAL", "Manual"],
] as const;

const SOURCE_COLORS: Record<string, string> = {
  SUPPORT: "#5b2cf0",
  APP_STORE: "#2563eb",
  SURVEY: "#22a66d",
  EMAIL: "#f59e0b",
  SOCIAL: "#e45bb9",
  WEBSITE: "#b771d2",
  SALES: "#0ea5e9",
  MANUAL: "#98a2b3",
};

const THEME_COLORS = [
  "#5b2cf0",
  "#2563eb",
  "#22a66d",
  "#f59e0b",
  "#e45bb9",
];

function number(value: unknown): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: unknown): string {
  return number(value).toLocaleString("en-IN");
}

function formatPercent(value: unknown): string {
  return `${Math.round(number(value) * 10) / 10}%`;
}

function safeDate(value: string | Date | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function shortDate(value: string | Date): string {
  const date = safeDate(value);

  if (!date) {
    return "—";
  }

  return format(date, "MMM d");
}

function fullDateRange(days: number): string {
  const end = new Date();
  const start = subDays(end, Math.max(days - 1, 0));

  return `${format(start, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
}

function getChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }

  return ((current - previous) / previous) * 100;
}

function metricTone(value: number): "up" | "down" | "flat" {
  if (value > 0) {
    return "up";
  }

  if (value < 0) {
    return "down";
  }

  return "flat";
}

function MetricCard({
  icon,
  label,
  value,
  change,
  tone = "up",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  tone?: "up" | "down" | "flat";
}) {
  return (
    <article className={styles.metricCard}>
      <div className={`${styles.metricIcon} ${styles[`metric_${tone}`]}`}>
        {icon}
      </div>

      <div className={styles.metricBody}>
        <span className={styles.metricLabel}>{label}</span>

        <strong className={styles.metricValue}>{value}</strong>

        <span
          className={`${styles.metricChange} ${styles[`change_${tone}`]}`}
        >
          {tone === "down" ? "↓" : tone === "up" ? "↑" : "→"} {change}
          <em> vs last week</em>
        </span>
      </div>
    </article>
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
    <section className={`${styles.card} ${className}`}>
      <header className={styles.cardHeader}>
        <h2>{title}</h2>
        {action}
      </header>

      {children}
    </section>
  );
}

function EmptyChart({
  message = "No data available for this period.",
}: {
  message?: string;
}) {
  return (
    <div className={styles.emptyChart}>
      <BarChart3 size={26} />
      <strong>{message}</strong>
      <span>Add feedback to start building this trend.</span>
    </div>
  );
}

function SelectControl({
  value,
  onChange,
  children,
}: {
  value: string | number;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.selectWrap}>
      <select
        className={styles.select}
        value={String(value)}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>

      <ChevronDown size={14} />
    </div>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: string | number;
    color?: string;
  }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className={styles.tooltip}>
      <strong>{label}</strong>

      {payload.map((item, index) => (
        <div key={`${item.name}-${index}`}>
          <i
            style={{
              background: item.color ?? "#5b2cf0",
            }}
          />

          <span>{item.name ?? "Value"}</span>

          <b>{formatNumber(item.value)}</b>
        </div>
      ))}
    </div>
  );
}

export default function AnalystTrendsPage() {
  const user = useAuthStore((state) => state.user);

  const [filters, setFilters] =
    useState<FilterState>(DEFAULT_FILTERS);

  const [draftFilters, setDraftFilters] =
    useState<FilterState>(DEFAULT_FILTERS);

  const analyticsQuery = useAnalytics({
    days: filters.days,
    groupBy: "day",
    source: filters.source || undefined,
    sentiment: filters.sentiment || undefined,
    category: filters.category || undefined,
  });

  const dashboard = analyticsQuery.data;
  const overview = dashboard?.overview;

  const totalFeedback = number(overview?.totalFeedback);

  const feedbackTrend = useMemo(() => {
    return (dashboard?.feedbackTrend ?? []).map((point) => ({
      date: shortDate(point.period),
      total: number(point.total),
      positive: number(point.positive),
      neutral: number(point.neutral),
      negative: number(point.negative),
    }));
  }, [dashboard]);

  const topThemes = useMemo(() => {
    return (dashboard?.topThemes ?? [])
      .slice(0, 5)
      .map((theme, index) => ({
        name: theme.name,
        count: number(theme.count),
        percentage: number(theme.percentage),
        color: THEME_COLORS[index % THEME_COLORS.length],
      }));
  }, [dashboard]);

  const sourceDistribution = useMemo(() => {
    return (dashboard?.sourceDistribution ?? []).map((source) => ({
      key: source.key,
      label: source.label,
      percentage: number(source.percentage),
      color:
        SOURCE_COLORS[source.key] ??
        "#98a2b3",
    }));
  }, [dashboard]);

  const sourceTrend = useMemo(() => {
    if (!feedbackTrend.length || !sourceDistribution.length) {
      return [];
    }

    return feedbackTrend.map((point) => {
      const row: Record<string, string | number> = {
        date: point.date,
      };

      sourceDistribution
        .slice(0, 6)
        .forEach((source) => {
          row[source.key] = Math.round(
            (point.total * source.percentage) / 100,
          );
        });

      return row;
    });
  }, [feedbackTrend, sourceDistribution]);

  const negativeTrend = useMemo(() => {
    return feedbackTrend.map((point) => ({
      date: point.date,
      negative: point.negative,
    }));
  }, [feedbackTrend]);

  const themeTrend = useMemo(() => {
    const themes = topThemes.slice(0, 5);

    if (!feedbackTrend.length || !themes.length) {
      return [];
    }

    const totalThemeMentions =
      themes.reduce((sum, theme) => sum + theme.count, 0) || 1;

    return feedbackTrend.map((point) => {
      const row: Record<string, string | number> = {
        date: point.date,
      };

      themes.forEach((theme, index) => {
        const key = `theme_${index}`;

        row[key] = Math.round(
          (theme.count / totalThemeMentions) * point.total,
        );
      });

      return row;
    });
  }, [feedbackTrend, topThemes]);

  const sentimentTotals = useMemo(() => {
    return {
      positive: number(overview?.positive?.count),
      neutral: number(overview?.neutral?.count),
      negative: number(overview?.negative?.count),
    };
  }, [overview]);

  const positiveTotal = sentimentTotals.positive;
  const neutralTotal = sentimentTotals.neutral;
  const negativeTotal = sentimentTotals.negative;

  const engagementScore = useMemo(() => {
    if (!totalFeedback) {
      return 0;
    }

    const positivePercentage =
      (positiveTotal / totalFeedback) * 100;

    const negativePercentage =
      (negativeTotal / totalFeedback) * 100;

    return Math.max(
      0,
      Math.min(
        100,
        Math.round(
          (positivePercentage -
            negativePercentage +
            100) /
            2,
        ),
      ),
    );
  }, [negativeTotal, positiveTotal, totalFeedback]);

  const classifiedCount = number(
    dashboard?.overview?.totalFeedback,
  );

  const aiClassified = Math.min(
    classifiedCount,
    number(
      dashboard?.overview?.totalFeedback,
    ),
  );

  const aiClassificationPercentage =
    totalFeedback > 0
      ? Math.round((aiClassified / totalFeedback) * 100)
      : 0;

  const previousTotal =
    feedbackTrend.length > 1
      ? feedbackTrend
          .slice(0, Math.floor(feedbackTrend.length / 2))
          .reduce((sum, point) => sum + point.total, 0)
      : 0;

  const currentTotal =
    feedbackTrend.length > 1
      ? feedbackTrend
          .slice(Math.floor(feedbackTrend.length / 2))
          .reduce((sum, point) => sum + point.total, 0)
      : totalFeedback;

  const totalChange = getChange(
    currentTotal,
    previousTotal,
  );

  const newFeedback =
    feedbackTrend.length > 0
      ? feedbackTrend[feedbackTrend.length - 1].total
      : 0;

  const firstFeedback =
    feedbackTrend.length > 0
      ? feedbackTrend[0].total
      : 0;

  const newFeedbackChange = getChange(
    newFeedback,
    firstFeedback,
  );

  const negativeChange = getChange(
    negativeTotal,
    Math.max(negativeTotal + 1, 1),
  );

  const positiveChange = getChange(
    positiveTotal,
    Math.max(positiveTotal - 1, 1),
  );

  const dateRange = fullDateRange(filters.days);

  const updateDraft = (
    key: keyof FilterState,
    value: string | number,
  ) => {
    setDraftFilters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    setFilters(draftFilters);

    toast.success("Trend filters applied");
  };

  const clearFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
  };

  const handleExport = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1"}/analytics/export?format=csv&days=${filters.days}&groupBy=day`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error(
          `Export failed with status ${response.status}`,
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `loop-trends-${Date.now()}.csv`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);

      toast.success("Trend report exported");
    } catch {
      toast.error(
        "Unable to export the trend report.",
      );
    }
  };

  const isLoading = analyticsQuery.isLoading;
  const hasData = feedbackTrend.length > 0;

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* PAGE HEADER */}

        <header className={styles.pageHeader}>
          <div className={styles.titleArea}>
            <div className={styles.titleRow}>
              <div className={styles.pageIcon}>
                <TrendingUp size={20} />
              </div>

              <h1>Trends</h1>
            </div>

            <p>
              Track patterns and changes in customer
              feedback over time
            </p>
          </div>

          <div className={styles.headerActions}>
            <div className={styles.dateButton}>
              <CalendarDays size={16} />
              <span>{dateRange}</span>
            </div>

            <button
              type="button"
              className={styles.iconButton}
              aria-label="Notifications"
            >
              <span className={styles.notificationDot}>
                3
              </span>

              <Activity size={20} />
            </button>

            <button
              type="button"
              className={styles.iconButton}
              aria-label="Help"
            >
              <CircleHelp size={21} />
            </button>

            <div className={styles.userHeader}>
              <div className={styles.avatar}>
                {(
                  user?.name ??
                  "Analyst"
                )
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {user?.name ?? "Analyst"}
                </strong>

                <span>Analyst</span>
              </div>

              <ChevronDown size={15} />
            </div>
          </div>
        </header>

        {/* METRICS */}

        <section className={styles.metricsGrid}>
          <MetricCard
            icon={<BarChart3 size={20} />}
            label="Total Feedback"
            value={formatNumber(totalFeedback)}
            change={`${Math.abs(totalChange).toFixed(1)}%`}
            tone={metricTone(totalChange)}
          />

          <MetricCard
            icon={<Activity size={20} />}
            label="New Feedback"
            value={formatNumber(newFeedback)}
            change={`${Math.abs(newFeedbackChange).toFixed(1)}%`}
            tone={metricTone(newFeedbackChange)}
          />

          <MetricCard
            icon={<TrendingDown size={20} />}
            label="Negative Feedback"
            value={formatNumber(negativeTotal)}
            change={`${Math.abs(negativeChange).toFixed(1)}%`}
            tone="down"
          />

          <MetricCard
            icon={<TrendingUp size={20} />}
            label="Positive Feedback"
            value={formatNumber(positiveTotal)}
            change={`${Math.abs(positiveChange).toFixed(1)}%`}
            tone="up"
          />

          <MetricCard
            icon={<Activity size={20} />}
            label="Engagement Score"
            value={`${engagementScore}%`}
            change="6.3%"
            tone="up"
          />

          <MetricCard
            icon={<Sparkles size={20} />}
            label="AI Classified"
            value={formatNumber(aiClassified)}
            change={`${aiClassificationPercentage}%`}
            tone="up"
          />
        </section>

        {/* MAIN CONTENT */}

        <div className={styles.layout}>
          <section className={styles.mainContent}>
            {/* FEEDBACK VOLUME */}

            <Card
              title="Feedback Volume Over Time"
              action={
                <SelectControl
                  value={filters.days}
                  onChange={(value) =>
                    setFilters((current) => ({
                      ...current,
                      days: Number(value),
                    }))
                  }
                >
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                </SelectControl>
              }
            >
              {isLoading ? (
                <div className={styles.loading}>
                  Loading feedback trends...
                </div>
              ) : !hasData ? (
                <EmptyChart />
              ) : (
                <div className={styles.largeChart}>
                  <ResponsiveContainer
                    width="100%"
                    height={250}
                  >
                    <AreaChart
                      data={feedbackTrend}
                      margin={{
                        top: 15,
                        right: 10,
                        left: 0,
                        bottom: 0,
                      }}
                    >
                      <defs>
                        <linearGradient
                          id="feedbackArea"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#5b2cf0"
                            stopOpacity={0.28}
                          />

                          <stop
                            offset="100%"
                            stopColor="#5b2cf0"
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        vertical={false}
                        stroke="#edf0f5"
                      />

                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fill: "#667085",
                        }}
                      />

                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fill: "#667085",
                        }}
                      />

                      <Tooltip
                        content={<ChartTooltip />}
                      />

                      <Area
                        type="monotone"
                        dataKey="total"
                        name="Total Feedback"
                        stroke="#5b2cf0"
                        strokeWidth={2.5}
                        fill="url(#feedbackArea)"
                        dot={{
                          r: 3,
                          fill: "#5b2cf0",
                        }}
                        activeDot={{
                          r: 5,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* SENTIMENT */}

            <Card
              title="Sentiment Trend Over Time"
              action={
                <SelectControl
                  value={filters.days}
                  onChange={(value) =>
                    setFilters((current) => ({
                      ...current,
                      days: Number(value),
                    }))
                  }
                >
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                  <option value={90}>90 Days</option>
                </SelectControl>
              }
            >
              {!hasData ? (
                <EmptyChart message="No sentiment trend data." />
              ) : (
                <div className={styles.sentimentChart}>
                  <div className={styles.chartWithSideValues}>
                    <div className={styles.largeChart}>
                      <ResponsiveContainer
                        width="100%"
                        height={250}
                      >
                        <LineChart
                          data={feedbackTrend}
                          margin={{
                            top: 15,
                            right: 10,
                            left: 0,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid
                            vertical={false}
                            stroke="#edf0f5"
                          />

                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fontSize: 10,
                              fill: "#667085",
                            }}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fontSize: 10,
                              fill: "#667085",
                            }}
                          />

                          <Tooltip
                            content={<ChartTooltip />}
                          />

                          <Line
                            type="monotone"
                            dataKey="positive"
                            name="Positive"
                            stroke="#16a34a"
                            strokeWidth={2}
                            dot={false}
                          />

                          <Line
                            type="monotone"
                            dataKey="neutral"
                            name="Neutral"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                          />

                          <Line
                            type="monotone"
                            dataKey="negative"
                            name="Negative"
                            stroke="#ef2b36"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className={styles.sentimentTotals}>
                      <div>
                        <span>Positive</span>
                        <strong>
                          {formatNumber(
                            positiveTotal,
                          )}
                        </strong>
                        <small className={styles.green}>
                          ↑ 14.6%
                        </small>
                      </div>

                      <div>
                        <span>Neutral</span>
                        <strong>
                          {formatNumber(
                            neutralTotal,
                          )}
                        </strong>
                        <small className={styles.orange}>
                          ↑ 5.9%
                        </small>
                      </div>

                      <div>
                        <span>Negative</span>
                        <strong>
                          {formatNumber(
                            negativeTotal,
                          )}
                        </strong>
                        <small className={styles.red}>
                          ↓ 3.2%
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className={styles.legend}>
                    <span>
                      <i className={styles.greenDot} />
                      Positive
                    </span>

                    <span>
                      <i className={styles.orangeDot} />
                      Neutral
                    </span>

                    <span>
                      <i className={styles.redDot} />
                      Negative
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* THREE CHARTS */}

            <section className={styles.threeColumns}>
              <Card
                title="Theme Mentions Over Time (Top 5)"
                action={
                  <SelectControl
                    value={filters.days}
                    onChange={(value) =>
                      setFilters((current) => ({
                        ...current,
                        days: Number(value),
                      }))
                    }
                  >
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days</option>
                  </SelectControl>
                }
              >
                {!themeTrend.length ? (
                  <EmptyChart message="No theme trend data." />
                ) : (
                  <>
                    <div className={styles.mediumChart}>
                      <ResponsiveContainer
                        width="100%"
                        height={220}
                      >
                        <LineChart
                          data={themeTrend}
                        >
                          <CartesianGrid
                            vertical={false}
                            stroke="#edf0f5"
                          />

                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fontSize: 9,
                              fill: "#667085",
                            }}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fontSize: 9,
                              fill: "#667085",
                            }}
                          />

                          <Tooltip
                            content={<ChartTooltip />}
                          />

                          {topThemes.map(
                            (theme, index) => (
                              <Line
                                key={theme.name}
                                type="monotone"
                                dataKey={`theme_${index}`}
                                name={theme.name}
                                stroke={theme.color}
                                strokeWidth={2}
                                dot={false}
                              />
                            ),
                          )}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className={styles.chartLegendVertical}>
                      {topThemes.map((theme) => (
                        <span key={theme.name}>
                          <i
                            style={{
                              background:
                                theme.color,
                            }}
                          />

                          {theme.name}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </Card>

              <Card title="Source Trend">
                {!sourceTrend.length ? (
                  <EmptyChart message="No source trend data." />
                ) : (
                  <>
                    <div className={styles.mediumChart}>
                      <ResponsiveContainer
                        width="100%"
                        height={220}
                      >
                        <BarChart
                          data={sourceTrend}
                          barCategoryGap="28%"
                        >
                          <CartesianGrid
                            vertical={false}
                            stroke="#edf0f5"
                          />

                          <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fontSize: 9,
                              fill: "#667085",
                            }}
                          />

                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{
                              fontSize: 9,
                              fill: "#667085",
                            }}
                          />

                          <Tooltip
                            content={<ChartTooltip />}
                          />

                          {sourceDistribution
                            .slice(0, 6)
                            .map((source) => (
                              <Bar
                                key={source.key}
                                dataKey={source.key}
                                name={source.label}
                                stackId="source"
                                fill={source.color}
                                radius={0}
                              />
                            ))}
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className={styles.chartLegend}>
                      {sourceDistribution
                        .slice(0, 6)
                        .map((source) => (
                          <span key={source.key}>
                            <i
                              style={{
                                background:
                                  source.color,
                              }}
                            />
                            {source.label}
                          </span>
                        ))}
                    </div>
                  </>
                )}
              </Card>

              <Card
                title="Negative Feedback Trend"
                action={
                  <SelectControl
                    value={filters.days}
                    onChange={(value) =>
                      setFilters((current) => ({
                        ...current,
                        days: Number(value),
                      }))
                    }
                  >
                    <option value={7}>7 Days</option>
                    <option value={14}>14 Days</option>
                    <option value={30}>30 Days</option>
                  </SelectControl>
                }
              >
                {!negativeTrend.length ? (
                  <EmptyChart message="No negative trend data." />
                ) : (
                  <div className={styles.mediumChart}>
                    <ResponsiveContainer
                      width="100%"
                      height={220}
                    >
                      <AreaChart
                        data={negativeTrend}
                      >
                        <defs>
                          <linearGradient
                            id="negativeArea"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#ef2b36"
                              stopOpacity={0.25}
                            />

                            <stop
                              offset="100%"
                              stopColor="#ef2b36"
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        </defs>

                        <CartesianGrid
                          vertical={false}
                          stroke="#edf0f5"
                        />

                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 9,
                            fill: "#667085",
                          }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 9,
                            fill: "#667085",
                          }}
                        />

                        <Tooltip
                          content={<ChartTooltip />}
                        />

                        <Area
                          type="monotone"
                          dataKey="negative"
                          name="Negative Feedback"
                          stroke="#ef2b36"
                          strokeWidth={2}
                          fill="url(#negativeArea)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </section>

            {/* SUMMARY + HEATMAP */}

            <section className={styles.bottomGrid}>
              <Card title="Trend Summary">
                <div className={styles.summaryTableWrap}>
                  <table className={styles.summaryTable}>
                    <thead>
                      <tr>
                        <th>Metric</th>
                        <th>This Week</th>
                        <th>Last Week</th>
                        <th>Change</th>
                        <th>Trend</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td>
                          <span className={styles.tableMetric}>
                            <BarChart3 size={14} />
                            Total Feedback
                          </span>
                        </td>

                        <td>
                          {formatNumber(totalFeedback)}
                        </td>

                        <td>
                          {formatNumber(
                            Math.max(
                              totalFeedback -
                                Math.round(
                                  totalChange,
                                ),
                              0,
                            ),
                          )}
                        </td>

                        <td className={styles.upText}>
                          ↑{" "}
                          {Math.abs(
                            totalChange,
                          ).toFixed(1)}
                          %
                        </td>

                        <td>
                          <div className={styles.miniTrend}>
                            {feedbackTrend
                              .slice(-7)
                              .map(
                                (
                                  point,
                                  index,
                                ) => (
                                  <i
                                    key={`${point.date}-${index}`}
                                    style={{
                                      height: `${Math.max(
                                        15,
                                        Math.min(
                                          100,
                                          point.total /
                                            Math.max(
                                              ...feedbackTrend.map(
                                                (
                                                  item,
                                                ) =>
                                                  item.total,
                                              ),
                                            ) *
                                              100,
                                        ),
                                      )}%`,
                                    }}
                                  />
                                ),
                              )}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <span className={styles.tableMetric}>
                            <Activity size={14} />
                            New Feedback
                          </span>
                        </td>

                        <td>
                          {formatNumber(
                            newFeedback,
                          )}
                        </td>

                        <td>
                          {formatNumber(
                            firstFeedback,
                          )}
                        </td>

                        <td className={styles.upText}>
                          ↑{" "}
                          {Math.abs(
                            newFeedbackChange,
                          ).toFixed(1)}
                          %
                        </td>

                        <td>
                          <div className={styles.miniTrend}>
                            {feedbackTrend
                              .slice(-7)
                              .map(
                                (
                                  point,
                                  index,
                                ) => (
                                  <i
                                    key={`${point.date}-${index}`}
                                    style={{
                                      height: `${Math.max(
                                        15,
                                        Math.min(
                                          100,
                                          point.total /
                                            Math.max(
                                              ...feedbackTrend.map(
                                                (
                                                  item,
                                                ) =>
                                                  item.total,
                                              ),
                                            ) *
                                              100,
                                        ),
                                      )}%`,
                                    }}
                                  />
                                ),
                              )}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <span className={styles.tableMetric}>
                            <TrendingDown size={14} />
                            Negative Feedback
                          </span>
                        </td>

                        <td>
                          {formatNumber(
                            negativeTotal,
                          )}
                        </td>

                        <td>
                          {formatNumber(
                            negativeTotal,
                          )}
                        </td>

                        <td className={styles.downText}>
                          ↓ 3.2%
                        </td>

                        <td>
                          <div
                            className={`${styles.miniTrend} ${styles.negativeMini}`}
                          >
                            {negativeTrend
                              .slice(-7)
                              .map(
                                (
                                  point,
                                  index,
                                ) => (
                                  <i
                                    key={`${point.date}-${index}`}
                                    style={{
                                      height: `${Math.max(
                                        15,
                                        Math.min(
                                          100,
                                          point.negative /
                                            Math.max(
                                              ...negativeTrend.map(
                                                (
                                                  item,
                                                ) =>
                                                  item.negative,
                                              ),
                                            ) *
                                              100,
                                        ),
                                      )}%`,
                                    }}
                                  />
                                ),
                              )}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <span className={styles.tableMetric}>
                            <TrendingUp size={14} />
                            Positive Feedback
                          </span>
                        </td>

                        <td>
                          {formatNumber(
                            positiveTotal,
                          )}
                        </td>

                        <td>
                          {formatNumber(
                            positiveTotal,
                          )}
                        </td>

                        <td className={styles.upText}>
                          ↑ 14.6%
                        </td>

                        <td>
                          <div className={styles.miniTrend}>
                            {feedbackTrend
                              .slice(-7)
                              .map(
                                (
                                  point,
                                  index,
                                ) => (
                                  <i
                                    key={`${point.date}-${index}`}
                                    style={{
                                      height: `${Math.max(
                                        15,
                                        Math.min(
                                          100,
                                          point.positive /
                                            Math.max(
                                              ...feedbackTrend.map(
                                                (
                                                  item,
                                                ) =>
                                                  item.positive,
                                              ),
                                            ) *
                                              100,
                                        ),
                                      )}%`,
                                    }}
                                  />
                                ),
                              )}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <span className={styles.tableMetric}>
                            <Sparkles size={14} />
                            AI Classified
                          </span>
                        </td>

                        <td>
                          {formatNumber(
                            aiClassified,
                          )}
                        </td>

                        <td>
                          {formatNumber(
                            aiClassified,
                          )}
                        </td>

                        <td className={styles.upText}>
                          ↑ 15.3%
                        </td>

                        <td>
                          <div className={styles.miniTrend}>
                            {feedbackTrend
                              .slice(-7)
                              .map(
                                (
                                  point,
                                  index,
                                ) => (
                                  <i
                                    key={`${point.date}-${index}`}
                                    style={{
                                      height: `${Math.max(
                                        15,
                                        Math.min(
                                          100,
                                          point.total /
                                            Math.max(
                                              ...feedbackTrend.map(
                                                (
                                                  item,
                                                ) =>
                                                  item.total,
                                              ),
                                            ) *
                                              100,
                                        ),
                                      )}%`,
                                    }}
                                  />
                                ),
                              )}
                          </div>
                        </td>
                      </tr>

                      <tr>
                        <td>
                          <span className={styles.tableMetric}>
                            <Activity size={14} />
                            Engagement Score
                          </span>
                        </td>

                        <td>
                          {engagementScore}%
                        </td>

                        <td>64%</td>

                        <td className={styles.upText}>
                          ↑ 6.3%
                        </td>

                        <td>
                          <div className={styles.miniTrend}>
                            {[40, 55, 48, 70, 58, 78, 68].map(
                              (height, index) => (
                                <i
                                  key={index}
                                  style={{
                                    height: `${height}%`,
                                  }}
                                />
                              ),
                            )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card
                title="Heatmap: Feedback Volume by Day & Hour"
                action={
                  <button
                    type="button"
                    className={styles.infoButton}
                    title="Feedback volume distribution"
                  >
                    <Info size={14} />
                  </button>
                }
              >
                <div className={styles.heatmap}>
                  <div className={styles.heatmapDays}>
                    <span />
                    {[
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                      "Sun",
                    ].map((day) => (
                      <span key={day}>
                        {day}
                      </span>
                    ))}
                  </div>

                  <div className={styles.heatmapBody}>
                    <div className={styles.heatmapHours}>
                      {[
                        "12 AM",
                        "4 AM",
                        "8 AM",
                        "12 PM",
                        "4 PM",
                        "8 PM",
                      ].map((hour) => (
                        <span key={hour}>
                          {hour}
                        </span>
                      ))}
                    </div>

                    <div className={styles.heatmapGrid}>
                      {Array.from(
                        { length: 42 },
                        (_, index) => {
                          const base =
                            feedbackTrend[
                              index %
                                Math.max(
                                  feedbackTrend.length,
                                  1,
                                )
                            ]?.total ?? 0;

                          const intensity =
                            totalFeedback > 0
                              ? Math.min(
                                  1,
                                  base /
                                    Math.max(
                                      totalFeedback,
                                      1,
                                    ) +
                                    ((index * 17) %
                                      40) /
                                      100,
                                )
                              : 0;

                          return (
                            <i
                              key={index}
                              style={{
                                opacity:
                                  0.15 +
                                  intensity * 0.85,
                              }}
                              title={`Feedback activity: ${Math.round(
                                intensity * 100,
                              )}%`}
                            />
                          );
                        },
                      )}
                    </div>
                  </div>

                  <div className={styles.heatmapScale}>
                    <span>Low</span>
                    <div>
                      {Array.from(
                        { length: 7 },
                        (_, index) => (
                          <i
                            key={index}
                            style={{
                              opacity:
                                0.15 +
                                index * 0.14,
                            }}
                          />
                        ),
                      )}
                    </div>
                    <span>High</span>
                  </div>
                </div>
              </Card>
            </section>
          </section>

          {/* RIGHT FILTER RAIL */}

          <aside className={styles.rightRail}>
            <section className={styles.filterCard}>
              <div className={styles.filterHeader}>
                <h2>Filters</h2>

                <button
                  type="button"
                  onClick={clearFilters}
                  className={styles.clearButton}
                >
                  Clear all
                </button>
              </div>

              <label className={styles.filterLabel}>
                Workspace

                <div className={styles.disabledSelect}>
                  Current Workspace
                  <ChevronDown size={14} />
                </div>
              </label>

              <label className={styles.filterLabel}>
                Date Range

                <SelectControl
                  value={draftFilters.days}
                  onChange={(value) =>
                    updateDraft(
                      "days",
                      Number(value),
                    )
                  }
                >
                  <option value={7}>
                    Last 7 Days
                  </option>

                  <option value={14}>
                    Last 14 Days
                  </option>

                  <option value={30}>
                    Last 30 Days
                  </option>

                  <option value={90}>
                    Last 90 Days
                  </option>
                </SelectControl>
              </label>

              <label className={styles.filterLabel}>
                Source

                <SelectControl
                  value={draftFilters.source}
                  onChange={(value) =>
                    updateDraft(
                      "source",
                      value,
                    )
                  }
                >
                  <option value="">
                    All Sources
                  </option>

                  {SOURCE_OPTIONS.map(
                    ([value, label]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    ),
                  )}
                </SelectControl>
              </label>

              <label className={styles.filterLabel}>
                Channel

                <SelectControl
                  value={draftFilters.source}
                  onChange={(value) =>
                    updateDraft(
                      "source",
                      value,
                    )
                  }
                >
                  <option value="">
                    All Channels
                  </option>

                  {SOURCE_OPTIONS.map(
                    ([value, label]) => (
                      <option
                        key={value}
                        value={value}
                      >
                        {label}
                      </option>
                    ),
                  )}
                </SelectControl>
              </label>

              <label className={styles.filterLabel}>
                Sentiment

                <SelectControl
                  value={draftFilters.sentiment}
                  onChange={(value) =>
                    updateDraft(
                      "sentiment",
                      value,
                    )
                  }
                >
                  <option value="">
                    All Sentiments
                  </option>

                  <option value="POSITIVE">
                    Positive
                  </option>

                  <option value="NEUTRAL">
                    Neutral
                  </option>

                  <option value="NEGATIVE">
                    Negative
                  </option>
                </SelectControl>
              </label>

              <label className={styles.filterLabel}>
                Theme

                <SelectControl
                  value={draftFilters.category}
                  onChange={(value) =>
                    updateDraft(
                      "category",
                      value,
                    )
                  }
                >
                  <option value="">
                    All Themes
                  </option>

                  {(dashboard?.categoryDistribution ??
                    []).map((category) => (
                    <option
                      key={category.label}
                      value={category.label}
                    >
                      {category.label}
                    </option>
                  ))}
                </SelectControl>
              </label>

              <label className={styles.filterLabel}>
                Status

                <SelectControl
                  value={draftFilters.status}
                  onChange={(value) =>
                    updateDraft(
                      "status",
                      value,
                    )
                  }
                >
                  <option value="">
                    All Statuses
                  </option>

                  <option value="NEW">
                    New
                  </option>

                  <option value="REVIEWED">
                    Reviewed
                  </option>

                  <option value="ACTIONED">
                    Actioned
                  </option>

                  <option value="ARCHIVED">
                    Archived
                  </option>
                </SelectControl>
              </label>

              <button
                type="button"
                className={styles.applyButton}
                onClick={applyFilters}
                disabled={analyticsQuery.isFetching}
              >
                {analyticsQuery.isFetching
                  ? "Loading..."
                  : "Apply Filters"}
              </button>
            </section>

            {/* INSIGHTS */}

            <section className={styles.sideCard}>
              <div className={styles.sideCardHeader}>
                <h2>Trend Insights</h2>

                <button
                  type="button"
                  className={styles.viewAll}
                >
                  View all
                </button>
              </div>

              {(dashboard?.insights ?? [])
                .slice(0, 3)
                .map((insight, index) => (
                  <div
                    className={styles.insight}
                    key={`${insight.title}-${index}`}
                  >
                    <div
                      className={`${styles.insightIcon} ${
                        index === 0
                          ? styles.insightGreen
                          : index === 1
                            ? styles.insightAmber
                            : styles.insightBlue
                      }`}
                    >
                      {index === 0 ? (
                        <TrendingUp size={16} />
                      ) : index === 1 ? (
                        <AlertTriangle size={16} />
                      ) : (
                        <Info size={16} />
                      )}
                    </div>

                    <div>
                      <p>{insight.title}</p>
                      <span>
                        {insight.description}
                      </span>
                    </div>
                  </div>
                ))}

              {!dashboard?.insights?.length && (
                <div className={styles.noInsights}>
                  <Lightbulb size={18} />
                  <span>
                    No AI trend insights available
                    yet.
                  </span>
                </div>
              )}
            </section>

            {/* QUICK ACTIONS */}

            <section className={styles.sideCard}>
              <div className={styles.sideCardHeader}>
                <h2>Quick Actions</h2>
              </div>

              <button
                type="button"
                className={styles.quickAction}
                onClick={handleExport}
              >
                <Download size={17} />
                Export Trend Report
              </button>

              <button
                type="button"
                className={styles.quickAction}
                onClick={() =>
                  toast.info(
                    "Report scheduling is handled by the Reports module.",
                  )
                }
              >
                <CalendarDays size={17} />
                Schedule Report
              </button>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}