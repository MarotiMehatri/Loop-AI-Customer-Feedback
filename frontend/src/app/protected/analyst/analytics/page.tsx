"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
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
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Lightbulb,
  MessageSquare,
  Sparkles,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Bot,
  Filter,
} from "lucide-react";

import {
  exportAnalytics,
  type AnalyticsQuery,
} from "../../../../Features/analytics/api/analytics.api";
import { useAnalytics } from "../../../../Features/analytics/hooks/useAnalytics";
import type { AnalyticsInsight } from "../../../../Features/analytics/analytics.types";
import { useAuthStore } from "../../../../store";
import styles from "./analytics.module.css";

const SOURCE_OPTIONS = [
  ["SUPPORT", "Support Ticket"],
  ["APP_STORE", "App Store"],
  ["SURVEY", "Survey"],
  ["SALES", "Sales"],
  ["SOCIAL", "Social Media"],
  ["WEBSITE", "Website"],
  ["EMAIL", "Email"],
  ["MANUAL", "Manual"],
] as const;

const SENTIMENT_OPTIONS = [
  ["POSITIVE", "Positive"],
  ["NEUTRAL", "Neutral"],
  ["NEGATIVE", "Negative"],
] as const;

const SOURCE_COLORS: Record<string, string> = {
  SUPPORT: "#4f22e8",
  APP_STORE: "#2563eb",
  SURVEY: "#20a66a",
  SALES: "#0ea5e9",
  SOCIAL: "#e45bb9",
  WEBSITE: "#a66bd7",
  EMAIL: "#f59e0b",
  MANUAL: "#98a2b3",
};

const SENTIMENT_COLORS = {
  positive: "#16a34a",
  neutral: "#f59e0b",
  negative: "#ef2b36",
};

const THEME_COLORS = ["#5427e8", "#2563eb", "#20a66a", "#f59e0b", "#e45bb9"];

const EMPTY_DISTRIBUTION = [
  { key: "EMPTY", label: "No data", count: 0, percentage: 100 },
];

function number(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString("en-IN");
}

function percent(value: number | null | undefined) {
  return `${Number(value ?? 0)}%`;
}

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : format(date, "MMM d");
}

function changeLabel(value: number | null | undefined) {
  const n = Number(value ?? 0);
  return `${n >= 0 ? "↑" : "↓"} ${Math.abs(n).toFixed(1)}%`;
}

function trendTone(value: number | null | undefined) {
  return Number(value ?? 0) >= 0 ? styles.up : styles.down;
}

function Card({
  title,
  children,
  action,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
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

function MetricCard({
  label,
  value,
  change,
  tone,
  icon,
  negative = false,
}: {
  label: string;
  value: string;
  change: number;
  tone: string;
  icon: React.ReactNode;
  negative?: boolean;
}) {
  return (
    <article className={styles.metricCard}>
      <div className={`${styles.metricIcon} ${styles[tone]}`}>{icon}</div>
      <div className={styles.metricBody}>
        <span>{label}</span>
        <strong>{value}</strong>
        <small className={negative ? styles.down : trendTone(change)}>
          {changeLabel(change)} <em>vs last week</em>
        </small>
      </div>
    </article>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className={styles.emptyState}>
      <BarChart3 size={24} />
      <strong>{label}</strong>
      <span>No matching feedback exists for this period.</span>
    </div>
  );
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: string | number; color?: string }>;
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <strong>{label}</strong>
      {payload.map((item, index) => (
        <div key={`${item.name}-${index}`}>
          <i style={{ background: item.color }} />
          <span>{item.name}</span>
          <b>{item.value}</b>
        </div>
      ))}
    </div>
  );
}

function insightMeta(type: AnalyticsInsight["type"]) {
  if (type === "POSITIVE") return { icon: TrendingUp, className: "green" };
  if (type === "WARNING") return { icon: AlertTriangle, className: "amber" };
  return { icon: Lightbulb, className: "blue" };
}

export default function AnalystAnalyticsPage() {
  const user = useAuthStore((state) => state.user);
  const [filterOpen, setFilterOpen] = useState(false);
  const [days, setDays] = useState(7);
  const [source, setSource] = useState<AnalyticsQuery["source"]>();
  const [sentiment, setSentiment] = useState<AnalyticsQuery["sentiment"]>();
  const [theme, setTheme] = useState<string>();
  const [draftSource, setDraftSource] = useState<AnalyticsQuery["source"]>();
  const [draftSentiment, setDraftSentiment] = useState<AnalyticsQuery["sentiment"]>();
  const [draftTheme, setDraftTheme] = useState<string>();

  const query = useAnalytics({
    days,
    source,
    sentiment,
    theme,
  });

  const dashboard = query.data;
  const overview = dashboard?.overview;
  const positive = overview?.positive ?? { count: 0, percentage: 0 };
  const neutral = overview?.neutral ?? { count: 0, percentage: 0 };
  const negative = overview?.negative ?? { count: 0, percentage: 0 };
  const total = overview?.totalFeedback ?? 0;
  const isEmpty = !query.isLoading && total === 0;

  const trend = dashboard?.feedbackTrend ?? [];
  const sourceDistribution = dashboard?.sourceDistribution?.length
    ? dashboard.sourceDistribution
    : EMPTY_DISTRIBUTION;
  const categories = dashboard?.categoryDistribution ?? [];
  const themes = dashboard?.topThemes ?? [];
  const statusDistribution = dashboard?.statusDistribution ?? [];

  const sentimentData = useMemo(
    () => [
      { name: "Positive", value: positive.count ?? 0, color: SENTIMENT_COLORS.positive },
      { name: "Neutral", value: neutral.count ?? 0, color: SENTIMENT_COLORS.neutral },
      { name: "Negative", value: negative.count ?? 0, color: SENTIMENT_COLORS.negative },
    ],
    [overview],
  );

  const sentimentTrend = useMemo(
    () => trend.map((item) => ({
      date: dateLabel(item.period),
      Positive: item.positive,
      Neutral: item.neutral,
      Negative: item.negative,
    })),
    [trend],
  );

  const feedbackTrend = useMemo(
    () => trend.map((item) => ({ date: dateLabel(item.period), total: item.total })),
    [trend],
  );

  const themeTrend = useMemo(() => {
    const topThemes = themes.slice(0, 5);
    return (dashboard?.themeTrend ?? []).map((point) => {
      const row: Record<string, string | number> = { date: dateLabel(point.period) };
      topThemes.forEach((theme) => {
        row[theme.id] = Number(point.values?.[theme.id] ?? 0);
      });
      return row;
    });
  }, [dashboard?.themeTrend, themes]);

  const dateRange = dashboard?.range
    ? `${format(new Date(dashboard.range.startDate), "MMM d")} – ${format(new Date(dashboard.range.endDate), "MMM d, yyyy")}`
    : "Last 7 days";

  const handleApplyFilters = () => {
    setSource(draftSource);
    setSentiment(draftSentiment);
    setTheme(draftTheme);
    setFilterOpen(false);
  };

  const handleClearFilters = () => {
    setSource(undefined);
    setSentiment(undefined);
    setTheme(undefined);
    setDraftSource(undefined);
    setDraftSentiment(undefined);
    setDraftTheme(undefined);
    setDays(7);
  };

  const handleExport = async () => {
    try {
      const blob = await exportAnalytics({
        days,
        source,
        sentiment,
        theme,
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `loop-analytics-${Date.now()}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Analytics CSV exported successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to export analytics.");
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.titleBlock}>
          <div className={styles.menuPlaceholder} aria-hidden="true">☰</div>
          <div>
            <h1>Analytics <BarChart3 size={20} /></h1>
            <p>Deep insights from your customer feedback</p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.dateButton} type="button">
            {dateRange}
            <CalendarDays size={16} />
          </button>
          <button className={styles.iconButton} type="button" aria-label="Notifications">
            <Bell size={21} />
            {(overview?.unresolved ?? 0) > 0 && <i>{overview?.unresolved}</i>}
          </button>
          <div className={styles.headerUser}>
            <span>{(user?.name ?? "Analyst").slice(0, 1).toUpperCase()}</span>
            <div>
              <b>{user?.name ?? "Analyst"}</b>
              <small>Analyst</small>
            </div>
            <ChevronDown size={15} />
          </div>
        </div>
      </header>

      <div className={styles.contentShell}>
        <div className={styles.dashboard}>
          <section className={styles.metrics}>
            <MetricCard
              label="Total Feedback"
              value={number(overview?.totalFeedback)}
              change={dashboard?.changes?.total ?? 0}
              tone="purple"
              icon={<MessageSquare size={21} />}
            />
            <MetricCard
              label="New Feedback"
              value={number(overview?.newFeedback)}
              change={dashboard?.changes?.newFeedback ?? 0}
              tone="blue"
              icon={<FileText size={21} />}
            />
            <MetricCard
              label="Negative Feedback"
              value={number(overview?.negativeFeedback)}
              change={dashboard?.changes?.negative ?? 0}
              tone="red"
              negative={(dashboard?.changes?.negative ?? 0) > 0}
              icon={<TrendingDown size={21} />}
            />
            <MetricCard
              label="Positive Feedback"
              value={number(overview?.positiveFeedback)}
              change={dashboard?.changes?.positive ?? 0}
              tone="green"
              icon={<CheckCircle2 size={21} />}
            />
            <MetricCard
              label="Pending Review"
              value={number(overview?.pendingReview)}
              change={dashboard?.changes?.pendingReview ?? 0}
              tone="orange"
              icon={<TrendingUp size={21} />}
            />
            <MetricCard
              label="AI Classified"
              value={number(overview?.aiClassified)}
              change={dashboard?.changes?.aiClassified ?? 0}
              tone="indigo"
              icon={<Bot size={21} />}
            />
          </section>

          <section className={styles.workspaceRow}>
            <div className={styles.workspaceName}>
              <span>Workspace</span>
              <strong>{dashboard?.workspaceName ?? "Current workspace"}</strong>
            </div>
            <button
              className={styles.filterToggle}
              type="button"
              onClick={() => setFilterOpen((value) => !value)}
            >
              <Filter size={16} /> Filters
            </button>
          </section>

          {query.isError && (
            <div className={styles.errorBanner}>
              Unable to load analytics. {query.error instanceof Error ? query.error.message : "Please try again."}
              <button type="button" onClick={() => query.refetch()}>Retry</button>
            </div>
          )}

          {query.isLoading ? (
            <div className={styles.loadingGrid}>
              {Array.from({ length: 8 }).map((_, index) => <div className={styles.skeleton} key={index} />)}
            </div>
          ) : (
            <>
              <section className={styles.gridTop}>
                <Card title="Feedback Over Time" action={<span className={styles.period}>{days} Days <ChevronDown size={14} /></span>}>
                  {isEmpty ? <EmptyState label="No feedback trend yet" /> : (
                    <div className={styles.chart}>
                      <ResponsiveContainer width="100%" height={245}>
                        <AreaChart data={feedbackTrend}>
                          <defs>
                            <linearGradient id="analystFeedbackFill" x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#5427e8" stopOpacity={0.30} />
                              <stop offset="100%" stopColor="#5427e8" stopOpacity={0.03} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} stroke="#ececf2" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#667085" }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#667085" }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Area type="monotone" dataKey="total" name="Total Feedback" stroke="#5427e8" strokeWidth={2.5} fill="url(#analystFeedbackFill)" dot={{ r: 3, fill: "#5427e8" }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </Card>

                <Card title="Sentiment Over Time" action={<span className={styles.period}>{days} Days <ChevronDown size={14} /></span>}>
                  {isEmpty ? <EmptyState label="No sentiment trend yet" /> : (
                    <>
                      <div className={styles.legendTop}>
                        <span><i className={styles.positiveDot} />Positive</span>
                        <span><i className={styles.neutralDot} />Neutral</span>
                        <span><i className={styles.negativeDot} />Negative</span>
                      </div>
                      <div className={styles.chart}>
                        <ResponsiveContainer width="100%" height={220}>
                          <LineChart data={sentimentTrend}>
                            <CartesianGrid vertical={false} stroke="#ececf2" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#667085" }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#667085" }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="Positive" stroke={SENTIMENT_COLORS.positive} strokeWidth={2.2} dot={false} />
                            <Line type="monotone" dataKey="Neutral" stroke={SENTIMENT_COLORS.neutral} strokeWidth={2.2} dot={false} />
                            <Line type="monotone" dataKey="Negative" stroke={SENTIMENT_COLORS.negative} strokeWidth={2.2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  )}
                </Card>
              </section>

              <section className={styles.gridMiddle}>
                <Card title="Feedback by Source">
                  {isEmpty ? <EmptyState label="No source data yet" /> : (
                    <div className={styles.donutLayout}>
                      <div className={styles.donutWrap}>
                        <ResponsiveContainer width="100%" height={210}>
                          <PieChart>
                            <Pie data={sourceDistribution} dataKey="count" nameKey="label" innerRadius={55} outerRadius={82} paddingAngle={1}>
                              {sourceDistribution.map((item, index) => (
                                <Cell key={`${item.key ?? item.label ?? "source"}-${index}`} fill={SOURCE_COLORS[item.key] ?? SOURCE_COLORS.MANUAL ?? THEME_COLORS[index % THEME_COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className={styles.sourceLegend}>
                        {sourceDistribution.map((item, index) => (
                          <div key={`${item.key ?? item.label ?? "source"}-${index}`}>
                            <span><i style={{ background: SOURCE_COLORS[item.key] ?? THEME_COLORS[index % THEME_COLORS.length] }} />{item.label}</span>
                            <b>{percent(item.percentage)} <em>({number(item.count)})</em></b>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>

                <Card title="Top Themes" action={<button className={styles.textButton} type="button">View all</button>}>
                  {themes.length === 0 ? <EmptyState label="No themes discovered yet" /> : (
                    <div className={styles.themeList}>
                      <div className={styles.themeHeader}><span>Theme</span><span>Feedback</span><span>%</span></div>
                      {themes.slice(0, 6).map((theme, index) => (
                        <div className={styles.themeRow} key={`${theme.id ?? theme.name ?? "theme"}-${index}`}>
                          <span className={styles.themeName}><i style={{ background: THEME_COLORS[index % THEME_COLORS.length] }} />{theme.name}</span>
                          <b>{number(theme.count)}</b>
                          <div className={styles.themeBar}><i style={{ width: `${Math.min(theme.percentage, 100)}%` }} /></div>
                          <strong>{percent(theme.percentage)}</strong>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card title="Theme Trend (Top 5)" action={<span className={styles.period}>{days} Days <ChevronDown size={14} /></span>}>
                  {themeTrend.length === 0 ? <EmptyState label="No theme trend yet" /> : (
                    <div className={styles.chart}>
                      <ResponsiveContainer width="100%" height={235}>
                        <LineChart data={themeTrend}>
                          <CartesianGrid vertical={false} stroke="#ececf2" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#667085" }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#667085" }} />
                          <Tooltip content={<CustomTooltip />} />
                          {themes.slice(0, 5).map((theme, index) => (
                            <Line key={`${theme.id ?? theme.name ?? "theme-line"}-${index}`} type="monotone" dataKey={theme.id ?? theme.name} name={theme.name} stroke={THEME_COLORS[index]} strokeWidth={2} dot={false} />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </Card>
              </section>

              <section className={styles.gridBottom}>
                <Card title="Feedback by Channel">
                  {isEmpty ? <EmptyState label="No channel data yet" /> : (
                    <div className={styles.channelList}>
                      {sourceDistribution.slice(0, 5).map((item, index) => (
                        <div className={styles.channelRow} key={`${item.key ?? item.label ?? "channel"}-${index}`}>
                          <span>{item.label}</span>
                          <div><i style={{ width: `${Math.min(item.percentage, 100)}%`, background: SOURCE_COLORS[item.key] ?? THEME_COLORS[index % THEME_COLORS.length] }} /></div>
                          <b>{percent(item.percentage)}</b>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card title="Customer Engagement Impact">
                  <div className={styles.impactGrid}>
                    <div><span>Positive share</span><strong className={styles.greenText}>↑ {percent(positive.percentage)}</strong><small>of total feedback</small></div>
                    <div><span>Neutral share</span><strong className={styles.orangeText}>↑ {percent(neutral.percentage)}</strong><small>of total feedback</small></div>
                    <div><span>Negative share</span><strong className={styles.redText}>↓ {percent(negative.percentage)}</strong><small>of total feedback</small></div>
                  </div>
                  <h3>Feedback Status Breakdown</h3>
                  <div className={styles.statusBar}>
                    {statusDistribution.map((status, index) => <i key={`${status.key ?? status.label ?? "status"}-${index}`} style={{ width: `${Math.max(status.percentage, 0.5)}%`, background: THEME_COLORS[index % THEME_COLORS.length] }} />)}
                  </div>
                  <div className={styles.statusLabels}>
                    {statusDistribution.slice(0, 4).map((status, index) => <span key={`${status.key ?? status.label ?? "status"}-${index}`}>{status.label} <b>{number(status.count)}</b></span>)}
                  </div>
                </Card>

                <Card title="AI Classification Overview">
                  <div className={styles.aiOverview}>
                    <div className={styles.aiRing} style={{ "--coverage": `${total ? Math.round(((overview?.aiClassified ?? 0) / total) * 100) : 0}%` } as CSSProperties}>
                      <b>{total ? Math.round(((overview?.aiClassified ?? 0) / total) * 100) : 0}%</b>
                      <span>Coverage</span>
                    </div>
                    <div className={styles.aiStats}>
                      <p>Total Processed <b>{number(total)}</b></p>
                      <p>Auto Classified <b>{number(overview?.aiClassified)}</b></p>
                      <p>Needs Review <b>{number(Math.max(total - (overview?.aiClassified ?? 0), 0))}</b></p>
                    </div>
                  </div>
                  <h3>Most Confident Themes</h3>
                  <div className={styles.confidenceList}>
                    {themes.slice(0, 3).map((theme, index) => <span key={`${theme.id ?? theme.name ?? "confidence-theme"}-${index}`}>{theme.name} <b>{Math.round(theme.avgConfidence * 100)}%</b></span>)}
                  </div>
                </Card>
              </section>

              <section className={styles.bottomCards}>
                <Card title="Feedback by Category" action={<button className={styles.textButton} type="button">View all</button>}>
                  {categories.length === 0 ? <EmptyState label="No category data yet" /> : (
                    <div className={styles.categoryList}>
                      {categories.slice(0, 6).map((item, index) => <div key={`${item.key ?? item.label ?? "category"}-${index}`}><span>{item.label}</span><div><i style={{ width: `${Math.min(item.percentage, 100)}%` }} /></div><b>{percent(item.percentage)}</b></div>)}
                    </div>
                  )}
                </Card>

                <Card title="AI Insights" action={<button className={styles.textButton} type="button">View all</button>}>
                  <div className={styles.insightList}>
                    {(dashboard?.insights ?? []).slice(0, 4).map((insight, index) => {
                      const meta = insightMeta(insight.type);
                      const Icon = meta.icon;
                      return <div className={styles.insight} key={`${insight.id ?? insight.title ?? insight.type ?? "insight"}-${index}`}><span className={styles[meta.className]}><Icon size={17} /></span><p><strong>{insight.title}</strong><small>{insight.description}</small></p></div>;
                    })}
                    {!dashboard?.insights?.length && <EmptyState label="No AI insights yet" />}
                  </div>
                </Card>

                <Card title="Analyst Quick Actions">
                  <div className={styles.quickActions}>
                    <button type="button" onClick={handleExport}><Download size={17} /> Export analytics CSV</button>
                    <button type="button" onClick={() => setFilterOpen(true)}><Filter size={17} /> Refine analysis</button>
                    <button type="button"><Sparkles size={17} /> Ask LOOP AI</button>
                  </div>
                </Card>
              </section>
            </>
          )}
        </div>

        <aside className={`${styles.filterRail} ${filterOpen ? styles.filterRailOpen : ""}`}>
          <div className={styles.filterTitle}><h2>Filters</h2><button type="button" onClick={handleClearFilters}>Clear all</button></div>
          <label>Workspace<select disabled><option>{dashboard?.workspaceName ?? "Current workspace"}</option></select></label>
          <label>Date Range<select value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={7}>Last 7 days</option><option value={14}>Last 14 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select></label>
          <label>Source<select value={draftSource ?? ""} onChange={(event) => setDraftSource((event.target.value || undefined) as AnalyticsQuery["source"])}><option value="">All Sources</option>{SOURCE_OPTIONS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label>Sentiment<select value={draftSentiment ?? ""} onChange={(event) => setDraftSentiment((event.target.value || undefined) as AnalyticsQuery["sentiment"])}><option value="">All Sentiments</option>{SENTIMENT_OPTIONS.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label>Theme<select value={draftTheme ?? ""} onChange={(event) => setDraftTheme(event.target.value || undefined)}><option value="">All Themes</option>{themes.map((theme, index) => <option key={`${theme.id ?? theme.name ?? "theme"}-${index}`} value={theme.name}>{theme.name}</option>)}</select></label>
          <button className={styles.applyButton} type="button" onClick={handleApplyFilters} disabled={query.isFetching}>{query.isFetching ? "Applying…" : "Apply Filters"}</button>

          <section className={styles.sideInsights}>
            <header><h2>AI Insights</h2><button type="button">View all</button></header>
            {(dashboard?.insights ?? []).slice(0, 3).map((insight, index) => {
              const meta = insightMeta(insight.type);
              const Icon = meta.icon;
              return <div className={styles.sideInsight} key={`${insight.id ?? insight.title ?? insight.type ?? "insight"}-${index}`}><span className={styles[meta.className]}><Icon size={17} /></span><p>{insight.title}<small>{insight.description}</small></p></div>;
            })}
          </section>

          <section className={styles.exportCard}>
            <h2>Export Analytics</h2>
            <p>Download your analytics report</p>
            <button type="button" onClick={handleExport}><Download size={16} /> Export CSV</button>
          </section>
        </aside>
      </div>
    </main>
  );
}
