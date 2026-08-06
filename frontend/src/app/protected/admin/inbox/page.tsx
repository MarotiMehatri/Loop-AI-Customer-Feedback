'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3, Bell, CalendarDays, CheckSquare, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Download, Eye, FileText, Grid2X2, Inbox, Lightbulb, Menu, MessageSquare,
  MoreHorizontal, Pencil, Search, Settings2, Sparkles, Users,
} from 'lucide-react';

import shell from '../analytics/analytics.module.css';
import styles from './inbox.module.css';
import { useInboxList } from '../../../../Features/analytics/hooks/useAnalytics';

const navigation = [
  [Grid2X2, 'Dashboard', '/protected/admin/dashboard'], [Inbox, 'Inbox', '/protected/admin/inbox'], [BarChart3, 'Analytics', '/protected/admin/analytics'], [Settings2, 'Themes', '/protected/admin/themes'],
  [FileText, 'Reports', '/protected/admin/reports'], [Sparkles, 'Ask LOOP AI', '/protected/admin/ask-loop'], [Users, 'Data sources', '/protected/admin/add-feedback'], [Download, 'Exports', '/protected/admin/reports'],
] as const;

type FeedbackRow = { id: string; feedback: string; source: string; customer: string; sentiment: string; theme: string; status: string; date: string; time: string };

const INITIAL_ROWS: FeedbackRow[] = [
  { id: 'FB-2501', feedback: 'The pricing is too high for small teams like ours.', source: 'Support ticket', customer: 'Sarah Johnson', sentiment: 'Negative', theme: 'Pricing', status: 'New', date: 'May 17, 2024', time: '09:41 AM' },
  { id: 'FB-2502', feedback: 'Love the new dashboard! Very clean and useful.', source: 'App Store', customer: 'David Lee', sentiment: 'Positive', theme: 'UI/UX', status: 'Reviewed', date: 'May 17, 2024', time: '08:22 AM' },
  { id: 'FB-2503', feedback: 'App crashes when uploading large files.', source: 'Support ticket', customer: 'Michael Brown', sentiment: 'Negative', theme: 'Product Bug', status: 'In Progress', date: 'May 16, 2024', time: '11:15 PM' },
  { id: 'FB-2504', feedback: 'More integration options would be great.', source: 'Survey', customer: 'Jessica Wilson', sentiment: 'Neutral', theme: 'Feature Request', status: 'Reviewed', date: 'May 16, 2024', time: '05:33 PM' },
  { id: 'FB-2505', feedback: 'Great support from the team, quick response!', source: 'Email', customer: 'Daniel Martinez', sentiment: 'Positive', theme: 'Customer Support', status: 'Closed', date: 'May 16, 2024', time: '02:10 PM' },
  { id: 'FB-2506', feedback: 'Unable to export report in PDF format.', source: 'Web Form', customer: 'Olivia Taylor', sentiment: 'Negative', theme: 'Feature Request', status: 'New', date: 'May 16, 2024', time: '12:47 PM' },
  { id: 'FB-2507', feedback: 'The mobile app is very slow on Android.', source: 'Google Play', customer: 'Jenna Anderson', sentiment: 'Negative', theme: 'Performance', status: 'In Progress', date: 'May 16, 2024', time: '10:02 AM' },
  { id: 'FB-2508', feedback: 'Interface is intuitive and easy to navigate.', source: 'App Store', customer: 'Sophia Thomas', sentiment: 'Positive', theme: 'UI/UX', status: 'Reviewed', date: 'May 16, 2024', time: '09:15 AM' },
];

function MetricCard({ icon: Icon, label, value, change, tone, down }: { icon: typeof MessageSquare; label: string; value: string; change: string; tone: string; down?: boolean }) {
  return <article className={shell.metricCard}><span className={`${shell.metricIcon} ${shell[tone]}`}><Icon size={20} /></span><div><p>{label}</p><strong>{value}</strong><small className={down ? shell.down : shell.up}>{down ? '↓' : '↑'} {change} <em>vs last week</em></small></div></article>;
}

function Badge({ value, type }: { value: string; type: 'sentiment' | 'source' | 'status' }) {
  const key = value.toLowerCase().replaceAll(' ', '');
  return <span className={`${styles.badge} ${styles[`${type}${key}`] ?? ''}`}>{value}</span>;
}

export default function InboxPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [savedView, setSavedView] = useState('All Feedback');
  const [items, setItems] = useState<FeedbackRow[]>(INITIAL_ROWS);
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<FeedbackRow | null>(null);
  const [viewing, setViewing] = useState<FeedbackRow | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ source: '', sentiment: '', status: '' });
  const inboxQuery = useInboxList({ page: 1, limit: 100 });
  useEffect(() => {
    const records = inboxQuery.data?.items;
    if (!records) return;
    const statusLabels: Record<string, string> = { NEW: 'New', REVIEWED: 'Reviewed', ACTIONED: 'In Progress', ARCHIVED: 'Resolved' };
    const sourceLabels: Record<string, string> = { SUPPORT: 'Support Ticket', APP_STORE: 'App Store', SURVEY: 'Survey', SALES: 'Sales', SOCIAL: 'Social', WEBSITE: 'Website', EMAIL: 'Email', MANUAL: 'Manual' };
    const sentimentLabels: Record<string, string> = { POSITIVE: 'Positive', NEUTRAL: 'Neutral', NEGATIVE: 'Negative' };
    setItems(records.map((record) => {
      const createdAt = new Date(record.createdAt);
      return { id: record.id, feedback: record.content, source: sourceLabels[record.source] ?? record.source, customer: record.customerName ?? 'Anonymous customer', sentiment: sentimentLabels[record.sentiment] ?? record.sentiment, theme: 'Uncategorized', status: statusLabels[record.status] ?? record.status, date: createdAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }), time: createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    }));
  }, [inboxQuery.data]);
  const filteredRows = useMemo(() => items.filter((row) => (
    row.feedback.toLowerCase().includes(search.toLowerCase()) || row.customer.toLowerCase().includes(search.toLowerCase()) || row.source.toLowerCase().includes(search.toLowerCase())
  ) && (!filters.source || row.source === filters.source) && (!filters.sentiment || row.sentiment === filters.sentiment) && (!filters.status || row.status === filters.status)), [items, search, filters]);
  const allSelected = filteredRows.length > 0 && filteredRows.every((row) => selected.includes(row.id));
  const toggleSelected = (id: string) => setSelected((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  const saveEdit = () => { if (!editing) return; setItems((current) => current.map((row) => row.id === editing.id ? editing : row)); setEditing(null); };
  const bulkMarkReviewed = () => { if (selected.length === 0) return; setItems((current) => current.map((row) => selected.includes(row.id) ? { ...row, status: 'Reviewed' } : row)); setSelected([]); };
  const markReviewed = (id: string) => { setItems((current) => current.map((row) => row.id === id ? { ...row, status: 'Reviewed' } : row)); setOpenMenuId(null); };
  const removeFeedback = (id: string) => { setItems((current) => current.filter((row) => row.id !== id)); setSelected((current) => current.filter((value) => value !== id)); setOpenMenuId(null); };
  const exportCsv = () => {
    const fields: Array<keyof FeedbackRow> = ['id', 'feedback', 'source', 'customer', 'sentiment', 'theme', 'status', 'date', 'time'];
    const csv = [fields.join(','), ...filteredRows.map((row) => fields.map((field) => `\"${String(row[field]).replaceAll('\"', '\"\"')}\"`).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'feedback-export.csv'; link.click(); URL.revokeObjectURL(url);
  };

  function getInitials(name: string) {
    if (!name) return '??';
    return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  }

  return <main className={shell.page}>
    <aside className={shell.sidebar}>
      <div className={shell.logo}><span>∞</span> LOOP</div><p className={shell.tagline}>AI Customer Feedback<br />Intelligence Platform</p>
      <nav>{navigation.map(([Icon, label, href]) => <button key={label} onClick={() => router.push(href)} className={label === 'Inbox' ? shell.activeNav : ''}><Icon size={19} /><span>{label}</span></button>)}</nav>
      <div className={shell.sidebarFooter}><small>Current workspace</small><button className={shell.workspace}>Acme Corp <ChevronDown size={15} /></button><div className={shell.userMini}><span>AT</span><div><b>Alex Thompson</b><small>Analyst</small></div><ChevronDown size={14} /></div><button><CircleHelp size={19} /><span>Help &amp; support</span></button></div>
    </aside>

    <div className={shell.main}>
      <header className={shell.topbar}><button className={shell.menuButton} aria-label="Open navigation"><Menu size={25} /></button><div><h1>Inbox</h1><p>All customer feedback in one place</p></div><div className={shell.headerActions}><button className={shell.dateButton}>May 11 – May 17, 2024 <CalendarDays size={16} /></button><button className={shell.iconButton}><Bell size={21} /><i>3</i></button><button className={shell.help}><CircleHelp size={22} /></button><div className={shell.headerUser}><span>AT</span><div><b>Alex Thompson</b><small>Analyst</small></div><ChevronDown size={15} /></div></div></header>

      <div className={styles.pageBody}>
        <div className={styles.content}>
          <section className={styles.metrics}>
            <MetricCard icon={MessageSquare} label="Total feedback" value="2,543" change="12.5%" tone="purple" />
            <MetricCard icon={FileText} label="New feedback" value="342" change="8.7%" tone="blue" />
            <MetricCard icon={Lightbulb} label="Negative feedback" value="483" change="3.2%" tone="red" down />
            <MetricCard icon={CalendarDays} label="Pending review" value="152" change="5.4%" tone="orange" />
            <MetricCard icon={Sparkles} label="AI classified" value="2,391" change="15.3%" tone="green" />
          </section>

          <section className={styles.tableCard}>
            <header className={styles.tableToolbar}><h2>All Feedback <span>({items.length})</span></h2><div className={styles.tableActions}><label className={styles.search}><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search feedback, customer, source..." /><Search size={14} /></label><button onClick={bulkMarkReviewed} disabled={selected.length === 0}>Mark reviewed ({selected.length}) <CheckSquare size={14} /></button><button onClick={exportCsv}><Download size={14} /> Export CSV</button></div></header>
            <div className={styles.tableHead}><input type="checkbox" checked={allSelected} onChange={() => setSelected(allSelected ? [] : filteredRows.map((row) => row.id))} aria-label="Select all feedback" /><span>Feedback</span><span>Source</span><span>Customer</span><span>Sentiment</span><span>Theme</span><span>Status</span><span>Date ↓</span><span>Actions</span></div>
            <div className={styles.tableRows}>{filteredRows.map((row) => <div className={styles.row} key={row.id}><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleSelected(row.id)} aria-label={`Select feedback from ${row.customer}`} /><span className={styles.feedbackRow}><span className={styles.avatar}>{getInitials(row.customer)}</span><span className={styles.feedback}>{row.feedback}<small>#{row.id}</small></span></span><span><Badge value={row.source} type="source" /></span><span>{row.customer}</span><span><Badge value={row.sentiment} type="sentiment" /></span><span>{row.theme}</span><span><Badge value={row.status} type="status" /></span><span className={styles.date}>{row.date}<small>{row.time}</small></span><span className={styles.rowActions}><button aria-label={`View ${row.id}`} title="View feedback" onClick={() => setViewing(row)}><Eye size={13} /></button><button aria-label={`Edit ${row.id}`} title="Edit feedback" onClick={() => setEditing({ ...row })}><Pencil size={13} /></button><span className={styles.moreMenu}><button aria-label={`More actions for ${row.id}`} title="More actions" onClick={() => setOpenMenuId((current) => current === row.id ? null : row.id)}><MoreHorizontal size={15} /></button>{openMenuId === row.id && <span className={styles.menu}><button onClick={() => markReviewed(row.id)}>Mark reviewed</button><button className={styles.deleteAction} onClick={() => removeFeedback(row.id)}>Delete</button></span>}</span></span></div>)}</div>
            <footer className={styles.pagination}><span>Showing 1 to {filteredRows.length} of 2,543 results</span><div><button><ChevronLeft size={13} /></button><b>1</b><button>2</button><button>3</button><button>4</button><button>5</button><span>…</span><button>255</button><button><ChevronRight size={13} /></button><button className={styles.perPage}>10 / page <ChevronDown size={13} /></button></div></footer>
          </section>
        </div>

        <aside className={styles.rail}><header><h2>Filters</h2><button onClick={() => setFilters({ source: '', sentiment: '', status: '' })}>Clear all</button></header><label>Workspace<button>Acme Corp <ChevronDown size={13} /></button></label><label>Source<select value={filters.source} onChange={(event) => setFilters((current) => ({ ...current, source: event.target.value }))}><option value="">All Sources</option>{[...new Set(items.map((row) => row.source))].map((value) => <option key={value}>{value}</option>)}</select></label><label>Sentiment<select value={filters.sentiment} onChange={(event) => setFilters((current) => ({ ...current, sentiment: event.target.value }))}><option value="">All Sentiments</option><option>Positive</option><option>Neutral</option><option>Negative</option></select></label><label>Status<select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">All Statuses</option>{[...new Set(items.map((row) => row.status))].map((value) => <option key={value}>{value}</option>)}</select></label><label>Date range<button>May 11 – May 17, 2024 <CalendarDays size={13} /></button></label><button className={styles.apply}>Filters applied live</button><section className={styles.saved}><header><h3>Saved Views</h3><button>Manage</button></header>{['All Feedback', 'Negative Feedback', 'Pending Review', 'Product Bugs'].map((view) => <button key={view} onClick={() => { setSavedView(view); setFilters(view === 'Negative Feedback' ? { source: '', sentiment: 'Negative', status: '' } : view === 'Pending Review' ? { source: '', sentiment: '', status: 'New' } : { source: '', sentiment: '', status: '' }); }} className={savedView === view ? styles.activeView : ''}>{view}</button>)}<button className={styles.saveView}><span>＋</span> Save Current View</button></section></aside>
      </div>
      {editing && <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setEditing(null)}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="edit-feedback-title" onMouseDown={(event) => event.stopPropagation()}><header><div><p>Edit feedback</p><h2 id="edit-feedback-title">{editing.id}</h2></div><button onClick={() => setEditing(null)}>×</button></header><label>Customer<input value={editing.customer} onChange={(event) => setEditing({ ...editing, customer: event.target.value })} /></label><label>Feedback<textarea value={editing.feedback} onChange={(event) => setEditing({ ...editing, feedback: event.target.value })} /></label><div className={styles.modalFields}><label>Sentiment<select value={editing.sentiment} onChange={(event) => setEditing({ ...editing, sentiment: event.target.value })}><option>Positive</option><option>Neutral</option><option>Negative</option></select></label><label>Status<select value={editing.status} onChange={(event) => setEditing({ ...editing, status: event.target.value })}><option>New</option><option>Reviewed</option><option>In Progress</option><option>Closed</option></select></label></div><footer><button onClick={() => setEditing(null)}>Cancel</button><button className={styles.save} onClick={saveEdit}>Save changes</button></footer></section></div>}
      {viewing && <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setViewing(null)}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="view-feedback-title" onMouseDown={(event) => event.stopPropagation()}><header><div><p>Feedback details</p><h2 id="view-feedback-title">{viewing.id}</h2></div><button aria-label="Close" onClick={() => setViewing(null)}>×</button></header><label>Customer<input value={viewing.customer} readOnly /></label><label>Feedback<textarea value={viewing.feedback} readOnly /></label><div className={styles.modalFields}><label>Source<input value={viewing.source} readOnly /></label><label>Theme<input value={viewing.theme} readOnly /></label><label>Sentiment<input value={viewing.sentiment} readOnly /></label><label>Status<input value={viewing.status} readOnly /></label></div><footer><button onClick={() => setViewing(null)}>Close</button><button className={styles.save} onClick={() => { setEditing({ ...viewing }); setViewing(null); }}>Edit feedback</button></footer></section></div>}
    </div>
  </main>;
}
