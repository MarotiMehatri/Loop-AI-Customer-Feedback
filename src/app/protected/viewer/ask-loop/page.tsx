'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, BarChart3, Bot, CalendarDays, ChevronDown, CircleHelp, Database, Download, Eye, FileText, Inbox, LayoutDashboard, LockKeyhole, MessageSquare, Send, Sparkles, Tag, TrendingUp, UsersRound } from 'lucide-react';
import { apiClient } from '../../../../lib/api/api-client';
import { getErrorMessage } from '../../../../lib/api/api-error';
import styles from './viewer-ask.module.css';

const questions = ['What are the top issues customers are facing?', 'Show me pricing related feedback trend', 'Why are users unhappy with the app?', 'Compare support tickets vs app reviews', 'What themes increased the most this week?'];
const nav = [[LayoutDashboard, 'Dashboard'], [Inbox, 'Inbox'], [Tag, 'Themes'], [TrendingUp, 'Trends'], [FileText, 'Reports'], [Sparkles, 'Ask LOOP AI'], [Database, 'Data Sources']] as const;
const issues = [['Pricing concerns', '2,451', '19.5%', '28%', 'Negative', 'High'], ['Login issues', '2,128', '16.9%', '12%', 'Negative', 'High'], ['Missing features', '1,987', '15.8%', '15%', 'Neutral', 'High'], ['App crashes', '1,654', '13.2%', '5%', 'Negative', 'Medium'], ['Slow loading', '1,287', '10.3%', '8%', 'Neutral', 'Medium']];
const viewerHref = (label: string) => label === 'Dashboard' ? '/protected/viewer' : label === 'Ask LOOP AI' ? '/protected/viewer/ask-loop' : label === 'Data Sources' ? '/protected/viewer/data-sources' : `/protected/viewer/${label.toLowerCase()}`;

export default function ViewerAskLoop() {
  const [question, setQuestion] = useState('');
  const [askedQuestion, setAskedQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [conversationId, setConversationId] = useState<string>();
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>(questions);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function resetConversation() {
    setQuestion('');
    setAskedQuestion('');
    setAnswer('');
    setError('');
    setConversationId(undefined);
    setFollowUpQuestions(questions);
  }

  useEffect(() => {
    const newChatButton = document.querySelector<HTMLButtonElement>(`.${styles.newChat}`);
    newChatButton?.addEventListener('click', resetConversation);
    return () => newChatButton?.removeEventListener('click', resetConversation);
  }, [mounted]);

  async function ask(value: string) {
    if (!value.trim() || loading) return;
    const normalizedQuestion = value.trim();
    setAskedQuestion(normalizedQuestion); setQuestion(''); setAnswer(''); setError(''); setLoading(true);
    try {
      const response = await apiClient.post('/ask-loop/ask', { question: normalizedQuestion, conversationId });
      const data = response.data.data;
      setConversationId(data.conversationId);
      setAnswer(data.answer);
      setFollowUpQuestions(data.followUpQuestions?.length ? data.followUpQuestions : questions);
    }
    catch (error) { setError(getErrorMessage(error)); setAnswer(getErrorMessage(error)); }
    finally { setLoading(false); }
  }

  if (!mounted) return <main className={styles.page} />;

  return <main className={styles.page}>
    <aside className={styles.sidebar}>
      <div className={styles.logo}><span>∞</span> LOOP</div><p>AI Customer-Feedback<br />Intelligence Platform</p>
      <nav>{nav.map(([Icon, label]) => <a key={label} className={label === 'Ask LOOP AI' ? styles.active : ''} href={viewerHref(label)}><Icon size={18} />{label}{label === 'Inbox' && <b>152</b>}</a>)}</nav>
      <div className={styles.sidebarBottom}><small>WORKSPACE</small><button><Database size={18} /><span>Acme Corp<em>Enterprise Plan</em></span><ChevronDown size={14} /></button><a className={styles.user} href="/protected/viewer/profile"><i>VW</i><span>Viewer User<em>Viewer</em></span><ChevronDown size={14} /></a><a className={styles.help}><CircleHelp size={18} /> Help &amp; Support</a></div>
    </aside>
    <div className={styles.content}>
      <header className={styles.header}><div><h1>Ask LOOP AI <em><Eye size={13} /> Viewer</em></h1><p>Ask questions in natural language. Get AI-powered insights from your feedback.</p></div><button>Acme Corp <ChevronDown size={14} /></button><button><span>May 11 – May 17, 2024</span><CalendarDays size={15} /></button><button className={styles.download}><Download size={18} /></button><a className={styles.headerUser} href="/protected/viewer/profile"><i>VW</i><span>Viewer User<em>Viewer</em></span><ChevronDown size={14} /></a></header>
      <section className={styles.layout}>
        <section className={styles.conversations}><div className={styles.conversationTop}><h2>New Conversation</h2><Sparkles size={16} /></div><button className={styles.newChat} onClick={() => { setQuestion(''); setAnswer(''); }}>＋ New Chat</button><h3>Recent Conversations</h3>{questions.concat(['Give me a summary of negative feedback', 'Show me onboarding related feedback', 'Which features do users love the most?']).map((item, index) => <button className={styles.conversation} key={item} onClick={() => ask(item)}><MessageSquare size={14} /><span>{item}</span><small>{index === 0 ? '10:24 AM' : index === 1 ? '09:45 AM' : index < 4 ? 'Yesterday' : 'May 14'}</small></button>)}<button className={styles.allConversations}>View all conversations</button></section>
        <section className={styles.chat}>
          <div className={styles.question}>{askedQuestion || 'Ask LOOP AI a question to analyse your workspace feedback.'}<small>{askedQuestion ? 'Just now' : 'Ready'}</small></div>
          <div className={styles.answer}><i><Bot size={22} /></i><div><b>LOOP AI</b><p>{loading ? 'Analyzing your feedback…' : answer || 'Here are the top issues customers are facing this week (May 11 – May 17, 2024).'}</p></div></div>
          {(answer || error || loading) && <section style={{ margin: '16px 0', padding: '16px 18px', border: '1px solid #cfc0ff', borderRadius: 8, background: '#f8f5ff', fontSize: 14, lineHeight: 1.6 }}><b style={{ color: '#5420c8' }}>{loading ? 'LOOP AI is analysing your feedback…' : error ? 'Unable to answer' : 'Latest answer'}</b><p style={{ margin: '8px 0 0' }}>{loading ? 'Please wait a moment.' : error || answer}</p></section>}
          <section className={styles.metrics}>{[[MessageSquare, 'Total Mentions', '12,543', 'purple'], [ArrowUpRight, 'Top Issue', 'Pricing', 'violet'], [UsersRound, 'Affected Customers', '8,921', 'blue'], [CircleHelp, 'Negative Sentiment', '3,604', 'red'], [TrendingUp, 'Trend', '↑ 18.6%', 'green']].map(([Icon, label, value, tone]) => { const MetricIcon = Icon as typeof MessageSquare; return <article key={label as string}><i className={styles[tone as string]}><MetricIcon size={17} /></i><span><small>{label as string}</small><b>{value as string}</b>{label === 'Trend' && <em>vs last week</em>}</span></article>; })}</section>
          <section className={styles.issueCard}><header><h2>Top Issues by Mentions</h2><button>This Week <ChevronDown size={13} /></button></header><div className={styles.issueHead}><span>#</span><span>Issue</span><span>Mentions</span><span>% of Total</span><span>Trend</span><span>Sentiment</span><span>Impact</span></div>{issues.map(([name, mentions, total, trend, sentiment, impact], index) => <div className={styles.issueRow} key={name}><b>{index + 1}</b><span>{name}</span><strong>{mentions}</strong><span>{total}</span><em>↑ {trend}</em><mark className={sentiment === 'Negative' ? styles.negative : styles.neutral}>{sentiment}</mark><mark className={impact === 'High' ? styles.high : styles.medium}>{impact}</mark></div>)}<button className={styles.viewIssues}>View all issues <ArrowUpRight size={15} /></button></section>
          <section className={styles.visuals}><article><header><h2>Mentions Trend <small>(Top 5 Issues)</small></h2><button>7 Days <ChevronDown size={12} /></button></header><div className={styles.legend}><span className={styles.dotPurple}>Pricing</span><span className={styles.dotBlue}>Login Issues</span><span className={styles.dotGreen}>Missing Features</span><span className={styles.dotOrange}>App Crashes</span><span className={styles.dotRed}>Slow Loading</span></div><div className={styles.lineChart}><svg viewBox="0 0 420 150" preserveAspectRatio="none"><path d="M22 30 L85 35 L148 21 L211 42 L274 28 L337 23 L400 10" className={styles.linePurple}/><path d="M22 70 L85 68 L148 62 L211 76 L274 67 L337 64 L400 56" className={styles.lineBlue}/><path d="M22 96 L85 90 L148 84 L211 101 L274 91 L337 88 L400 78" className={styles.lineGreen}/><path d="M22 117 L85 113 L148 109 L211 120 L274 112 L337 110 L400 104" className={styles.lineOrange}/><path d="M22 132 L85 128 L148 126 L211 133 L274 128 L337 127 L400 121" className={styles.lineRed}/></svg><div><span>May 11</span><span>May 12</span><span>May 13</span><span>May 14</span><span>May 15</span><span>May 16</span><span>May 17</span></div></div></article><article><header><h2>Issue Sentiment Distribution</h2><strong>This Week</strong></header><div className={styles.donut}><b>12,543<small>Total</small></b></div><div className={styles.sentiment}><p><i className={styles.positiveDot} />Positive <b>4,921 (39.2%)</b></p><p><i className={styles.neutralDot} />Neutral <b>4,018 (32.0%)</b></p><p><i className={styles.negativeDot} />Negative <b>3,604 (28.8%)</b></p></div></article></section>
          <form onSubmit={(event) => { event.preventDefault(); ask(question); }}><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask anything about your feedback…" /><button aria-label="Send question"><Send size={18} /></button></form><div className={styles.chips}><span>Try questions like:</span>{questions.slice(0, 4).map(item => <button key={item} onClick={() => ask(item)}>{item.replace('What are the ', '').replace('Show me ', '')}</button>)}</div><p className={styles.disclaimer}>LOOP AI can make mistakes. Please verify important information.</p>
        </section>
        <aside className={styles.right}><section><h2>Quick Insights <small>(This Week)</small></h2>{[['$', 'Pricing is the top issue', '2,451 mentions (19.5%)', '↑ 28%'], [LockKeyhole, 'Login issues spiked', '2,128 mentions (16.9%)', '↑ 12%'], [CircleHelp, 'Negative sentiment is high', '28.8% of total feedback', ''], [UsersRound, '8,921 customers affected', '', '↑ 15.2%'], [CalendarDays, 'Response time improved', 'Avg. 3.2 hrs', '↓ 8.4%']].map(([Icon, title, detail, change]) => <div className={styles.quick} key={title as string}><i>{typeof Icon === 'string' ? Icon : (() => { const QuickIcon = Icon as typeof LockKeyhole; return <QuickIcon size={17} />; })()}</i><span><b>{title as string}</b><small>{detail as string} <em>{change as string}</em></small></span></div>)}</section><section><h2>Popular Questions</h2>{questions.map(item => <button key={item} onClick={() => ask(item)}>{item}</button>)}<a>View all questions <ArrowUpRight size={14} /></a></section><section className={styles.scope}><h2>Data Scope</h2><p><Database size={16} /><span>Workspace<b>Acme Corp</b></span></p><p><CalendarDays size={16} /><span>Date Range<b>May 11 – May 17, 2024</b></span></p><p><MessageSquare size={16} /><span>Sources<b>7 / 7 Connected</b></span></p><p><Bot size={16} /><span>Feedback Analyzed<b>12,543</b></span></p></section></aside>
      </section>
    </div>
  </main>;
}
