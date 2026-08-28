'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Area, AreaChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Bot, FileText, MessageSquare, Plus, Star, Upload, Users,
} from 'lucide-react';

import { useAnalytics, useInboxList, useInboxStatusCount } from '../../../../Features/analytics/hooks/useAnalytics';
import styles from './dashboard.module.css';

const COLORS = ['#5b2cf0', '#2563eb', '#22b573', '#ffae16', '#ef4444', '#94a3b8'];
const PREVIEW_TREND = [420, 330, 355, 610, 290, 475, 390, 670, 600, 900].map((total, index) => ({
  date: `May ${11 + index}`,
  total,
  positive: Math.round(total * 0.41),
  neutral: Math.round(total * 0.4),
  negative: Math.round(total * 0.19),
}));
const PREVIEW_THEMES = [
  ['pricing', 'Pricing', 814, 32], ['bugs', 'Product Bug', 534, 21],
  ['features', 'Feature Request', 458, 18], ['support', 'Customer Support', 356, 14],
  ['others', 'Others', 381, 15],
] as const;
const PREVIEW_SOURCES = [
  ['SUPPORT', 'Support Ticket', 891, 35], ['APP_STORE', 'App Store', 636, 25],
  ['SURVEY', 'Survey', 509, 20], ['WEBSITE', 'Website', 254, 10], ['MANUAL', 'Others', 253, 10],
] as const;
const PREVIEW_RECENT = [
  ['The new update is amazing! Keep up the great work.', 'May 17, 10:24 AM', 'App Store', 'Positive', 'Ava Patel'],
  ['Facing issues while logging in.', 'May 17, 09:42 AM', 'Support Ticket', 'Negative', 'Marcus Lee'],
  ['It would be great to have export to PDF feature.', 'May 16, 08:45 AM', 'Survey', 'Neutral', 'Olivia Chen'],
] as const;

function initials(name: string | null | undefined) {
  return (name ?? 'LOOP User').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function shortDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function DashboardPage() {
  const router = useRouter();
  const analytics = useAnalytics({ days: 7, groupBy: 'day' });
  const recent = useInboxList({ page: 1, limit: 3 });
  const newFeedback = useInboxStatusCount('NEW');
  const dashboard = analytics.data;
  const overview = dashboard?.overview;
  const total = overview?.totalFeedback ?? 0;
  const preview = !analytics.isLoading && total === 0;
  const displayedTotal = preview ? 2543 : total;

  const trend = useMemo(() => {
    const points = dashboard?.feedbackTrend ?? [];
    return points.length ? points.map((point) => ({ date: shortDate(point.period), total: point.total, positive: point.positive, neutral: point.neutral, negative: point.negative })) : PREVIEW_TREND;
  }, [dashboard]);
  const sources = dashboard?.sourceDistribution?.length ? dashboard.sourceDistribution : PREVIEW_SOURCES.map(([key, label, count, percentage]) => ({ key, label, count, percentage }));
  const themes = dashboard?.topThemes?.length ? dashboard.topThemes.slice(0, 5) : PREVIEW_THEMES.map(([id, name, count, percentage]) => ({ id, name, count, percentage }));
  const sentiment = [
    { name: 'Positive', value: preview ? 41 : overview?.positive.percentage ?? 0, color: '#22b573' },
    { name: 'Neutral', value: preview ? 40 : overview?.neutral.percentage ?? 0, color: '#ffae16' },
    { name: 'Negative', value: preview ? 19 : overview?.negative.percentage ?? 0, color: '#ef4444' },
  ];
  const recentItems = recent.data?.items?.length ? recent.data.items : PREVIEW_RECENT.map(([content, createdAt, source, sentiment, customerName], index) => ({ id: `preview-${index}`, content, createdAt, source, sentiment, customerName }));

  const cards = [
    [MessageSquare, 'Total Feedback', displayedTotal.toLocaleString(), '↑ 12.5%', 'purple'],
    [MessageSquare, 'Negative Feedback', `${preview ? 18.6 : overview?.negative.percentage ?? 0}%`, '↓ 3.2%', 'red'],
    [FileText, 'New Feedback', (preview ? 342 : newFeedback.data ?? 0).toLocaleString(), '↑ 8.7%', 'green'],
    [Star, 'Top Theme', preview ? 'Pricing' : overview?.topTheme?.name ?? '—', `${preview ? 32 : overview?.topTheme?.percentage ?? 0}% of total`, 'orange'],
    [Users, 'Active Users', '24', '↑ 9.1%', 'blue'],
  ] as const;

  return (
    <div className={styles.dashboard}>
      <section className={styles.metrics}>
        {cards.map(([Icon, label, value, change, tone]) => <article className={styles.metric} key={label}>
          <i className={styles[tone]}><Icon size={21} /></i>
          <div><span>{label}</span><b>{value}</b><small className={change.startsWith('↓') ? styles.down : ''}>{change} <em>vs last week</em></small></div>
        </article>)}
      </section>

      <section className={styles.topGrid}>
        <section className={styles.card}>
          <header><h2>Feedback Over Time</h2><button>7 Days⌄</button></header>
          <div className={styles.chart}><ResponsiveContainer width="100%" height={245}><AreaChart data={trend}><defs><linearGradient id="feedbackGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#5b2cf0" stopOpacity=".35" /><stop offset="1" stopColor="#5b2cf0" stopOpacity=".02" /></linearGradient></defs><XAxis dataKey="date" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Area dataKey="total" stroke="#5b2cf0" strokeWidth={3} fill="url(#feedbackGradient)" dot={{ r: 4, fill: '#5b2cf0' }} /></AreaChart></ResponsiveContainer></div>
        </section>
        <section className={styles.card}>
          <header><h2>Sentiment Distribution</h2></header>
          <div className={styles.sentiment}><div className={styles.donut}><ResponsiveContainer width="100%" height={245}><PieChart><Pie data={sentiment} dataKey="value" innerRadius={62} outerRadius={91} startAngle={90} endAngle={-270}>{sentiment.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer><strong>{displayedTotal.toLocaleString()}<small>Total</small></strong></div><div className={styles.legend}>{sentiment.map((item) => <p key={item.name}><i style={{ background: item.color }} />{item.name}<b>{item.value}%</b></p>)}</div></div>
        </section>
      </section>

      <section className={styles.middleGrid}>
        <section className={styles.card}><header><h2>Top Themes</h2><button className={styles.link}>View all</button></header><div className={styles.themes}>{themes.map((theme, index) => <p key={theme.id}><i>{index + 1}</i><span>{theme.name}<em><b style={{ width: `${theme.percentage}%` }} /></em></span><strong>{theme.percentage}%</strong></p>)}</div></section>
        <section className={`${styles.card} ${styles.recent}`}><header><h2>Recent Feedback</h2><button className={styles.link} onClick={() => router.push('/protected/admin/inbox')}>View all</button></header><div>{recentItems.map((item) => <article key={item.id}><i>{initials(item.customerName)}</i><p><b>{item.content}</b><span>{item.createdAt} · {item.source.replace('_', ' ')}</span></p><mark className={styles[item.sentiment.toLowerCase()]}>{item.sentiment.toLowerCase()}</mark></article>)}</div></section>
      </section>

      <section className={styles.bottomGrid}>
        <section className={styles.card}><header><h2>Feedback by Source</h2></header><div className={styles.source}><div className={styles.sourceDonut}><ResponsiveContainer width="100%" height={180}><PieChart><Pie data={sources} dataKey="percentage" innerRadius={48} outerRadius={72}>{sources.map((item, index) => <Cell key={item.key} fill={COLORS[index % COLORS.length]} />)}</Pie></PieChart></ResponsiveContainer></div><div className={styles.sourceLegend}>{sources.slice(0, 5).map((item, index) => <p key={item.key}><i style={{ background: COLORS[index % COLORS.length] }} />{item.label}<b>{item.percentage}%</b></p>)}</div></div></section>
        <section className={styles.card}><header><h2>Feedback by Sentiment Over Time</h2><button>7 Days⌄</button></header><div className={styles.chart}><ResponsiveContainer width="100%" height={180}><LineChart data={trend}><XAxis dataKey="date" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} /><Tooltip /><Line dataKey="positive" stroke="#22b573" strokeWidth={2} dot={false} /><Line dataKey="neutral" stroke="#ffae16" strokeWidth={2} dot={false} /><Line dataKey="negative" stroke="#ef4444" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></section>
        <section className={styles.card}><header><h2>Quick Actions</h2></header><div className={styles.actions}><button onClick={() => router.push('/protected/admin/add-feedback')}><Plus />Add Feedback</button><button onClick={() => router.push('/protected/admin/add-feedback')}><Upload />Upload CSV</button><button onClick={() => router.push('/protected/admin/ask-loop')}><Bot />Ask LOOP AI</button><button onClick={() => router.push('/protected/admin/reports')}><FileText />View Reports</button></div></section>
      </section>
    </div>
  )
}
