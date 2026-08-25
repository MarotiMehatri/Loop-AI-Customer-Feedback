"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Download, Eye, Lightbulb, Link2, MoreHorizontal, Pencil, Plus, Search, Sparkles, TrendingUp, Upload } from "lucide-react";

import { AdminShell } from "../_components/AdminShell";
import { apiClient } from "../../../../lib/api/api-client";
import styles from "./themes.module.css";

type Theme = { id: string; name: string; description: string | null; status: string; feedbackCount: number; createdAt: string };
type Summary = { totalThemes: number; activeAssignments: number; aiGeneratedThemes: number; manuallyCreatedThemes: number; byStatus: Array<{ status: string; count: number }> };
const tones = ["purple", "blue", "green", "orange", "teal", "violet", "cyan"];

function count(summary: Summary | null, status: string) { return summary?.byStatus.find((item) => item.status === status)?.count ?? 0; }
function label(status: string) { return status[0] + status.slice(1).toLowerCase(); }

export default function ThemesPage() {
  const [items, setItems] = useState<Theme[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [themes, summaryResult] = await Promise.all([
        apiClient.get<{ data: { items: Theme[] } }>("/theme", { params: { page: 1, limit: 100, sortBy: "updatedAt", sortOrder: "desc" } }),
        apiClient.get<{ data: Summary }>("/theme/summary"),
      ]);
      setItems(themes.data.data.items ?? []);
      setSummary(summaryResult.data.data);
    } catch { setItems([]); setSummary(null); } finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const filtered = useMemo(() => items.filter((item) => `${item.name} ${item.description ?? ""}`.toLowerCase().includes(search.toLowerCase())), [items, search]);

  const create = async () => {
    const name = window.prompt("Theme name"); if (!name?.trim()) return;
    const description = window.prompt("Description (optional)") ?? "";
    await apiClient.post("/theme", { name: name.trim(), description }); await load();
  };
  const edit = async (theme: Theme) => {
    const name = window.prompt("Theme name", theme.name); if (!name?.trim()) return;
    const description = window.prompt("Description", theme.description ?? "") ?? "";
    await apiClient.patch(`/theme/${theme.id}`, { name: name.trim(), description }); await load();
  };
  const view = async (theme: Theme) => {
    const [{ data: analytics }, { data: feedbackResponse }] = await Promise.all([
      apiClient.get<{ data: { totalFeedback: number; averageConfidence: number; sentiment: Array<{ sentiment: string; percentage: number }> } }>(`/theme/${theme.id}/analytics`),
      apiClient.get<{ data: { items: Array<{ content: string }> } }>(`/theme/${theme.id}/feedback`, { params: { page: 1, limit: 3 } }),
    ]);
    const feedback = { data: feedbackResponse };
    const sentiment = analytics.data.sentiment.map((item) => `${item.sentiment}: ${Math.round(item.percentage)}%`).join(", ") || "No sentiment data";
    const samples = feedback.data.data.items.map((item) => `• ${item.content}`).join("\n") || "No feedback assigned yet.";
    window.alert(`${theme.name}\n\nFeedback: ${analytics.data.totalFeedback}\nAverage confidence: ${Math.round(analytics.data.averageConfidence * 100)}%\nSentiment: ${sentiment}\n\nRecent feedback\n${samples}`);
  };
  const remove = async (theme: Theme) => {
    if (!window.confirm(`Delete “${theme.name}”? This cannot be undone.`)) return;
    await apiClient.delete(`/theme/${theme.id}`);
    await load();
  };

  const cards = [["Total Themes", summary?.totalThemes ?? 0, "folder"], ["Active Themes", count(summary, "ACTIVE"), "chat"], ["Emerging Themes", count(summary, "EMERGING"), "trend"], ["Resolved Themes", count(summary, "RESOLVED"), "check"]] as const;
  return <AdminShell title="Themes" subtitle="Discover and analyze key themes from customer feedback" active="themes">
    <div className={styles.page}><section className={styles.content}>
      <div className={styles.summaryGrid}>{cards.map(([title, value, kind]) => <article className={styles.summaryCard} key={title}><span className={`${styles.iconBadge} ${styles[kind]}`}>{kind === "check" ? <CheckCircle2 /> : kind === "trend" ? <TrendingUp /> : <Sparkles />}</span><div><small>{title}</small><strong>{value}</strong><em>Live from workspace</em></div></article>)}<article className={styles.coverage}><span>◔</span><div><small>Feedback assignments</small><strong>{summary?.activeAssignments ?? 0}</strong><em>Live from workspace</em></div></article></div>
      <div className={styles.chartGrid}><article className={styles.card}><header><b>Theme Mentions</b><button>Live <ChevronDown size={14} /></button></header><div className={styles.lineChart}><div className={styles.yAxis}><span>Most</span><span>Active</span><span>Least</span></div><svg viewBox="0 0 500 190" preserveAspectRatio="none"><path d="M4 140 L48 116 L92 127 L136 70 L180 111 L224 60 L268 86 L312 35 L356 78 L400 53 L444 18 L496 41" /></svg><div className={styles.xAxis}><span>Theme activity</span><span>Database data</span></div></div></article><article className={styles.card}><header><b>Theme Distribution</b></header><div className={styles.distribution}><div className={styles.donut}><strong>{summary?.totalThemes ?? 0}<small>Total Themes</small></strong></div><ul>{items.slice(0, 6).map((item, index) => <li key={item.id}><i className={styles[tones[index]]} />{item.name}<b>{item.feedbackCount}</b></li>)}</ul></div></article><article className={styles.card}><header><b>Top Themes</b><button>Live <ChevronDown size={14} /></button></header><div className={styles.sentiment}>{items.slice(0, 5).map((item) => <div key={item.id}><span>{item.name}</span><i><b /><b /><b /></i></div>)}<footer><span>● Feedback volume</span></footer></div></article></div>
      <section className={styles.tableCard}><header><h2>All Themes ({summary?.totalThemes ?? items.length})</h2><div className={styles.tableActions}><label><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search themes..." /></label><button><Upload size={14} /> Export CSV</button><button className={styles.primary} onClick={() => void create()}><Plus size={15} /> Create Theme</button></div></header><div className={styles.tableScroll}><table><thead><tr><th>Theme</th><th>Description</th><th>Mentions</th><th>Status</th><th>First Seen</th><th>Actions</th></tr></thead><tbody>{loading ? <tr><td colSpan={6}>Loading themes…</td></tr> : filtered.map((theme, index) => <tr key={theme.id}><td><span className={`${styles.themeIcon} ${styles[tones[index % tones.length]]}`}>{index % 3 === 0 ? <Lightbulb /> : index % 3 === 1 ? <Link2 /> : <Sparkles />}</span><b>{theme.name}</b></td><td>{theme.description ?? "No description added"}</td><td><b>{theme.feedbackCount}</b></td><td><span className={`${styles.status} ${theme.status === "EMERGING" ? styles.emerging : ""}`}>{label(theme.status)}</span></td><td>{new Date(theme.createdAt).toLocaleDateString()}</td><td className={styles.actions}><button type="button" aria-label="View feedback and analytics" title="View feedback and analytics" onClick={() => void view(theme)}><Eye size={15} /></button><button type="button" aria-label="Edit theme" title="Edit theme" onClick={() => void edit(theme)}><Pencil size={15} /></button><button type="button" aria-label="Delete theme" title="Delete theme" onClick={() => void remove(theme)}><MoreHorizontal size={15} /></button></td></tr>)}</tbody></table></div><footer className={styles.pagination}><span>Showing {filtered.length} of {summary?.totalThemes ?? items.length} themes</span><button className={styles.current}>1</button></footer></section>
    </section><aside className={styles.rightRail}><section className={styles.filters}><header><b>Filters</b><button onClick={() => setSearch("")}>Clear all</button></header><label>Workspace<input value="Current workspace" readOnly /></label><label>Status<select><option>All statuses</option><option>Active</option><option>Emerging</option><option>Resolved</option></select></label><button className={styles.apply} onClick={() => void load()}>Refresh data</button></section><section className={styles.insights}><header><b>AI Theme Insights</b><button>Live</button></header><p><TrendingUp /> {summary?.aiGeneratedThemes ?? 0} AI-generated themes in this workspace.</p><p><span>ⓘ</span> {summary?.manuallyCreatedThemes ?? 0} themes were manually created.</p></section><section className={styles.quick}><b>Quick Actions</b><button onClick={() => void create()}><Sparkles /> Create Theme</button><button><Download /> Download Theme Report</button></section></aside></div>
  </AdminShell>;
}
