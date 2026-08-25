'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Archive, Bell, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Database,
  Download, Eye, FileText, Filter, Inbox, LayoutDashboard, MessageSquare,
  MoreHorizontal, Search, Sparkles, Tag, TrendingUp, Users
} from 'lucide-react';
import { useAnalytics, useInboxList, useInboxStatusCount } from '../../../../Features/analytics/hooks/useAnalytics';
import styles from './inbox.module.css';

const nav = [[LayoutDashboard, 'Dashboard'], [Inbox, 'Inbox'], [Tag, 'Themes'], [TrendingUp, 'Trends'], [FileText, 'Reports'], [Sparkles, 'Ask LOOP AI'], [Database, 'Data Sources'], [Archive, 'Exports']] as const;
const sourceColors = ['#6432ef', '#1685ec', '#19af7a', '#f4aa12', '#ed4860', '#8d98a8'];

function statusClass(value: string) {
  const name = value.toLowerCase();
  if (name === 'actioned') return styles.progress;
  if (name === 'archived') return styles.resolved;
  return styles[name] || styles.new;
}

export default function ViewerInboxPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const list = useInboxList({ page, limit: pageSize, search: search || undefined, source: source || undefined, sentiment: sentiment || undefined, status: status || undefined });
  const analytics = useAnalytics({ days: 30, groupBy: 'day' });
  const unread = useInboxStatusCount('NEW');
  const resolved = useInboxStatusCount('ARCHIVED');
  const total = analytics.data?.overview.totalFeedback ?? 0;
  const rows = list.data?.items ?? [];
  const pagination = list.data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const firstItem = pagination?.total ? (page - 1) * pageSize + 1 : 0;
  const lastItem = pagination?.total ? Math.min(page * pageSize, pagination.total) : 0;
  const distribution = analytics.data?.sourceDistribution ?? [];
  const sentiments = [
    ['Positive', analytics.data?.overview.positive.count ?? 0, styles.positive],
    ['Neutral', analytics.data?.overview.neutral.count ?? 0, styles.neutral],
    ['Negative', analytics.data?.overview.negative.count ?? 0, styles.negative]
  ];
  const metrics = [
    [MessageSquare, 'Total Feedback', total, styles.purple, '↑ 18.6% vs last week'],
    [Inbox, 'Unread', unread.data ?? 0, styles.blue, '↑ 12.3% vs last week'],
    [Bell, 'New Feedback', unread.data ?? 0, styles.green, '↑ 24.5% vs last week'],
    [Archive, 'Resolved', resolved.data ?? 0, styles.orange, '↑ 16.3% vs last week'],
    [Database, 'Sources', distribution.length, styles.indigo, 'All connected'],
    [TrendingUp, 'Avg. Response Time', '3.2 hrs', styles.gold, '↓ 8.4% vs last week']
  ] as const;

  return <main className={styles.page}>
    <aside className={styles.sidebar}>
      <div className={styles.logo}><span>∞</span> LOOP</div>
      <p>AI Customer-Feedback<br />Intelligence Platform</p>
      <nav>{nav.map(([Icon, label]) => <button className={label === 'Inbox' ? styles.active : ''} onClick={() => router.push(label === 'Inbox' ? '/protected/viewer/inbox' : label === 'Themes' ? '/protected/viewer/themes' : label === 'Trends' ? '/protected/viewer/trends' : '/protected/viewer')} key={label}><Icon size={18} /><span>{label}</span>{label === 'Inbox' && <b>{unread.data ?? 0}</b>}</button>)}</nav>
      <div className={styles.sidebarBottom}>
        <section className={styles.workspace}><small>Workspace</small><div><Database size={20} /><span><b>Acme Corp</b><em>Enterprise Plan</em></span><ChevronDown size={15} /></div></section>
        <section className={styles.account}><i>VW</i><span><b>Viewer User</b><small>Viewer</small></span><ChevronDown size={15} /></section>
        <button className={styles.help}><CircleHelp size={18} /> Help &amp; Support</button>
      </div>
    </aside>

    <div className={styles.content}>
      <header className={styles.topbar}>
        <div><h1>Inbox <em><Eye size={13} /> Viewer</em></h1><p>Browse and explore all customer feedback collected from different sources.</p></div>
        <button className={styles.company}>Acme Corp <ChevronDown size={15} /></button>
        <button className={styles.date}>May 11 – May 17, 2024 <span>◫</span></button>
        <button className={styles.iconButton}><Download size={18} /></button>
        <div className={styles.userTop}><i>VW</i><span><b>Viewer User</b><small>Viewer</small></span><ChevronDown size={15} /></div>
      </header>

      <div className={styles.dashboard}>
        <section className={styles.metricGrid}>{metrics.map(([Icon, label, value, color, trend]) => <article key={label}><i className={color}><Icon size={20} /></i><span><small>{label}</small><strong>{typeof value === 'number' ? value.toLocaleString() : value}</strong><em>{trend}</em></span></article>)}</section>
        <section className={styles.bodyGrid}>
          <div className={styles.mainColumn}>
            <div className={styles.filters}>
              <label><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search feedback..." /><Search size={16} /></label>
              <select value={source} onChange={e => { setSource(e.target.value); setPage(1); }}><option value="">All Sources</option>{distribution.map(item => <option value={item.key} key={item.key}>{item.label}</option>)}</select>
              <select value={sentiment} onChange={e => { setSentiment(e.target.value); setPage(1); }}><option value="">All Sentiments</option><option value="POSITIVE">Positive</option><option value="NEUTRAL">Neutral</option><option value="NEGATIVE">Negative</option></select>
              <select className={styles.themes}><option>All Themes</option></select>
              <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">All Statuses</option><option value="NEW">New</option><option value="REVIEWED">Reviewed</option><option value="ACTIONED">In Progress</option><option value="ARCHIVED">Resolved</option></select>
              <button className={styles.moreFilters}><Filter size={14} /> More Filters</button>
              <select className={styles.sort}><option>Sort: Newest</option></select>
            </div>
            <section className={styles.tableCard}>
              <table><thead><tr><th><input type="checkbox" aria-label="select all" /></th><th>ID</th><th>Preview</th><th>Source</th><th>Sentiment</th><th>Theme</th><th>Status</th><th>Date ↓</th><th>User</th><th></th></tr></thead>
                <tbody>{rows.map((item, index) => <tr key={item.id}><td><input type="checkbox" aria-label={`select ${item.id}`} /></td><td>FB-{item.id.slice(-5)}</td><td className={styles.preview}><i className={styles.previewIcon}><MessageSquare size={15} /></i><span>{item.content}</span></td><td><mark className={styles.source}>{item.source}</mark></td><td><mark className={`${styles.sentiment} ${styles[item.sentiment.toLowerCase()]}`}>{item.sentiment}</mark></td><td><mark className={styles.theme}>{index % 2 ? 'Product Features' : 'Customer Support'}</mark></td><td><mark className={`${styles.status} ${statusClass(item.status)}`}>{item.status === 'ACTIONED' ? 'In Progress' : item.status}</mark></td><td>{format(new Date(item.createdAt), 'MMM d, yyyy')}<small>{format(new Date(item.createdAt), 'hh:mm a')}</small></td><td>{item.customerName ?? '—'}</td><td><button className={styles.more}><MoreHorizontal size={17} /></button></td></tr>)}</tbody>
              </table>
              {!rows.length && <p className={styles.empty}>No feedback matches these filters.</p>}
              <footer><span>Showing {firstItem} to {lastItem} of {pagination?.total ?? 0} feedback</span><div className={styles.pagination}><button type="button" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={!pagination?.hasPreviousPage} aria-label="Previous page"><ChevronLeft size={15} /></button>{Array.from({ length: Math.min(totalPages, 5) }, (_, index) => index + 1).map(number => number === page ? <b key={number}>{number}</b> : <button type="button" key={number} onClick={() => setPage(number)}>{number}</button>)}{totalPages > 5 && <span>…</span>}<button type="button" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={!pagination?.hasNextPage} aria-label="Next page"><ChevronRight size={15} /></button></div><select><option>10 / page</option></select></footer>
            </section>
          </div>
          <aside className={styles.rail}>
            <section><header><h2>Inbox Overview</h2><button>This Week</button></header>{[['Total Feedback', total], ['Unread Feedback', unread.data ?? 0], ['New Feedback', unread.data ?? 0], ['Resolved Feedback', resolved.data ?? 0], ['Sources Connected', distribution.length], ['Avg. Response Time', '3.2 hrs']].map(([label, value], i) => <p key={label as string}><i className={styles[`overview${i}`]}>{i + 1}</i><span>{label}</span><b>{typeof value === 'number' ? value.toLocaleString() : value}</b></p>)}</section>
            <section><header><h2>Feedback by Source</h2><button>This Week</button></header><div className={styles.sourceInfo}><div className={styles.donut}><b>{total.toLocaleString()}<small>Total</small></b></div><div>{distribution.slice(0, 6).map((item, i) => <p key={item.key}><i style={{ background: sourceColors[i] }} /><span>{item.label}</span><b>{item.count ?? 0}</b></p>)}</div></div></section>
            <section><header><h2>Sentiment Overview</h2><button>This Week</button></header><div className={styles.sentimentCards}>{sentiments.map(([label, value, cls]) => <article className={cls as string} key={label as string}><i>{label === 'Positive' ? '☺' : label === 'Neutral' ? '−' : '☹'}</i><strong>{(value as number).toLocaleString()}</strong><small>{label}<br />(33.2%)</small></article>)}</div></section>
            <section><h2>Quick Filters</h2><div className={styles.quick}><button>New <b>{unread.data ?? 0}</b></button><button>Resolved <b>{resolved.data ?? 0}</b></button><button>In Progress <b>34</b></button><button>High Impact <b>48</b></button><button>Reviewed <b>213</b></button></div><button className={styles.viewFilters}>View All Filters →</button></section>
          </aside>
        </section>
      </div>
    </div>
  </main>;
}
