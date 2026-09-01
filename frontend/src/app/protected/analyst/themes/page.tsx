"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  Edit3,
  Eye,
  Folder,
  Lightbulb,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Tag,
  TrendingUp,
  X,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";

import {
  archiveTheme,
  createTheme,
  getThemeAnalytics,
  getThemeSummary,
  getThemes,
  restoreTheme,
  updateTheme,
} from "../../../../Features/themes/api/themes.api";
import type {
  CreateThemePayload,
  ThemeAnalyticsResponse,
  ThemeRecord,
  ThemeSentiment,
  ThemeStatus,
} from "../../../../Features/themes/themes.types";
import styles from "./themes.module.css";

const COLORS = [
  "#5b2cf0",
  "#2563eb",
  "#22a66d",
  "#f59e0b",
  "#ef4444",
  "#e45bb9",
  "#64748b",
];

const PAGE_SIZE = 20;

type AnalyticsMap = Record<string, ThemeAnalyticsResponse>;

function number(value: number) {
  return Number(value || 0).toLocaleString("en-IN");
}

function dateText(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : format(date, "MMM dd, yyyy");
}

function rangeText() {
  const end = new Date();
  return `${format(subDays(end, 6), "MMM dd")} – ${format(end, "MMM dd, yyyy")}`;
}

function sentimentLabel(value?: ThemeSentiment) {
  if (value === "POSITIVE") return "Positive";
  if (value === "NEGATIVE") return "Negative";
  if (value === "NEUTRAL") return "Neutral";
  return "Not analyzed";
}

function sentimentClass(value?: ThemeSentiment) {
  if (value === "POSITIVE") return styles.positive;
  if (value === "NEGATIVE") return styles.negative;
  if (value === "NEUTRAL") return styles.neutral;
  return styles.mutedBadge;
}

function enrichTheme(
  theme: ThemeRecord,
  analytics: ThemeAnalyticsResponse | undefined,
  index: number,
  totalMentions: number,
): ThemeRecord {
  const primary = analytics?.sentiment?.[0];

  return {
    ...theme,
    mentions: Number(theme.feedbackCount ?? 0),
    percentage:
      totalMentions > 0
        ? Number(
            ((Number(theme.feedbackCount ?? 0) / totalMentions) * 100).toFixed(
              1,
            ),
          )
        : 0,
    color: theme.color ?? COLORS[index % COLORS.length],
    firstSeen: theme.createdAt,
    sentiment: primary?.sentiment,
    sentimentPercentage: primary?.percentage,
    trend: analytics?.trend?.map((item) => item.count) ?? [],
  };
}

function Donut({ values, total }: { values: number[]; total: number }) {
  const safeTotal = values.reduce((sum, value) => sum + Math.max(0, value), 0);

  if (!safeTotal) {
    return (
      <div className={styles.donutEmpty}>
        0<span>Total</span>
      </div>
    );
  }

  let cursor = 0;
  const stops = values.map((value, index) => {
    const start = (cursor / safeTotal) * 360;
    cursor += Math.max(0, value);
    const end = (cursor / safeTotal) * 360;
    return `${COLORS[index % COLORS.length]} ${start}deg ${end}deg`;
  });

  return (
    <div
      className={styles.donut}
      style={{ background: `conic-gradient(${stops.join(", ")})` }}
      aria-label={`Theme distribution ${total}`}
    >
      <div className={styles.donutInner}>
        <strong>{number(total)}</strong>
        <span>Total Mentions</span>
      </div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (!values.length) return <span className={styles.emptySpark}>—</span>;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 28 - ((value - min) / spread) * 24;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      className={styles.sparkline}
      viewBox="0 0 100 30"
      role="img"
      aria-label="Theme trend"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function MetricCard({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
  tone: string;
}) {
  return (
    <article className={styles.metricCard}>
      <div className={`${styles.metricIcon} ${tone}`}>{icon}</div>
      <div className={styles.metricText}>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{note}</small>
      </div>
    </article>
  );
}

export default function AnalystThemesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ALL" | ThemeStatus>("ALL");
  const [sentiment, setSentiment] = useState<"ALL" | ThemeSentiment>("ALL");
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState({
    totalThemes: 0,
    activeAssignments: 0,
    aiGeneratedThemes: 0,
    manuallyCreatedThemes: 0,
    activeThemes: 0,
    archivedThemes: 0,
  });
  const [themes, setThemes] = useState<ThemeRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [analytics, setAnalytics] = useState<AnalyticsMap>({});
  const [menuId, setMenuId] = useState<string | null>(null);
  const [modal, setModal] = useState<"create" | "edit" | "view" | null>(null);
  const [selected, setSelected] = useState<ThemeRecord | null>(null);
  const [form, setForm] = useState<CreateThemePayload>({
    name: "",
    description: "",
    color: COLORS[0],
  });

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [summaryResult, listResult] = await Promise.all([
        getThemeSummary(),
        getThemes({
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
          status: status === "ALL" ? undefined : status,
        }),
      ]);

      const activeThemes =
        summaryResult.byStatus.find((item) => item.status === "ACTIVE")
          ?.count ?? 0;
      const archivedThemes =
        summaryResult.byStatus.find((item) => item.status === "ARCHIVED")
          ?.count ?? 0;

      setSummary({
        totalThemes: Number(summaryResult.totalThemes ?? 0),
        activeAssignments: Number(summaryResult.activeAssignments ?? 0),
        aiGeneratedThemes: Number(summaryResult.aiGeneratedThemes ?? 0),
        manuallyCreatedThemes: Number(summaryResult.manuallyCreatedThemes ?? 0),
        activeThemes,
        archivedThemes,
      });

      const list = listResult.items ?? [];
      setThemes(list);
      setTotal(Number(listResult.pagination?.total ?? list.length));
      setTotalPages(
        Math.max(1, Number(listResult.pagination?.totalPages ?? 1)),
      );

      const analyticsResults = await Promise.allSettled(
        list.slice(0, 10).map((theme) => getThemeAnalytics(theme.id)),
      );

      const nextAnalytics: AnalyticsMap = {};
      analyticsResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          nextAnalytics[list[index].id] = result.value;
        }
      });
      setAnalytics(nextAnalytics);
    } catch (error) {
      console.error(error);
      toast.error("Unable to load themes from the backend.");
      setThemes([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalMentions = useMemo(
    () =>
      themes.reduce((sum, theme) => sum + Number(theme.feedbackCount ?? 0), 0),
    [themes],
  );

  const enrichedThemes = useMemo(
    () =>
      themes.map((theme, index) =>
        enrichTheme(theme, analytics[theme.id], index, totalMentions),
      ),
    [themes, analytics, totalMentions],
  );

  const filteredThemes = useMemo(() => {
    if (sentiment === "ALL") return enrichedThemes;
    return enrichedThemes.filter((theme) => theme.sentiment === sentiment);
  }, [enrichedThemes, sentiment]);

  const distribution = useMemo(() => {
    const sorted = [...enrichedThemes]
      .sort((a, b) => Number(b.mentions ?? 0) - Number(a.mentions ?? 0))
      .slice(0, 7);

    return sorted.map((theme, index) => ({
      name: theme.name,
      mentions: Number(theme.mentions ?? 0),
      percentage: totalMentions
        ? Number(
            ((Number(theme.mentions ?? 0) / totalMentions) * 100).toFixed(1),
          )
        : 0,
      color: theme.color ?? COLORS[index % COLORS.length],
    }));
  }, [enrichedThemes, totalMentions]);

  const sentimentRows = useMemo(() => {
    return enrichedThemes.slice(0, 5).map((theme) => {
      const data = analytics[theme.id];
      const values = {
        positive:
          data?.sentiment.find((item) => item.sentiment === "POSITIVE")
            ?.percentage ?? 0,
        neutral:
          data?.sentiment.find((item) => item.sentiment === "NEUTRAL")
            ?.percentage ?? 0,
        negative:
          data?.sentiment.find((item) => item.sentiment === "NEGATIVE")
            ?.percentage ?? 0,
      };
      return { name: theme.name, ...values };
    });
  }, [enrichedThemes, analytics]);

  const openCreate = () => {
    setSelected(null);
    setForm({ name: "", description: "", color: COLORS[0] });
    setModal("create");
  };

  const openEdit = (theme: ThemeRecord) => {
    setSelected(theme);
    setForm({
      name: theme.name,
      description: theme.description ?? "",
      color: theme.color ?? COLORS[0],
    });
    setMenuId(null);
    setModal("edit");
  };

  const openView = (theme: ThemeRecord) => {
    setSelected(theme);
    setMenuId(null);
    setModal("view");
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();

    if (name.length < 2) {
      toast.error("Theme name must contain at least 2 characters.");
      return;
    }

    setSaving(true);
    try {
      if (modal === "create") {
        await createTheme({
          name,
          description: form.description?.trim() || null,
          color: form.color || null,
          status: "ACTIVE",
        });
        toast.success("Theme created.");
      } else if (modal === "edit" && selected) {
        await updateTheme(selected.id, {
          name,
          description: form.description?.trim() || null,
          color: form.color || null,
        });
        toast.success("Theme updated.");
      }

      setModal(null);
      setSelected(null);
      await load();
    } catch (error) {
      console.error(error);
      toast.error("Could not save the theme.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleArchive(theme: ThemeRecord) {
    setMenuId(null);
    try {
      if (theme.status === "ACTIVE") {
        await archiveTheme(theme.id);
        toast.success(`${theme.name} archived.`);
      } else {
        await restoreTheme(theme.id);
        toast.success(`${theme.name} restored.`);
      }
      await load();
    } catch (error) {
      console.error(error);
      toast.error("Could not update theme status.");
    }
  }

  function exportCsv() {
    const rows = filteredThemes.map((theme) => [
      theme.name,
      theme.description ?? "",
      theme.mentions ?? 0,
      theme.percentage ?? 0,
      sentimentLabel(theme.sentiment),
      theme.status,
      dateText(theme.firstSeen),
    ]);

    const csv = [
      [
        "Theme",
        "Description",
        "Mentions",
        "% of Total",
        "Sentiment",
        "Status",
        "First Seen",
      ],
      ...rows,
    ]
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `loop-themes-${Date.now()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const coverage = summary.totalThemes
    ? Math.min(
        100,
        Math.round(
          (summary.activeAssignments / Math.max(summary.totalThemes, 1)) * 100,
        ),
      )
    : 0;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <div className={styles.pageTitleRow}>
            <h1>Themes</h1>
            <Sparkles size={20} />
          </div>
          <p>Discover and analyze key themes from customer feedback</p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.dateButton} type="button">
            <span>{rangeText()}</span>
            <CalendarDays size={16} />
          </button>
          <button
            className={styles.iconButton}
            type="button"
            aria-label="Notifications"
          >
            ♧<sup>3</sup>
          </button>
          <button className={styles.iconButton} type="button" aria-label="Help">
            ?
          </button>
          <div className={styles.profile}>
            <div className={styles.avatar}>AT</div>
            <div className={styles.profileText}>
              <strong>Alex Thompson</strong>
              <span>Analyst</span>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>
      </header>

      {loading && (
        <div className={styles.loadingBar}>
          <span />
        </div>
      )}

      <section className={styles.metrics}>
        <MetricCard
          icon={<Folder size={19} />}
          label="Total Themes"
          value={number(summary.totalThemes)}
          note="Workspace themes"
          tone={styles.purple}
        />
        <MetricCard
          icon={<Tag size={19} />}
          label="Active Themes"
          value={number(summary.activeThemes)}
          note="Currently active"
          tone={styles.blue}
        />
        <MetricCard
          icon={<TrendingUp size={19} />}
          label="AI Generated"
          value={number(summary.aiGeneratedThemes)}
          note="AI-created themes"
          tone={styles.orange}
        />
        <MetricCard
          icon={<CheckCircle2 size={19} />}
          label="Archived Themes"
          value={number(summary.archivedThemes)}
          note="Archived themes"
          tone={styles.green}
        />
        <MetricCard
          icon={<BarChart3 size={19} />}
          label="Coverage"
          value={`${coverage}%`}
          note={`${number(summary.activeAssignments)} feedback assignments`}
          tone={styles.pink}
        />
      </section>

      <section className={styles.chartGrid}>
        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Theme Mentions Over Time</h2>
            <span className={styles.smallPill}>Live</span>
          </div>
          <div className={styles.trendList}>
            {enrichedThemes.slice(0, 5).map((theme) => (
              <div className={styles.trendRow} key={theme.id}>
                <span>{theme.name}</span>
                <div className={styles.trendVisual}>
                  <Sparkline values={theme.trend ?? []} />
                  <b>{number(theme.mentions ?? 0)}</b>
                </div>
              </div>
            ))}
            {!enrichedThemes.length && (
              <div className={styles.emptyChart}>No theme data yet.</div>
            )}
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Theme Distribution</h2>
          </div>
          <div className={styles.distribution}>
            <Donut
              values={distribution.map((item) => item.mentions)}
              total={totalMentions}
            />
            <div className={styles.legendList}>
              {distribution.map((item) => (
                <div key={item.name}>
                  <span>
                    <i style={{ background: item.color }} />
                    {item.name}
                  </span>
                  <b>
                    {item.percentage}% ({number(item.mentions)})
                  </b>
                </div>
              ))}
              {!distribution.length && (
                <p className={styles.emptyText}>No distribution data.</p>
              )}
            </div>
          </div>
        </article>

        <article className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Top Themes by Sentiment</h2>
          </div>
          <div className={styles.sentimentChart}>
            {sentimentRows.map((row) => (
              <div className={styles.sentimentRow} key={row.name}>
                <span>{row.name}</span>
                <div className={styles.stackedBar}>
                  <i
                    className={styles.positiveBar}
                    style={{ width: `${row.positive}%` }}
                  />
                  <i
                    className={styles.neutralBar}
                    style={{ width: `${row.neutral}%` }}
                  />
                  <i
                    className={styles.negativeBar}
                    style={{ width: `${row.negative}%` }}
                  />
                </div>
              </div>
            ))}
            {!sentimentRows.length && (
              <div className={styles.emptyChart}>
                Sentiment is not available yet.
              </div>
            )}
          </div>
          <div className={styles.sentimentLegend}>
            <span>
              <i className={styles.positiveDot} />
              Positive
            </span>
            <span>
              <i className={styles.neutralDot} />
              Neutral
            </span>
            <span>
              <i className={styles.negativeDot} />
              Negative
            </span>
          </div>
        </article>
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.mainColumn}>
          <article className={`${styles.card} ${styles.tableCard}`}>
            <div className={styles.tableToolbar}>
              <div>
                <h2>
                  All Themes <em>({number(total)})</em>
                </h2>
                <span className={styles.toolbarHint}>
                  Data from the current workspace
                </span>
              </div>
              <div className={styles.toolbarActions}>
                <label className={styles.searchBox}>
                  <Search size={15} />
                  <input
                    value={search}
                    onChange={(event) => {
                      setPage(1);
                      setSearch(event.target.value);
                    }}
                    placeholder="Search themes..."
                  />
                </label>
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={exportCsv}
                >
                  <Download size={15} />
                  Export CSV
                </button>
                <button
                  className={styles.primaryButton}
                  type="button"
                  onClick={openCreate}
                >
                  <Plus size={16} />
                  Create Theme
                </button>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Theme</th>
                    <th>Description</th>
                    <th>Mentions</th>
                    <th>% of Total</th>
                    <th>Sentiment</th>
                    <th>Trend</th>
                    <th>Status</th>
                    <th>First Seen</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredThemes.map((theme, index) => (
                    <tr key={theme.id}>
                      <td>
                        <div className={styles.themeName}>
                          <span
                            style={{
                              background:
                                theme.color ?? COLORS[index % COLORS.length],
                            }}
                          >
                            <Tag size={14} />
                          </span>
                          <strong>{theme.name}</strong>
                        </div>
                      </td>
                      <td className={styles.description}>
                        {theme.description || "—"}
                      </td>
                      <td>
                        <strong>{number(theme.mentions ?? 0)}</strong>
                      </td>
                      <td>{theme.percentage ?? 0}%</td>
                      <td>
                        <span
                          className={`${styles.badge} ${sentimentClass(theme.sentiment)}`}
                        >
                          {sentimentLabel(theme.sentiment)}
                          {theme.sentimentPercentage
                            ? ` (${Math.round(theme.sentimentPercentage)}%)`
                            : ""}
                        </span>
                      </td>
                      <td>
                        <Sparkline values={theme.trend ?? []} />
                      </td>
                      <td>
                        <span
                          className={`${styles.badge} ${theme.status === "ACTIVE" ? styles.activeBadge : styles.archivedBadge}`}
                        >
                          {theme.status === "ACTIVE" ? "Active" : "Archived"}
                        </span>
                      </td>
                      <td>{dateText(theme.firstSeen)}</td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button
                            type="button"
                            aria-label={`View ${theme.name}`}
                            onClick={() => openView(theme)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Edit ${theme.name}`}
                            onClick={() => openEdit(theme)}
                          >
                            <Edit3 size={15} />
                          </button>
                          <div className={styles.menuWrap}>
                            <button
                              type="button"
                              aria-label="More actions"
                              onClick={() =>
                                setMenuId(menuId === theme.id ? null : theme.id)
                              }
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {menuId === theme.id && (
                              <div className={styles.actionMenu}>
                                <button
                                  type="button"
                                  onClick={() => openView(theme)}
                                >
                                  View details
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEdit(theme)}
                                >
                                  Edit theme
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void toggleArchive(theme)}
                                >
                                  {theme.status === "ACTIVE"
                                    ? "Archive"
                                    : "Restore"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!filteredThemes.length && (
                    <tr>
                      <td colSpan={9}>
                        <div className={styles.emptyTable}>
                          <Lightbulb size={28} />
                          <strong>No themes found</strong>
                          <span>Try another search or create a new theme.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className={styles.tableFooter}>
              <span>
                Showing {filteredThemes.length} of {number(total)} themes
              </span>
              <div className={styles.pagination}>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  ‹
                </button>
                <button type="button" className={styles.currentPage}>
                  {page}
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                >
                  ›
                </button>
              </div>
              <span className={styles.pageCount}>
                {totalPages} page{totalPages === 1 ? "" : "s"}
              </span>
            </footer>
          </article>
        </div>

        <aside className={styles.rail}>
          <article className={styles.card}>
            <div className={styles.railHeader}>
              <h2>Filters</h2>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("ALL");
                  setSentiment("ALL");
                  setPage(1);
                }}
              >
                Clear all
              </button>
            </div>

            <label>
              Workspace
              <input value="Current Workspace" readOnly />
            </label>
            <label>
              Date Range
              <div className={styles.inputLike}>
                {rangeText()} <CalendarDays size={14} />
              </div>
            </label>
            <label>
              Status
              <select
                value={status}
                onChange={(event) => {
                  setPage(1);
                  setStatus(event.target.value as "ALL" | ThemeStatus);
                }}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            <label>
              Sentiment
              <select
                value={sentiment}
                onChange={(event) =>
                  setSentiment(event.target.value as "ALL" | ThemeSentiment)
                }
              >
                <option value="ALL">All Sentiments</option>
                <option value="POSITIVE">Positive</option>
                <option value="NEUTRAL">Neutral</option>
                <option value="NEGATIVE">Negative</option>
              </select>
            </label>
            <button
              className={styles.applyButton}
              type="button"
              onClick={() => void load()}
            >
              Apply Filters
            </button>
          </article>

          <article className={styles.card}>
            <div className={styles.railHeader}>
              <h2>AI Theme Insights</h2>
              <Sparkles size={15} />
            </div>
            <div className={styles.insight}>
              <div className={styles.insightIcon}>
                <TrendingUp size={15} />
              </div>
              <div>
                <strong>
                  {number(summary.aiGeneratedThemes)} AI-generated themes
                </strong>
                <p>AI-generated themes currently exist in this workspace.</p>
              </div>
            </div>
            <div className={styles.insight}>
              <div className={styles.insightIcon}>
                <CheckCircle2 size={15} />
              </div>
              <div>
                <strong>{number(summary.activeThemes)} active themes</strong>
                <p>
                  These themes are available for current feedback
                  classification.
                </p>
              </div>
            </div>
            <div className={styles.insight}>
              <div className={styles.insightIcon}>
                <BarChart3 size={15} />
              </div>
              <div>
                <strong>{number(summary.activeAssignments)} assignments</strong>
                <p>Feedback-to-theme assignments recorded by the backend.</p>
              </div>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.railHeader}>
              <h2>Quick Actions</h2>
            </div>
            <button
              className={styles.quickAction}
              type="button"
              onClick={openCreate}
            >
              <Plus size={16} />
              Create Theme
            </button>
            <button
              className={styles.quickAction}
              type="button"
              onClick={exportCsv}
            >
              <Download size={16} />
              Export Current Themes
            </button>
          </article>
        </aside>
      </section>

      {modal && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={() => !saving && setModal(null)}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2>
                  {modal === "create"
                    ? "Create Theme"
                    : modal === "edit"
                      ? "Edit Theme"
                      : "Theme Details"}
                </h2>
                <p>
                  {modal === "view"
                    ? "Theme information from the current workspace."
                    : "Changes are saved to the LOOP backend."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModal(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {modal === "view" && selected ? (
              <div className={styles.details}>
                <div
                  className={styles.detailIcon}
                  style={{ background: selected.color ?? COLORS[0] }}
                >
                  <Tag size={22} />
                </div>
                <h3>{selected.name}</h3>
                <p>{selected.description || "No description"}</p>
                <div className={styles.detailGrid}>
                  <span>
                    Mentions<strong>{number(selected.feedbackCount)}</strong>
                  </span>
                  <span>
                    Status<strong>{selected.status}</strong>
                  </span>
                  <span>
                    AI Generated
                    <strong>{selected.isAiGenerated ? "Yes" : "No"}</strong>
                  </span>
                  <span>
                    Created<strong>{dateText(selected.createdAt)}</strong>
                  </span>
                </div>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <label>
                  Theme Name
                  <input
                    value={form.name}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        name: event.target.value,
                      }))
                    }
                    maxLength={100}
                    required
                  />
                </label>
                <label>
                  Description
                  <textarea
                    value={form.description ?? ""}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        description: event.target.value,
                      }))
                    }
                    rows={4}
                    maxLength={500}
                  />
                </label>
                <label>
                  Color
                  <input
                    type="color"
                    value={form.color ?? COLORS[0]}
                    onChange={(event) =>
                      setForm((value) => ({
                        ...value,
                        color: event.target.value,
                      }))
                    }
                  />
                </label>
                <div className={styles.modalActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => setModal(null)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.primaryButton}
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : modal === "create"
                        ? "Create Theme"
                        : "Save Changes"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
