'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  BarChart3, Bell, CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Download, FileText, Grid2X2, Inbox, Lightbulb, Menu,
  MessageSquare, Search, Settings2, Sparkles, Users,
} from 'lucide-react';

import { useInboxList, useInboxStatusCount, useInboxSummary } from '../../../../Features/analytics/hooks/useAnalytics';
import type { FeedbackChannel, FeedbackStatus, Sentiment } from '../../../../Features/analytics/analytics.types';

import shell from '../analytics/analytics.module.css';
import styles from './inbox.module.css';

const navigation = [
  [Grid2X2, 'Dashboard', '/protected/admin/dashboard'], [Inbox, 'Inbox', '/protected/admin/inbox'], [BarChart3, 'Analytics', '/protected/admin/analytics'], [Settings2, 'Themes', '/protected/admin/themes'],
  [FileText, 'Reports', '/protected/admin/reports'], [Sparkles, 'Ask LOOP AI', '/protected/admin/ask-loop'], [Users, 'Data sources', '/protected/admin/add-feedback'], [Download, 'Exports', '/protected/admin/reports'],
] as const;

const SENTIMENT_STYLE: Record<Sentiment, { className: string; label: string }> = {
  POSITIVE: { className: 'positive', label: 'Positive' },
  NEUTRAL: { className: 'neutral', label: 'Neutral' },
  NEGATIVE: { className: 'negative', label: 'Negative' },
};

const STATUS_STYLE: Record<FeedbackStatus, { className: string; label: string }> = {
  NEW: { className: 'new', label: 'New' },
  REVIEWED: { className: 'reviewed', label: 'Reviewed' },
  ACTIONED: { className: 'actioned', label: 'Actioned' },
  ARCHIVED: { className: 'archived', label: 'Archived' },
};

const CHANNEL_STYLE: Record<FeedbackChannel, { className: string; label: string }> = {
  SUPPORT: { className: 'support', label: 'Support' },
  APP_STORE: { className: 'appStore', label: 'App store' },
  SURVEY: { className: 'survey', label: 'Survey' },
  SALES: { className: 'sales', label: 'Sales' },
  SOCIAL: { className: 'social', label: 'Social' },
  WEBSITE: { className: 'website', label: 'Website' },
  EMAIL: { className: 'email', label: 'Email' },
  MANUAL: { className: 'manual', label: 'Manual' },
};

function Badge({ value }: { value: Sentiment | FeedbackStatus | FeedbackChannel }) {
  const source = (SENTIMENT_STYLE as Record<string, { className: string; label: string }>)[value]
    ?? (STATUS_STYLE as Record<string, { className: string; label: string }>)[value]
    ?? (CHANNEL_STYLE as Record<string, { className: string; label: string }>)[value]
    ?? { className: '', label: value };

  return <span className={`${styles.badge} ${styles[source.className]}`}>{source.label}</span>;
}

function MetricCard({ icon: Icon, label, value, tone }: { icon: typeof MessageSquare; label: string; value: string; tone: string }) {
  return <article className={shell.metricCard}>
    <span className={`${shell.metricIcon} ${shell[tone]} `}><Icon size={20} /></span>
    <div><p>{label}</p><strong>{value}</strong></div>
  </article>;
}

export default function InboxPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [status, setStatus] = useState('');
  const [source, setSource] = useState('');

  const listQuery = useInboxList({
    page,
    limit: 8,
    search: search || undefined,
    sentiment: sentiment || undefined,
    status: status || undefined,
    source: source || undefined,
  });
  const summaryQuery = useInboxSummary();
  const newCountQuery = useInboxStatusCount('NEW');
  const actionedCountQuery = useInboxStatusCount('ACTIONED');

  const summary = summaryQuery.data;
  const pagination = listQuery.data?.pagination;

  return <main className={shell.page}>
    <aside className={shell.sidebar}>
      <div className={shell.logo}><span>∞</span> LOOP</div>
      <p className={shell.tagline}>AI Customer Feedback<br />Intelligence Platform</p>
      <nav>{navigation.map(([Icon, label, href]) => <button key={label} onClick={() => router.push(href)} className={label.toLowerCase() === 'inbox' ? shell.activeNav : ''}><Icon size={19} /> <span>{label}</span></button>)}</nav>
      <div className={shell.sidebarFooter}>
        <small>Current workspace</small><button className={shell.workspace}>Acme Corp <ChevronDown size={15} /></button>
        <div className={shell.userMini}><span>AT</span><div><b>Alex Thompson</b><small>Analyst</small></div><ChevronDown size={14} /></div>
        <button><CircleHelp size={19} /><span>Help & support</span></button>
      </div>
    </aside>

    <div className={shell.main}>
      <header className={shell.topbar}>
        <button className={shell.menuButton} aria-label="Open navigation"><Menu size={25} /></button>
        <div><h1>Inbox <Inbox size={20} /></h1><p>Review and manage customer feedback</p></div>
        <div className={shell.headerActions}><button className={shell.dateButton}>Last 7 days <CalendarDays size={16} /></button><button className={shell.iconButton}><Bell size={21} /><i>{summary?.unresolved ?? 0}</i></button><button className={shell.help}><CircleHelp size={22} /></button><div className={shell.headerUser}><span>AT</span><div><b>Alex Thompson</b><small>Analyst</small></div><ChevronDown size={15} /></div></div>
      </header>

      <div className={styles.body}>
        <section className={styles.metrics}>
          <MetricCard icon={MessageSquare} label="Total feedback" value={(summary?.totalFeedback ?? 0).toLocaleString()} tone="purple" />
          <MetricCard icon={Inbox} label="New" value={(newCountQuery.data ?? 0).toLocaleString()} tone="blue" />
          <MetricCard icon={Lightbulb} label="Positive" value={(summary?.positive.count ?? 0).toLocaleString()} tone="green" />
          <MetricCard icon={FileText} label="Negative" value={(summary?.negative.count ?? 0).toLocaleString()} tone="red" />
          <MetricCard icon={CalendarDays} label="Actioned" value={(actionedCountQuery.data ?? 0).toLocaleString()} tone="orange" />
        </section>

        <section className={`${styles.inboxCard} ${shell.card}`}>
          <header className={styles.toolbar}>
            <div className={styles.search}>
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                placeholder="Search feedback, customer…"
              />
            </div>
            <div className={styles.filters}>
              <select value={sentiment} onChange={(event) => { setSentiment(event.target.value); setPage(1); }}>
                <option value="">All sentiments</option>
                <option value="POSITIVE">Positive</option>
                <option value="NEUTRAL">Neutral</option>
                <option value="NEGATIVE">Negative</option>
              </select>
              <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                <option value="">All statuses</option>
                <option value="NEW">New</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="ACTIONED">Actioned</option>
                <option value="ARCHIVED">Archived</option>
              </select>
              <select value={source} onChange={(event) => { setSource(event.target.value); setPage(1); }}>
                <option value="">All sources</option>
                <option value="SUPPORT">Support</option>
                <option value="APP_STORE">App store</option>
                <option value="SURVEY">Survey</option>
                <option value="EMAIL">Email</option>
                <option value="SOCIAL">Social</option>
                <option value="WEBSITE">Website</option>
                <option value="SALES">Sales</option>
                <option value="MANUAL">Manual</option>
              </select>
            </div>
          </header>

          <div className={styles.listHeader}>
            <span>Customer</span>
            <span>Feedback</span>
            <span>Source</span>
            <span>Sentiment</span>
            <span>Status</span>
            <span>Received</span>
          </div>

          <div className={styles.list}>
            {listQuery.isPending && <p className={styles.empty}>Loading feedback…</p>}
            {listQuery.isError && <p className={styles.empty}>Could not load feedback. {listQuery.error?.message ?? ''}</p>}
            {listQuery.isSuccess && (listQuery.data?.items.length === 0) && <p className={styles.empty}>No feedback found.</p>}

            {(listQuery.data?.items ?? []).map((item) => (
              <button
                key={item.id}
                className={styles.row}
                onClick={() => router.push(`/protected/admin/inbox/${item.id}`)}
              >
                <span className={styles.customer}>
                  <i>{item.customerName?.slice(0, 2).toUpperCase() ?? '??'}</i>
                  <b>{item.customerName ?? 'Anonymous'}</b>
                  <small>{item.customerEmail ?? 'No email'}</small>
                </span>
                <span className={styles.content}>{item.content}</span>
                <span><Badge value={item.source} /></span>
                <span><Badge value={item.sentiment} /></span>
                <span><Badge value={item.status} /></span>
                <span className={styles.date}>{format(new Date(item.createdAt), 'MMM d, HH:mm')}</span>
              </button>
            ))}
          </div>

          <footer className={styles.pagination}>
            <span>Showing {(listQuery.data?.items.length ?? 0)} of {pagination?.total ?? 0} entries</span>
            <div>
              <button disabled={!pagination?.hasPreviousPage} onClick={() => setPage((current) => Math.max(current - 1, 1))}><ChevronLeft size={15} /> Prev</button>
              <b>Page {pagination?.page ?? 1} of {Math.max(pagination?.totalPages ?? 1, 1)}</b>
              <button disabled={!pagination?.hasNextPage} onClick={() => setPage((current) => current + 1)}>Next <ChevronRight size={15} /></button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  </main>;
}
