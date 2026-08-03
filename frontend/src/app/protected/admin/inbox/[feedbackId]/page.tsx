'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  ArrowLeft, BarChart3, Bell, CalendarDays, ChevronDown, CircleHelp,
  Download, FileText, Grid2X2, Inbox, Menu, Settings2, Sparkles, Users,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../../../../../lib/api/api-client';
import type { ApiResponse } from '../../../../../lib/api/api-response';
import type { InboxFeedback } from '../../../../../Features/analytics/analytics.types';

import shell from '../../analytics/analytics.module.css';
import styles from '../inbox.module.css';

const navigation = [
  [Grid2X2, 'Dashboard', '/protected/admin/dashboard'], [Inbox, 'Inbox', '/protected/admin/inbox'], [BarChart3, 'Analytics', '/protected/admin/analytics'], [Settings2, 'Themes', '/protected/admin/themes'],
  [FileText, 'Reports', '/protected/admin/reports'], [Sparkles, 'Ask LOOP AI', '/protected/admin/ask-loop'], [Users, 'Data sources', '/protected/admin/add-feedback'], [Download, 'Exports', '/protected/admin/reports'],
] as const;

function Badge({ label, className }: { label: string; className: string }) {
  return <span className={`${styles.badge} ${styles[className]}`}>{label}</span>;
}

export default function FeedbackDetailPage({ params }: { params: Promise<{ feedbackId: string }> }) {
  const router = useRouter();
  const feedbackId = use(params).feedbackId;

  const query = useQuery({
    queryKey: ['feedback-inbox', 'detail', feedbackId],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<{ feedback: InboxFeedback }>>(
        `/feedback-inbox/${feedbackId}`,
      );
      return data.data.feedback;
    },
    enabled: Boolean(feedbackId),
  });

  const feedback = query.data;

  const statusClass: Record<string, string> = {
    NEW: 'new', REVIEWED: 'reviewed', ACTIONED: 'actioned', ARCHIVED: 'archived',
  };
  const sentimentClass: Record<string, string> = {
    POSITIVE: 'positive', NEUTRAL: 'neutral', NEGATIVE: 'negative',
  };
  const sourceClass: Record<string, string> = {
    SUPPORT: 'support', APP_STORE: 'appStore', SURVEY: 'survey',
    SALES: 'sales', SOCIAL: 'social', WEBSITE: 'website',
    EMAIL: 'email', MANUAL: 'manual',
  };

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
        <div><h1>Feedback details <Inbox size={20} /></h1><p>Review and manage customer feedback</p></div>
        <div className={shell.headerActions}><button className={shell.dateButton}>Last 7 days <CalendarDays size={16} /></button><button className={shell.iconButton}><Bell size={21} /></button><button className={shell.help}><CircleHelp size={22} /></button><div className={shell.headerUser}><span>AT</span><div><b>Alex Thompson</b><small>Analyst</small></div><ChevronDown size={15} /></div></div>
      </header>

      <div className={styles.body}>
        <section className={`${styles.inboxCard} ${shell.card}`}>
          <button className={styles.back} onClick={() => router.push('/protected/admin/inbox')}>
            <ArrowLeft size={15} /> Back to inbox
          </button>

          {query.isPending && <p className={styles.empty}>Loading feedback…</p>}
          {query.isError && <p className={styles.empty}>Could not load feedback.</p>}

          {feedback && (
            <div className={styles.detail}>
              <div className={styles.detailHeader}>
                <span className={styles.detailAvatar}>{feedback.customerName?.slice(0, 2).toUpperCase() ?? '??'}</span>
                <div>
                  <h2>{feedback.customerName ?? 'Anonymous customer'}</h2>
                  <p>{feedback.customerEmail ?? 'No email provided'}</p>
                </div>
                <div className={styles.detailBadges}>
                  <Badge label={feedback.sentiment} className={sentimentClass[feedback.sentiment] ?? ''} />
                  <Badge label={feedback.status} className={statusClass[feedback.status] ?? ''} />
                </div>
              </div>

              <p className={styles.detailContent}>{feedback.content}</p>

              <div className={styles.detailMeta}>
                <div><span>Source</span><Badge label={feedback.source} className={sourceClass[feedback.source] ?? ''} /></div>
                <div><span>Received</span><b>{format(new Date(feedback.createdAt), 'MMM d, yyyy • HH:mm')}</b></div>
                <div><span>Updated</span><b>{format(new Date(feedback.updatedAt), 'MMM d, yyyy • HH:mm')}</b></div>
                <div><span>Imported by</span><b>{feedback.createdBy?.name ?? '—'}</b></div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  </main>;
}
