'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Area, AreaChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Activity, BarChart3, Bell, Bot, CalendarDays, ChevronDown, CircleHelp,
  Download, FileText, Grid2X2, Inbox, Lightbulb, Menu, MessageSquare,
  Settings2, Sparkles, Users,
} from 'lucide-react';

import { apiClient } from '../../../../lib/api/api-client';
import { getErrorMessage } from '../../../../lib/api/api-error';
import {
  useAnalytics,
  useClassificationsCount,
  useInboxStatusCount,
} from '../../../../Features/analytics/hooks/useAnalytics';
import type { AnalyticsInsight } from '../../../../Features/analytics/analytics.types';
import { useAuthStore } from '../../../../store';

import styles from './analytics.module.css';

const THEME_KEYS = ['pricing', 'bugs', 'feature', 'support', 'ux'] as const;

const CHANNEL_COLORS: Record<string, string> = {
  SUPPORT: '#5b2cf0',
  APP_STORE: '#2563eb',
  SURVEY: '#22a66d',
  EMAIL: '#f59e0b',
  SOCIAL: '#e45bb9',
  WEBSITE: '#b771d2',
  SALES: '#0ea5e9',
  MANUAL: '#98a2b3',
};

const THEME_DOTS = ['#5b2cf0', '#2563eb', '#1b9d76', '#f59e0b', '#e45bb9', '#0ea5e9'];

const SOURCE_OPTIONS = [
  ['SUPPORT', 'Support'], ['APP_STORE', 'App Store'], ['SURVEY', 'Survey'],
  ['SALES', 'Sales'], ['SOCIAL', 'Social'], ['WEBSITE', 'Website'],
  ['EMAIL', 'Email'], ['MANUAL', 'Manual'],
] as const;

type DashboardFilters = {
  days: number;
  source: string;
  sentiment: string;
  category: string;
};

const DEFAULT_FILTERS: DashboardFilters = {
  days: 7,
  source: '',
  sentiment: '',
  category: '',
};

const navigation = [
  [Grid2X2, 'Dashboard', '/protected/admin/dashboard'], [Inbox, 'Inbox', '/protected/admin/inbox'], [MessageSquare, 'Add Feedback', '/protected/admin/add-feedback'], [BarChart3, 'Analytics', '/protected/admin/analytics'],
  [Sparkles, 'Ask LOOP AI', '/protected/admin/ask-loop'], [FileText, 'Reports', '/protected/admin/reports'], [Users, 'Team', '/protected/admin/team'], [Settings2, 'Settings', '/protected/admin/settings'],
] as const;

function MetricCard({ icon: Icon, label, value, change, tone, down = false }: { icon: typeof MessageSquare; label: string; value: string; change: string; tone: string; down?: boolean }) {
  return <article className={styles.metricCard}>
    <span className={`${styles.metricIcon} ${styles[tone]} `}><Icon size={20} /></span>
    <div><p>{label}</p><strong>{value}</strong><small className={down ? styles.down : styles.up}>{down ? '↓' : '↑'} {change} <em>vs last week</em></small></div>
  </article>;
}

function Card({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <section className={styles.card}><header><h2>{title}</h2>{action}</header>{children}</section>;
}

function EmptyVisual({ label }: { label: string }) {
  return <div className={styles.emptyVisual}>
    <span><BarChart3 size={22} /></span>
    <strong>{label}</strong>
    <p>Add feedback to start building this view.</p>
  </div>;
}

function SelectButton({ children }: { children: React.ReactNode }) { return <button className={styles.selectButton}>{children}<ChevronDown size={14} /></button>; }

function Insight({ color, icon, text, time }: { color: string; icon: string; text: string; time: string }) {
  return <div className={styles.insight}><i className={styles[color]}>{icon}</i><p>{text}<small>{time}</small></p></div>;
}

const TOOLTIP_STYLE = { background: 'transparent', border: 'none', boxShadow: 'none', padding: 0, outline: 'none' };

interface ChartTooltipEntry {
  name?: string;
  dataKey?: string | number;
  value?: string | number;
  color?: string;
  stroke?: string;
  fill?: string;
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: ChartTooltipEntry[]; label?: string | number }) {
  if (!active || !payload || payload.length === 0) return null;
  try {
    return (
      <div className={styles.tooltip}>
        {label != null && <b>{label}</b>}
        {payload.map((entry, index) => (
          <p key={`${entry.name ?? entry.dataKey}-${index}`}>
            <i style={{ background: entry.color ?? entry.stroke ?? entry.fill ?? '#5b2cf0' }} />
            {entry.name}
            <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  } catch (err) {
    // Defensive: sometimes third-party libs may pass unexpected values (e.g., Event objects).
    // Log and avoid crashing the whole page.
    console.error('ChartTooltip render error', err, payload);
    return null;
  }
}

function shortDate(iso: string): string {
  return format(new Date(iso), 'MMM d');
}

function trendChange(series: number[]): string {
  if (series.length < 2) return '0%';
  const mid = Math.floor(series.length / 2);
  const previous = series.slice(0, mid).reduce((a, b) => a + b, 0);
  const current = series.slice(mid).reduce((a, b) => a + b, 0);
  if (previous === 0) return `${current > 0 ? 100 : 0}%`;
  return `${Math.round((Math.abs(current - previous) / previous) * 1000) / 10}%`;
}

function insightColor(type: AnalyticsInsight['type']): { color: string; icon: string } {
  if (type === 'POSITIVE') return { color: 'green', icon: '↗' };
  if (type === 'WARNING') return { color: 'amber', icon: '!' };
  return { color: 'blue', icon: 'i' };
}

export default function AnalyticsPage({ view = 'analytics' }: { view?: 'analytics' | 'dashboard' | 'inbox' | 'viewer' }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isViewer = view === 'viewer';
  const pageTitle = isViewer ? 'Viewer Dashboard' : view === 'dashboard' ? 'Dashboard 👋' : view === 'inbox' ? 'Inbox' : 'Analytics';
  const subtitle = isViewer ? 'Read-only overview of your customer feedback' : view === 'dashboard' ? `Welcome back, ${user?.name ?? 'there'}! 👋` : view === 'inbox' ? 'Review and manage customer feedback' : 'Deep insights from customer feedback';
  const visibleNavigation = isViewer
    ? navigation.filter(([, label]) => label === 'Dashboard')
    : navigation;
  const userInitials = (user?.name ?? 'LOOP').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const userRole = user?.role ? `${user.role[0]}${user.role.slice(1).toLowerCase()}` : 'Viewer';

  useEffect(() => { setMounted(true); }, []);

  const analyticsQuery = useAnalytics({
    days: appliedFilters.days,
    groupBy: 'day',
    source: appliedFilters.source || undefined,
    sentiment: appliedFilters.sentiment || undefined,
    category: appliedFilters.category || undefined,
  });
  const newFeedbackQuery = useInboxStatusCount('NEW');
  const reviewedQuery = useInboxStatusCount('REVIEWED');
  const actionedQuery = useInboxStatusCount('ACTIONED');
  const archivedQuery = useInboxStatusCount('ARCHIVED');
  const classifiedQuery = useClassificationsCount();

  // Never replace an empty response with sample values: viewers must see their
  // workspace's real data, including a legitimate zero-feedback state.
  const dashboard = analyticsQuery.data;
  const overview = dashboard?.overview;
  const total = overview?.totalFeedback ?? 0;
  const isEmpty = !analyticsQuery.isLoading && total === 0;

  const feedbackTrend = useMemo(
    () => (dashboard?.feedbackTrend ?? []).map((point) => ({ date: shortDate(point.period), total: point.total })),
    [dashboard],
  );

  const sentimentTrend = useMemo(
    () => (dashboard?.feedbackTrend ?? []).map((point) => ({
      date: shortDate(point.period),
      positive: point.positive,
      neutral: point.neutral,
      negative: point.negative,
    })),
    [dashboard],
  );

  const themeTrend = useMemo(() => {
    const trend = dashboard?.feedbackTrend ?? [];
    const top = (dashboard?.topThemes ?? []).slice(0, 5);
    const totalSum = trend.reduce((sum, point) => sum + point.total, 0) || 1;
    return trend.map((point) => {
      const row: Record<string, string | number> = { date: shortDate(point.period) };
      top.forEach((theme, index) => {
        row[THEME_KEYS[index] ?? 'ux'] = Math.round((theme.count * point.total) / totalSum);
      });
      return row;
    });
  }, [dashboard]);

  const sources = useMemo(
    () => (dashboard?.sourceDistribution ?? []).map((source) => ({
      label: source.label,
      value: source.percentage,
      color: CHANNEL_COLORS[source.key] ?? '#98a2b3',
    })),
    [dashboard],
  );

  const themes = useMemo(
    () => (dashboard?.topThemes ?? []).map((theme) => [theme.name, theme.count, theme.percentage] as const),
    [dashboard],
  );

  const themeOptions = useMemo(
    () => (dashboard?.categoryDistribution ?? []).map((category) => category.label),
    [dashboard],
  );

  const channels = useMemo(
    () => (dashboard?.sourceDistribution ?? []).slice(0, 5).map((source) => [source.key, source.label, source.percentage] as const),
    [dashboard],
  );

  const statuses = useMemo(() => [
    ['New', newFeedbackQuery.data ?? 0],
    ['Reviewed', reviewedQuery.data ?? 0],
    ['In progress', actionedQuery.data ?? 0],
    ['Closed', archivedQuery.data ?? 0],
  ] as const, [newFeedbackQuery.data, reviewedQuery.data, actionedQuery.data, archivedQuery.data]);

  const statusTotal = statuses.reduce((sum, [, count]) => sum + (count as number), 0) || 1;

  const sentimentDonut = useMemo(() => [
    { value: overview?.positive.percentage ?? 0 },
    { value: overview?.neutral.percentage ?? 0 },
    { value: overview?.negative.percentage ?? 0 },
  ], [overview]);

  const sentimentLegend = useMemo(() => [
    ['Positive', `${overview?.positive.percentage ?? 0}%`, '#16a34a'],
    ['Neutral', `${overview?.neutral.percentage ?? 0}%`, '#f59e0b'],
    ['Negative', `${overview?.negative.percentage ?? 0}%`, '#ef2b36'],
  ] as const, [overview]);

  const aiClassified = classifiedQuery.data ?? 0;
  const accuracy = total > 0 ? Math.round((aiClassified / total) * 100) : 0;
  const needsReview = Math.max(total - aiClassified, 0);

  const insights = useMemo(
    () => (dashboard?.insights ?? []).slice(0, 3).map((insight) => {
      const meta = insightColor(insight.type);
      return { ...meta, text: insight.title, time: insight.description };
    }),
    [dashboard],
  );

  const totals = useMemo(() => (dashboard?.feedbackTrend ?? []).map((point) => point.total), [dashboard]);

  const feedbackOverTimeCard = (
    <Card title="Feedback over time" action={<SelectButton>{appliedFilters.days} days</SelectButton>}>
      {isEmpty ? <EmptyVisual label="No feedback trend yet" /> : <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={feedbackTrend}>
            <defs>
              <linearGradient id="feedbackFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#5b2cf0" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#5b2cf0" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#ebeaf1" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#667085' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#667085' }} />
            <Tooltip content={<ChartTooltip />} contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(91,44,240,0.06)' }} />
            <Area type="monotone" dataKey="total" stroke="#5b2cf0" strokeWidth={2.4} fill="url(#feedbackFill)" dot={{ r: 3, fill: '#5b2cf0' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>}
    </Card>
  );

  const sentimentDistributionCard = (
    <Card title="Sentiment distribution">
      <div className={styles.donutContent}>
        <div className={styles.donut}>
          <ResponsiveContainer width="100%" height={190}>
            <PieChart>
              <Pie data={sentimentDonut} dataKey="value" innerRadius={56} outerRadius={79} startAngle={90} endAngle={-270}>
                {['#16a34a', '#f59e0b', '#ef2b36'].map((color) => <Cell key={color} fill={color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div>
            <b>{total.toLocaleString()}</b>
            <span>Total</span>
          </div>
        </div>
        <div className={styles.sentimentLegend}>
          {sentimentLegend.map(([label, value, color]) => (
            <p key={label}>
              <i style={{ backgroundColor: color }} />
              {label}
              <b>{value}</b>
            </p>
          ))}
        </div>
      </div>
    </Card>
  );

  const sentimentOverTimeCard = (
    <Card title="Sentiment over time" action={<SelectButton>{appliedFilters.days} days</SelectButton>}>
      {isEmpty ? <EmptyVisual label="No sentiment data yet" /> : <><div className={styles.chart}>
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={sentimentTrend}>
            <CartesianGrid vertical={false} stroke="#ebeaf1" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#667085' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#667085' }} />
            <Tooltip content={<ChartTooltip />} contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(91,44,240,0.06)' }} />
            <Line type="monotone" dataKey="positive" stroke="#16a34a" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="neutral" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="negative" stroke="#ef2b36" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className={styles.chartLegend}>
        <span className={styles.positiveDot} />Positive <span className={styles.neutralDot} />Neutral <span className={styles.negativeDot} />Negative
      </div></>}
    </Card>
  );

  const feedbackBySourceCard = (
    <Card title="Feedback by source">
      {isEmpty ? <EmptyVisual label="No source data yet" /> : <div className={styles.sourceContent}>
        <div className={styles.sourceDonut}>
          <ResponsiveContainer width="100%" height={174}>
            <PieChart>
              <Pie data={sources} dataKey="value" innerRadius={45} outerRadius={68}>
                {sources.map((source) => <Cell key={source.label} fill={source.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.sourceList}>
          {sources.map((source) => (
            <p key={source.label}>
              <i style={{ backgroundColor: source.color }} />
              {source.label}
              <b>{source.value}%</b>
            </p>
          ))}
        </div>
      </div>}
    </Card>
  );

  const topThemesCard = (
    <Card title="Top themes" action={<button className={styles.textButton}>View all</button>}>
      {isEmpty ? <EmptyVisual label="No themes discovered yet" /> : <><div className={styles.themeHeader}><span>Theme</span><span>Feedback</span><span>%</span></div>
      <div className={styles.themeList}>
        {themes.map(([label, count, percent], index) => (
          <div key={label}>
            <i className={styles.themeDot} style={{ background: THEME_DOTS[index % THEME_DOTS.length] }} />
            <span>{label}</span>
            <b>{count}</b>
            <i className={styles.themeBar}><em style={{ width: `${percent}%` }} /></i>
            <strong>{percent}%</strong>
          </div>
        ))}
      </div></>}
    </Card>
  );

  const themeTrendCard = (
    <Card title="Theme trend (top 5)" action={<SelectButton>{appliedFilters.days} days</SelectButton>}>
      {isEmpty ? <EmptyVisual label="No theme trend yet" /> : <div className={styles.chart}>
        <ResponsiveContainer width="100%" height={190}>
          <LineChart data={themeTrend}>
            <CartesianGrid vertical={false} stroke="#ebeaf1" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#667085' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#667085' }} />
            <Tooltip content={<ChartTooltip />} contentStyle={TOOLTIP_STYLE} cursor={{ fill: 'rgba(91,44,240,0.06)' }} />
            <Line type="monotone" dataKey="pricing" stroke="#5b2cf0" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="bugs" stroke="#2563eb" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="feature" stroke="#1b9d76" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="support" stroke="#f59e0b" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ux" stroke="#e45bb9" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>}
    </Card>
  );

  const feedbackByChannelCard = (
    <Card title="Feedback by channel">
      {isEmpty ? <EmptyVisual label="No channel data yet" /> : <div className={styles.channelList}>
        {channels.map(([key, label, value]) => (
          <div key={label}>
            <span><i className={styles.channelDot} style={{ background: CHANNEL_COLORS[key] ?? '#98a2b3' }} />{label}</span>
            <i className={styles.channelTrack}><b style={{ width: `${value}%`, background: CHANNEL_COLORS[key] ?? '#5b2cf0' }} /></i>
            <strong>{value}%</strong>
          </div>
        ))}
      </div>}
    </Card>
  );

  const engagementImpactCard = (
    <Card title="Customer engagement impact">
      <div className={styles.impact}>
        <div><span>✦ Positive share</span><b>↑ {overview?.positive.percentage ?? 0}%</b><small>of total feedback</small></div>
        <div><span>⌁ Neutral share</span><b>↑ {overview?.neutral.percentage ?? 0}%</b><small>of total feedback</small></div>
        <div><span>↗ Negative share</span><b className={styles.down}>↓ {overview?.negative.percentage ?? 0}%</b><small>of total feedback</small></div>
      </div>
      <h3>Feedback status breakdown</h3>
      <div className={styles.statusBar}>
        {statuses.map(([label, count]) => (
          <i key={label} style={{ width: `${Math.max(((count as number) / statusTotal) * 100, 0.5)}%` }} />
        ))}
      </div>
      <div className={styles.statusLabels}>
        {statuses.map(([label, count]) => (
          <span key={label}>{label} <b>{count}</b></span>
        ))}
      </div>
    </Card>
  );

  const aiOverviewCard = (
    <Card title="AI classification overview">
      <div className={styles.aiContent}>
        <div className={styles.accuracy}><b>{accuracy}%</b><span>Accuracy</span></div>
        <div>
          <p>Total processed <b>{total.toLocaleString()}</b></p>
          <p>Auto classified <b>{aiClassified.toLocaleString()} ({accuracy}%)</b></p>
          <p>Needs review <b>{needsReview.toLocaleString()} ({total > 0 ? Math.round((needsReview / total) * 100) : 0}%)</b></p>
        </div>
      </div>
      <h3>Most confident themes</h3>
      <div className={styles.confidence}>
        {(dashboard?.topThemes ?? []).slice(0, 3).map((theme) => (
          <span key={theme.id}>{theme.name} <b>{Math.round(theme.percentage)}%</b></span>
        ))}
      </div>
    </Card>
  );

  const tabContent: Record<string, React.ReactNode> = {
    Overview: (
      <>
        <section className={styles.gridTop}>{feedbackOverTimeCard}{sentimentOverTimeCard}</section>
        <section className={styles.gridMiddle}>{feedbackBySourceCard}{topThemesCard}{themeTrendCard}</section>
        <section className={styles.gridBottom}>{feedbackByChannelCard}{engagementImpactCard}{aiOverviewCard}</section>
      </>
    ),
    Trends: (
      <>
        <section className={styles.gridTop}>{feedbackOverTimeCard}{sentimentOverTimeCard}</section>
        <section className={styles.gridBottom}>{themeTrendCard}</section>
      </>
    ),
    Themes: (
      <section className={styles.gridMiddle}>{topThemesCard}{themeTrendCard}</section>
    ),
    Sources: (
      <section className={styles.gridMiddle}>{feedbackBySourceCard}{feedbackByChannelCard}</section>
    ),
    Sentiment: (
      <>
        <section className={styles.gridTop}>{sentimentDistributionCard}{sentimentOverTimeCard}</section>
        <section className={styles.gridBottom}>{engagementImpactCard}</section>
      </>
    ),
    Performance: (
      <section className={styles.gridTop}>{aiOverviewCard}{engagementImpactCard}</section>
    ),
  };

  const dateRange = dashboard?.range
    ? `${shortDate(dashboard.range.startDate)} – ${shortDate(dashboard.range.endDate)}, ${format(new Date(dashboard.range.endDate), 'yyyy')}`
    : 'This week';

  const updateDraftFilter = <Key extends keyof DashboardFilters>(key: Key, value: DashboardFilters[Key]) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  const handleExport = async () => {
    try {
      const response = await apiClient.get('/analytics/export', {
        params: { format: 'csv', days: 7, groupBy: 'day' },
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([response.data as BlobPart]));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `analytics-${Date.now()}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return <main className={styles.page}>
    <aside className={styles.sidebar}>
      <div className={styles.logo}><span>∞</span> LOOP</div>
      <p className={styles.tagline}>AI Customer Feedback<br />Intelligence Platform</p>
      <nav>{visibleNavigation.map(([Icon, label, href]) => <button key={label} onClick={() => router.push(isViewer ? '/protected/viewer' : href)} className={label.toLowerCase() === view || (view === 'analytics' && label === 'Analytics') || (isViewer && label === 'Dashboard') ? styles.activeNav : ''}><Icon size={19} /> <span>{label}</span></button>)}</nav>
      <div className={styles.sidebarFooter}>
        <small>Current workspace</small><button className={styles.workspace}>Acme Corp <ChevronDown size={15} /></button>
        <div className={styles.userMini}><span>{userInitials}</span><div><b>{user?.name ?? 'LOOP User'}</b><small>{userRole}</small></div><ChevronDown size={14} /></div>
        <button><CircleHelp size={19} /><span>Help & support</span></button>
      </div>
    </aside>

    <div className={styles.main}>
      <header className={styles.topbar}>
        <button className={styles.menuButton} aria-label="Open navigation"><Menu size={25} /></button>
        <div><h1>{pageTitle} <BarChart3 size={20} /></h1><p>{subtitle}</p></div>
        <div className={styles.headerActions}><button className={styles.dateButton}>{dateRange} <CalendarDays size={16} /></button><button className={styles.iconButton}><Bell size={21} /><i>{overview?.unresolved ?? 0}</i></button><button className={styles.help}><CircleHelp size={22} /></button><div className={styles.headerUser}><span>{userInitials}</span><div><b>{user?.name ?? 'LOOP User'}</b><small>{isViewer ? 'Read-only access' : userRole}</small></div><ChevronDown size={15} /></div></div>
      </header>

      <div className={styles.body}>
        <div className={styles.dashboard}>
          <section className={styles.metrics}>
            <MetricCard icon={MessageSquare} label="Total feedback" value={total.toLocaleString()} change={trendChange(totals)} tone="purple" />
            <MetricCard icon={Activity} label={view === 'dashboard' ? "Negative feedback" : "Positive"} value={view === 'dashboard' ? `${overview?.negative.percentage ?? 0}%` : `${overview?.positive.count ?? 0} (${overview?.positive.percentage ?? 0}%)`} change={view === 'dashboard' ? "3.2%" : trendChange(totals)} tone={view === 'dashboard' ? "red" : "green"} down={view === 'dashboard'} />
            <MetricCard icon={FileText} label={view === 'dashboard' ? "New feedback" : "Neutral"} value={view === 'dashboard' ? (newFeedbackQuery.data ?? 0).toLocaleString() : `${overview?.neutral.count ?? 0} (${overview?.neutral.percentage ?? 0}%)`} change={view === 'dashboard' ? "8.7%" : "0%"} tone={view === 'dashboard' ? "green" : "orange"} />
            <MetricCard icon={Lightbulb} label={view === 'dashboard' ? "Top theme" : "Negative"} value={view === 'dashboard' ? (themes[0]?.[0] ?? '—') : `${overview?.negative.count ?? 0} (${overview?.negative.percentage ?? 0}%)`} change={view === 'dashboard' ? `${themes[0]?.[2] ?? 0}% of total` : "3.2%"} tone={view === 'dashboard' ? "orange" : "red"} down={view !== 'dashboard'} />
            <MetricCard icon={Lightbulb} label="Top theme" value={themes[0]?.[0] ?? '—'} change={`${themes[0]?.[2] ?? 0}% of total`} tone="orange" />
            <MetricCard icon={Users} label={view === 'dashboard' ? "Active users" : "AI classified"} value={view === 'dashboard' ? "24" : aiClassified.toLocaleString()} change={view === 'dashboard' ? "9.1%" : trendChange(totals)} tone="blue" />
          </section>

          {isEmpty && <section className={styles.emptyDashboard}>
            <div><MessageSquare size={22} /><div><h2>No feedback yet</h2><p>Add feedback or import a CSV to populate your dashboard.</p></div></div>
            {!isViewer && <button onClick={() => router.push('/protected/admin/add-feedback')}>Add feedback</button>}
          </section>}

          {mounted && (
            <nav className={styles.analyticsTabs} aria-label="Analytics sections">
              {['Overview', 'Trends', 'Themes', 'Sources', 'Sentiment', 'Performance'].map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? styles.activeTab : ''}>{tab}</button>)}
            </nav>
          )}

          <div>
            {Object.entries(tabContent).map(([tab, content]) => (
              <div key={tab} className={activeTab === tab ? styles.tabPanel : styles.tabPanelHidden}>{content}</div>
            ))}
          </div>
        </div>

        <aside className={`${styles.rail} ${filterOpen ? styles.open : ''}`}>
          <div className={styles.filterTitle}><h2>Filters</h2><button onClick={clearFilters}>Clear all</button></div>
          <label>Workspace<select className={styles.filterSelect} value="current" disabled><option value="current">Current workspace</option></select></label>
          <label>Date range<select className={styles.filterSelect} value={draftFilters.days} onChange={(event) => updateDraftFilter('days', Number(event.target.value))}><option value={7}>Last 7 days</option><option value={14}>Last 14 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select></label>
          <label>Source<select className={styles.filterSelect} value={draftFilters.source} onChange={(event) => updateDraftFilter('source', event.target.value)}><option value="">All sources</option>{SOURCE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Channel<select className={styles.filterSelect} value={draftFilters.source} onChange={(event) => updateDraftFilter('source', event.target.value)}><option value="">All channels</option>{SOURCE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label>Sentiment<select className={styles.filterSelect} value={draftFilters.sentiment} onChange={(event) => updateDraftFilter('sentiment', event.target.value)}><option value="">All sentiments</option><option value="POSITIVE">Positive</option><option value="NEUTRAL">Neutral</option><option value="NEGATIVE">Negative</option></select></label>
          <label>Theme<select className={styles.filterSelect} value={draftFilters.category} onChange={(event) => updateDraftFilter('category', event.target.value)}><option value="">All themes</option>{themeOptions.map((theme) => <option key={theme} value={theme}>{theme}</option>)}</select></label>
          <button className={styles.apply} onClick={applyFilters} disabled={analyticsQuery.isFetching}> {analyticsQuery.isFetching ? 'Applying…' : 'Apply filters'}</button>
          <section className={styles.insights}><header><h2>AI insights</h2><button className={styles.textButton}>View all</button></header>{insights.map((insight) => <Insight key={insight.text} color={insight.color} icon={insight.icon} text={insight.text} time={insight.time} />)}</section>
          {!isViewer && <section className={styles.export}><h2>Export analytics</h2><p>Download your analytics report</p><button onClick={handleExport}><Download size={16} /> Export CSV</button></section>}
        </aside>
      </div>
      <button className={styles.filterToggle} onClick={() => setFilterOpen(!filterOpen)}>{filterOpen ? 'Close filters' : 'Filters'}</button>
    </div>
  </main>;
}
