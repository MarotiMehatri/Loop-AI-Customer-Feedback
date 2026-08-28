'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckSquare, CircleAlert, Clock3, Frown, MoreHorizontal, Search, Smile, SlidersHorizontal } from 'lucide-react';

import { useInboxList } from '../../../../Features/analytics/hooks/useAnalytics';
import styles from './inbox.module.css';

const PREVIEW_ROWS = [
  ['The new update is amazing! Keep up the great work.', 'App Store', 'Positive', 'May 17, 10:24 AM', 'New', 'Ava Patel'],
  ['Facing issues while logging in. Please fix this ASAP.', 'Support Ticket', 'Negative', 'May 17, 09:11 AM', 'In Progress', 'Marcus Lee'],
  ['It would be great to have export to PDF feature.', 'Survey', 'Neutral', 'May 16, 08:45 PM', 'New', 'Olivia Chen'],
  ['UI is clean and intuitive. Good job team!', 'Website', 'Positive', 'May 16, 07:30 PM', 'Resolved', 'David Kim'],
  ['Too expensive compared to other tools.', 'App Store', 'Negative', 'May 16, 06:15 PM', 'In Progress', 'Priya Shah'],
  ['Need dark mode in the mobile app.', 'Email', 'Neutral', 'May 16, 05:02 PM', 'New', 'Noah Wilson'],
  ['Great customer support! They resolved my issue quickly.', 'Support Ticket', 'Positive', 'May 15, 04:35 PM', 'Resolved', 'Mia Thomas'],
  ['The reports section is very helpful and easy to use.', 'Website', 'Positive', 'May 15, 03:20 PM', 'Resolved', 'Ethan Clark'],
] as const;

function initials(name: string) { return name.split(' ').map((part) => part[0]).join('').slice(0, 2); }
function kind(value: string) { return value.toLowerCase().replaceAll(' ', ''); }

export default function InboxPage() {
  const router = useRouter();
  const live = useInboxList({ page: 1, limit: 10 });
  const [search, setSearch] = useState('');
  const [source, setSource] = useState('');
  const [sentiment, setSentiment] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const rows = useMemo(() => {
    const records = live.data?.items ?? [];
    if (records.length) return records.map((item) => ({ id: item.id, feedback: item.content, source: item.source.replace('_', ' '), sentiment: item.sentiment, date: new Date(item.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }), status: item.status === 'ACTIONED' ? 'In Progress' : item.status === 'ARCHIVED' ? 'Resolved' : item.status[0] + item.status.slice(1).toLowerCase(), customer: item.customerName ?? 'Anonymous' }));
    return PREVIEW_ROWS.map(([feedback, itemSource, itemSentiment, date, itemStatus, customer], index) => ({ id: `preview-${index}`, feedback, source: itemSource, sentiment: itemSentiment, date, status: itemStatus, customer }));
  }, [live.data]);
  const filtered = rows.filter((row) => (!search || `${row.feedback} ${row.customer}`.toLowerCase().includes(search.toLowerCase())) && (!source || row.source === source) && (!sentiment || row.sentiment === sentiment) && (!status || row.status === status));
  const all = filtered.length > 0 && filtered.every((row) => selected.includes(row.id));
  const toggleAll = () => setSelected(all ? [] : filtered.map((row) => row.id));

  const summaries = [
    [CheckSquare, 'Total Feedback', '2,543', '↑ 12.5%', 'total'], [Smile, 'Positive', '1,041 (41%)', '', 'positive'],
    [CircleAlert, 'Neutral', '1,018 (40%)', '', 'neutral'], [Frown, 'Negative', '484 (19%)', '', 'negative'], [Clock3, 'Unresolved', '312', '', 'unresolved'],
  ] as const;

  return(
    <div className={styles.page}>
      <section className={styles.filters}>
        <label className={styles.search}><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search feedback..." /></label>
        <select value={source} onChange={(event) => setSource(event.target.value)}><option value="">All Sources</option>{[...new Set(rows.map((row) => row.source))].map((value) => <option key={value}>{value}</option>)}</select>
        <select value={sentiment} onChange={(event) => setSentiment(event.target.value)}><option value="">All Sentiments</option><option>Positive</option><option>Neutral</option><option>Negative</option></select>
        <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All Status</option>{[...new Set(rows.map((row) => row.status))].map((value) => <option key={value}>{value}</option>)}</select>
        <button className={styles.filterButton}><SlidersHorizontal size={17} /> Filters</button>
      </section>

      <section className={styles.summary}>{summaries.map(([Icon, label, value, change, tone]) => <article key={label}><i className={styles[tone]}><Icon size={22} /></i><div><span>{label}</span><b>{value}</b>{change && <small>{change} <em>vs last week</em></small>}</div></article>)}</section>

      <section className={styles.tableCard}>
        <div className={styles.head}><input type="checkbox" checked={all} onChange={toggleAll} aria-label="Select all feedback" /><span>Feedback</span><span>Source</span><span>Sentiment</span><span>Date</span><span>Status</span><span>Actions</span></div>
        <div>{filtered.map((row) => <article className={styles.row} key={row.id}><input type="checkbox" checked={selected.includes(row.id)} onChange={() => setSelected((current) => current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id])} aria-label={`Select feedback ${row.id}`} /><div className={styles.feedback}><i>{initials(row.customer)}</i><p>{row.feedback}<small>{row.customer}</small></p></div><span><mark className={`${styles.badge} ${styles[`source${kind(row.source)}`]}`}>{row.source}</mark></span><span><mark className={`${styles.badge} ${styles[kind(row.sentiment)]}`}>{row.sentiment}</mark></span><span className={styles.date}>{row.date}</span><span><mark className={`${styles.badge} ${styles[kind(row.status)]}`}>{row.status}</mark></span><button className={styles.more} aria-label={`Actions for ${row.id}`}><MoreHorizontal size={20} /></button></article>)}</div>
        <footer><span>Showing 1 to {filtered.length} of 2,543 results</span><nav><b>1</b><button>2</button><button>3</button><span>…</span><button>255</button><button>›</button></nav><label>Rows per page <select><option>10</option></select></label></footer>
      </section>
    </div>
  );
}
