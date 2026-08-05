'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BarChart3, Bot, ChevronDown, CircleHelp, Database, FileText, Inbox, LayoutDashboard, LogOut, Menu, MessageSquare, Network, Sparkles, Tag, TrendingUp, Users } from 'lucide-react';
import { useAnalytics, useClassificationsCount, useInboxList, useInboxStatusCount } from '../../../Features/analytics/hooks/useAnalytics';
import { useAuthStore } from '../../../store';
import styles from './viewer.module.css';

const colors = ['#5d25ed', '#1478ee', '#21ae69', '#f7ad13', '#f04444', '#a7afbd'];
const nav = [[LayoutDashboard, 'Dashboard'], [Inbox, 'Inbox'], [Tag, 'Themes'], [TrendingUp, 'Trends'], [FileText, 'Reports'], [Sparkles, 'Ask LOOP AI'], [Database, 'Data Sources'], [Users, 'Team']] as const;
const metricIcons = [MessageSquare, Inbox, FileText, Users, BarChart3, Network];

function Card({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return <section className={`${styles.card} ${className}`}><header><h2>{title}</h2><button>This Week</button></header>{children}</section>;
}

export default function ViewerPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  // Use the last 30 days so the workspace demo history is visible on first load.
  const analytics = useAnalytics({ days: 30, groupBy: 'day' });
  const feedback = useInboxList({ page: 1, limit: 5 });
  const newCount = useInboxStatusCount('NEW');
  const resolved = useInboxStatusCount('ARCHIVED');
  const classified = useClassificationsCount();
  const data = analytics.data;
  const overview = data?.overview;
  const total = overview?.totalFeedback ?? 0;
  const trend = useMemo(() => (data?.feedbackTrend ?? []).map((p) => ({ date: format(new Date(p.period), 'MMM d'), count: p.total })), [data]);
  const sources = data?.sourceDistribution ?? [];
  const sentiments = [
    { label: 'Positive', value: overview?.positive.count ?? 0, percentage: overview?.positive.percentage ?? 0, color: '#20af6c' },
    { label: 'Neutral', value: overview?.neutral.count ?? 0, percentage: overview?.neutral.percentage ?? 0, color: '#f6ad13' },
    { label: 'Negative', value: overview?.negative.count ?? 0, percentage: overview?.negative.percentage ?? 0, color: '#f04444' },
  ];
  const metrics = [
    ['Total Feedback', total], ['New Feedback', newCount.data ?? 0], ['Resolved Feedback', resolved.data ?? 0], ['Active Users', classified.data ?? 0], ['AI Insights Generated', classified.data ?? 0], ['Workspace Health', `${total ? Math.max(0, 100 - (overview?.negative.percentage ?? 0)).toFixed(1) : '0.0'}%`],
  ];
  const initials = (user?.name ?? 'VR').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const dateLabel = data?.range ? `${format(new Date(data.range.startDate), 'MMM d')} – ${format(new Date(data.range.endDate), 'MMM d, yyyy')}` : 'Last 7 days';

  return <main className={styles.page}>
    <aside className={styles.sidebar}>
      <div className={styles.logo}><span>∞</span> LOOP</div><p>AI Customer-Feedback<br />Intelligence Platform</p>
      <nav>{nav.map(([Icon, label]) => <button key={label} onClick={() => label === 'Inbox' ? router.push('/protected/viewer/inbox') : label === 'Themes' ? router.push('/protected/viewer/themes') : label === 'Trends' ? router.push('/protected/viewer/trends') : label === 'Reports' ? router.push('/protected/viewer/reports') : label === 'Dashboard' ? router.push('/protected/viewer') : undefined} className={label === 'Dashboard' ? styles.active : ''}><Icon size={19} />{label}{label === 'Inbox' && <b>{newCount.data ?? 0}</b>}</button>)}</nav>
      <div className={styles.sideBottom}><small>WORKSPACE</small><button><Network size={18} /> Acme Corp <ChevronDown size={15} /></button><div className={styles.viewer}><i>{initials}</i><span>You are viewing as<strong>Viewer</strong></span><em /></div><button className={styles.help}><CircleHelp size={19} /> Need Help?</button><button><LogOut size={19} /> Logout</button></div>
    </aside>
    <div className={styles.content}>
      <header className={styles.top}><Menu size={28} /><div><h1>Viewer Dashboard <BarChart3 size={19} /></h1><p>Read-only access to feedback insights and reports.</p></div><button className={styles.date}>{dateLabel}</button><CircleHelp size={25} /><button className={styles.role}><i>{initials}</i><span>Viewer<small>Read-only access</small></span><ChevronDown size={15} /></button></header>
      <div className={styles.grid}>
        <section className={styles.metrics}>{metrics.map(([label, value], index) => { const Icon = metricIcons[index]; return <article key={label as string}><i className={`${styles.metricIcon} ${styles[`tone${index}`]}`}><Icon size={20} /></i><div><small>{label}</small><strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong><em>↑ Live workspace data</em></div></article>; })}</section>
        <section className={styles.four}><Card title="Feedback Trend" className={styles.trend}><ResponsiveContainer width="100%" height={190}><AreaChart data={trend}><defs><linearGradient id="trend" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#5d25ed" stopOpacity=".2"/><stop offset="1" stopColor="#5d25ed" stopOpacity="0"/></linearGradient></defs><XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false}/><YAxis fontSize={10} tickLine={false} axisLine={false}/><Tooltip/><Area dataKey="count" stroke="#5d25ed" strokeWidth={2} fill="url(#trend)" /></AreaChart></ResponsiveContainer></Card><Card title="Feedback by Sentiment"><div className={styles.donut}><ResponsiveContainer width="100%" height={175}><PieChart><Pie data={sentiments} dataKey="value" innerRadius={48} outerRadius={70}>{sentiments.map((s) => <Cell key={s.label} fill={s.color}/>)}</Pie></PieChart></ResponsiveContainer><b>{total.toLocaleString()}<small>Total</small></b></div><div className={styles.legend}>{sentiments.map(s => <p key={s.label}><i style={{background:s.color}}/>{s.label}<span>{s.value.toLocaleString()} ({s.percentage}%)</span></p>)}</div></Card><Card title="Feedback by Source"><div className={styles.donut}><ResponsiveContainer width="100%" height={175}><PieChart><Pie data={sources} dataKey="count" innerRadius={48} outerRadius={70}>{sources.map((s, i) => <Cell key={s.key} fill={colors[i % colors.length]}/>)}</Pie></PieChart></ResponsiveContainer><b>{total.toLocaleString()}<small>Total</small></b></div><div className={styles.legend}>{sources.slice(0, 6).map((s,i) => <p key={s.key}><i style={{background:colors[i]}}/>{s.label}<span>{s.count.toLocaleString()} ({s.percentage}%)</span></p>)}</div></Card><Card title="Workspace Overview" className={styles.workspace}><dl><dt>Workspace Name</dt><dd>Acme Corp</dd><dt>Plan</dt><dd>Enterprise</dd><dt>Members</dt><dd>{classified.data ?? 0}</dd><dt>Data Retention</dt><dd>12 Months</dd></dl><a>Learn more about this workspace →</a></Card></section>
        <section className={styles.four}><Card title="Top Themes">{(data?.topThemes ?? []).slice(0,6).map((t,i) => <div className={styles.theme} key={t.id}><b>{i+1}</b><span>{t.name}</span><strong>{t.count.toLocaleString()}</strong><em>{t.percentage}%</em></div>)}{!data?.topThemes.length && <p className={styles.empty}>No themes yet</p>}</Card><Card title="Trends & Spikes">{trend.slice(-4).map((p,i) => <div className={styles.spike} key={p.date}><i>↗</i><span>{p.date}<small>{p.count.toLocaleString()} feedback</small></span><strong>Live</strong></div>)}</Card><Card title="AI Insights (Top)">{(data?.insights ?? []).slice(0,3).map((insight) => <div className={styles.insight} key={insight.title}>{insight.title}<small>{insight.description}</small></div>)}</Card><Card title="Recent Activity">{(feedback.data?.items ?? []).slice(0,4).map(item => <div className={styles.activity} key={item.id}><i>◈</i><span>Feedback received<small>{item.source} · {format(new Date(item.createdAt), 'MMM d')}</small></span></div>)}{!feedback.data?.items.length && <p className={styles.empty}>No recent activity</p>}</Card></section>
        <section className={styles.bottom}><Card title="Recent Feedback" className={styles.feedback}><table><thead><tr><th>ID</th><th>Preview</th><th>Source</th><th>Sentiment</th><th>Date</th></tr></thead><tbody>{(feedback.data?.items ?? []).map(item => <tr key={item.id}><td>{item.id.slice(0,8)}</td><td>{item.content}</td><td>{item.source}</td><td className={item.sentiment === 'POSITIVE' ? styles.positive : styles.negative}>{item.sentiment}</td><td>{format(new Date(item.createdAt), 'MMM d, yyyy')}</td></tr>)}</tbody></table></Card><Card title="Workspace Usage (This Week)" className={styles.usage}>{[['Data Ingested', total], ['Reports Generated', resolved.data ?? 0], ['AI Queries Asked', classified.data ?? 0], ['Active Users', classified.data ?? 0]].map(([l,v],i)=><div key={l as string}><span>{l}</span><b>{typeof v==='number'?v.toLocaleString():v}</b><i><em style={{width:`${Math.min(100, 25+(i*20)+(total?20:0))}%`}}/></i></div>)}</Card></section>
      </div>
    </div>
  </main>;
}
