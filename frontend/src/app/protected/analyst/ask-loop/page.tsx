"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { apiClient } from "../../../../lib/api/api-client";

import styles from "./ask-loop.module.css";

/* =========================================================
   TYPES
   ========================================================= */

type ChartType =
  | "bar"
  | "line"
  | "pie"
  | "none";

type AskLoopChart = {
  type: ChartType;
  title: string;
  labels: string[];
  values: number[];
};

type AskLoopCitation = {
  feedbackId: string;
  content: string;
  sentiment: string;
  source: string;
  relevance: number;
};

type AskLoopMessage = {
  id: string;
  conversationId: string;
  role:
    | "USER"
    | "ASSISTANT"
    | "SYSTEM";
  content: string;
  chart?: AskLoopChart;
  metadata?: Record<string, unknown>;
  promptTokens?: number;
  completionTokens?: number;
  createdAt: string;
};

type AskLoopAnswer = {
  conversationId: string;
  messageId: string;
  answer: string;
  summary?: string;
  chart?: AskLoopChart;
  followUpQuestions: string[];
  citations?: AskLoopCitation[];
  createdAt: string;
};

type ConversationSummary = {
  id: string;
  title: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
};

type ConversationListResponse = {
  items: ConversationSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type ConversationDetails = ConversationSummary & {
  messages: AskLoopMessage[];
};

type SavedQuery = {
  id: string;
  workspaceId: string;
  userId: string;
  question: string;
  label: string | null;
  createdAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

type AskResponse = ApiResponse<AskLoopAnswer>;

type ConversationResponse =
  ApiResponse<ConversationDetails>;

type ConversationListApiResponse =
  ApiResponse<ConversationListResponse>;

type SavedQueriesResponse =
  ApiResponse<SavedQuery[]>;

type SuggestionsResponse =
  ApiResponse<string[]>;

/* =========================================================
   ICONS
   No extra icon package required.
   ========================================================= */

function Icon({
  name,
  size = 20,
}: {
  name:
    | "sparkles"
    | "bell"
    | "help"
    | "calendar"
    | "send"
    | "bookmark"
    | "report"
    | "download"
    | "expand"
    | "thumbUp"
    | "thumbDown"
    | "clock"
    | "message"
    | "trash"
    | "plus"
    | "chevronDown"
    | "chevronRight"
    | "menu"
    | "search"
    | "database"
    | "lightbulb";
  size?: number;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "sparkles":
      return (
        <svg {...common}>
          <path d="m12 3-1.2 4.3L7 8.5l3.8 1.2L12 14l1.2-4.3L17 8.5l-3.8-1.2L12 3Z" />
          <path d="m19 14-.7 2.3L16 17l2.3.7L19 20l.7-2.3L22 17l-2.3-.7L19 14Z" />
          <path d="m5 15-.7 2.3L2 18l2.3.7L5 21l.7-2.3L8 18l-2.3-.7L5 15Z" />
        </svg>
      );

    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case "help":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M9.7 9a2.4 2.4 0 1 1 4.4 1.4c-.8 1.1-2.1 1.3-2.1 2.9" />
          <path d="M12 17h.01" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M7 2.5v4M17 2.5v4M3 9h18" />
        </svg>
      );

    case "send":
      return (
        <svg {...common}>
          <path d="m21 3-7.5 18-3.8-7-7-3.8L21 3Z" />
          <path d="M10 14 15 9" />
        </svg>
      );

    case "bookmark":
      return (
        <svg {...common}>
          <path d="M6 4.5A2.5 2.5 0 0 1 8.5 2h7A2.5 2.5 0 0 1 18 4.5V21l-6-3-6 3V4.5Z" />
        </svg>
      );

    case "report":
      return (
        <svg {...common}>
          <path d="M5 3h10l4 4v14H5z" />
          <path d="M14 3v5h5M8 13h8M8 17h6" />
        </svg>
      );

    case "download":
      return (
        <svg {...common}>
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      );

    case "expand":
      return (
        <svg {...common}>
          <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M3 16v5h5" />
          <path d="m3 8 5-5M16 3l5 5M21 16l-5 5M8 21l-5-5" />
        </svg>
      );

    case "thumbUp":
      return (
        <svg {...common}>
          <path d="M7 10v10H4a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2h3Z" />
          <path d="M7 20h9.2a2 2 0 0 0 1.9-1.4l2-6A2 2 0 0 0 18.2 10H14l.8-3.2A2.2 2.2 0 0 0 12.7 4L7 10" />
        </svg>
      );

    case "thumbDown":
      return (
        <svg {...common}>
          <path d="M7 14V4H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h3Z" />
          <path d="M7 4h9.2a2 2 0 0 1 1.9 1.4l2 6a2 2 0 0 1-1.9 2.6H14l.8 3.2a2.2 2.2 0 0 1-2.1 2.8L7 14" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "message":
      return (
        <svg {...common}>
          <path d="M4 5h16v11H8l-4 4V5Z" />
          <path d="M8 9h8M8 12h5" />
        </svg>
      );

    case "trash":
      return (
        <svg {...common}>
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14M5 12h14" />
        </svg>
      );

    case "chevronDown":
      return (
        <svg {...common}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      );

    case "chevronRight":
      return (
        <svg {...common}>
          <path d="m9 6 6 6-6 6" />
        </svg>
      );

    case "menu":
      return (
        <svg {...common}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="10.8" cy="10.8" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
      );

    case "database":
      return (
        <svg {...common}>
          <ellipse cx="12" cy="5" rx="7" ry="3" />
          <path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
          <path d="M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7" />
        </svg>
      );

    case "lightbulb":
      return (
        <svg {...common}>
          <path d="M9 18h6M10 22h4" />
          <path d="M8.5 15.5A7 7 0 1 1 15.5 16c-.7.6-1.2 1.2-1.4 2H10c-.3-.9-.8-1.6-1.5-2.5Z" />
        </svg>
      );

    default:
      return null;
  }
}

/* =========================================================
   HELPERS
   ========================================================= */

function getApiErrorMessage(
  error: unknown,
): string {
  const candidate = error as {
    response?: {
      data?: {
        message?: string;
        error?: string;
      };
    };
    message?: string;
  };

  return (
    candidate.response?.data?.message ??
    candidate.response?.data?.error ??
    candidate.message ??
    "Something went wrong. Please try again."
  );
}

function formatTime(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toInputDate(
  date: Date,
): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");
  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 6);
  return toInputDate(date);
}

function getDefaultEndDate(): string {
  return toInputDate(new Date());
}

function formatSource(
  source: string,
): string {
  return source
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

function formatSentiment(
  sentiment: string,
): string {
  return sentiment
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

function getChartTotal(
  chart?: AskLoopChart,
): number {
  if (!chart) return 0;

  return chart.values.reduce(
    (sum, value) => sum + value,
    0,
  );
}

/* =========================================================
   DONUT CHART
   ========================================================= */

function DonutChart({
  chart,
}: {
  chart: AskLoopChart;
}) {
  const total = getChartTotal(chart);

  if (
    total === 0 ||
    chart.values.length === 0
  ) {
    return (
      <div className={styles.emptyChart}>
        No chart data returned.
      </div>
    );
  }

  const colors = [
    "#5b2bee",
    "#2563eb",
    "#22a866",
    "#f59e0b",
    "#ec4899",
    "#94a3b8",
  ];

  let current = 0;

  const gradientParts = chart.values.map(
    (value, index) => {
      const start = current;
      const percentage =
        (value / total) * 100;

      current += percentage;

      return `${colors[index % colors.length]} ${start}% ${current}%`;
    },
  );

  return (
    <div className={styles.chartArea}>
      <div
        className={styles.donut}
        style={{
          background: `conic-gradient(${gradientParts.join(
            ", ",
          )})`,
        }}
      >
        <div className={styles.donutInner}>
          <strong>
            {total.toLocaleString()}
          </strong>
          <span>Total</span>
        </div>
      </div>

      <div className={styles.chartLegend}>
        {chart.labels.map(
          (label, index) => {
            const value =
              chart.values[index] ?? 0;

            const percentage =
              total > 0
                ? Math.round(
                    (value / total) * 100,
                  )
                : 0;

            return (
              <div
                className={styles.legendRow}
                key={`${label}-${index}`}
              >
                <span
                  className={styles.legendDot}
                  style={{
                    background:
                      colors[
                        index %
                          colors.length
                      ],
                  }}
                />

                <span className={styles.legendLabel}>
                  {label}
                </span>

                <strong>
                  {percentage}% ({value})
                </strong>
              </div>
            );
          },
        )}
      </div>
    </div>
  );
}

/* =========================================================
   BAR / LINE CHART
   ========================================================= */

function BarChart({
  chart,
}: {
  chart: AskLoopChart;
}) {
  const max =
    Math.max(...chart.values, 1);

  return (
    <div className={styles.barChart}>
      {chart.labels.map(
        (label, index) => {
          const value =
            chart.values[index] ?? 0;

          const width =
            (value / max) * 100;

          return (
            <div
              className={styles.barRow}
              key={`${label}-${index}`}
            >
              <div className={styles.barLabel}>
                {label}
              </div>

              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{
                    width: `${width}%`,
                  }}
                />
              </div>

              <strong>
                {value.toLocaleString()}
              </strong>
            </div>
          );
        },
      )}
    </div>
  );
}

function AnswerChart({
  chart,
}: {
  chart?: AskLoopChart;
}) {
  if (!chart || chart.type === "none") {
    return null;
  }

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <h4>{chart.title || "Analysis"}</h4>

        <button
          type="button"
          className={styles.iconOnlyButton}
          title="Expand chart"
        >
          <Icon
            name="expand"
            size={16}
          />
        </button>
      </div>

      {chart.type === "pie" ? (
        <DonutChart chart={chart} />
      ) : (
        <BarChart chart={chart} />
      )}
    </div>
  );
}

/* =========================================================
   PAGE
   ========================================================= */

export default function AskLoopPage() {
  const [question, setQuestion] =
    useState("");

  const [conversationId, setConversationId] =
    useState<string | undefined>();

  const [messages, setMessages] =
    useState<AskLoopMessage[]>([]);

  const [conversations, setConversations] =
    useState<ConversationSummary[]>([]);

  const [savedQueries, setSavedQueries] =
    useState<SavedQuery[]>([]);

  const [suggestions, setSuggestions] =
    useState<string[]>([]);

  const [activeTab, setActiveTab] =
    useState<
      "chat" | "saved" | "suggestions"
    >("chat");

  const [startDate, setStartDate] =
    useState(getDefaultStartDate);

  const [endDate, setEndDate] =
    useState(getDefaultEndDate);

  const [loading, setLoading] =
    useState(false);

  const [initialLoading, setInitialLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [feedbackState, setFeedbackState] =
    useState<
      Record<string, boolean | null>
    >({});

  const [savingQuery, setSavingQuery] =
    useState(false);

  /* =======================================================
     LOAD CONVERSATIONS
     ======================================================= */

  const loadConversations =
    useCallback(async () => {
      const response =
        await apiClient.get<ConversationListApiResponse>(
          "/ask-loop/conversations",
          {
            params: {
              page: 1,
              limit: 20,
            },
          },
        );

      setConversations(
        response.data.data.items,
      );
    }, []);

  /* =======================================================
     LOAD SAVED QUERIES
     ======================================================= */

  const loadSavedQueries =
    useCallback(async () => {
      const response =
        await apiClient.get<SavedQueriesResponse>(
          "/ask-loop/saved-queries",
        );

      setSavedQueries(
        response.data.data,
      );
    }, []);

  /* =======================================================
     LOAD SUGGESTIONS
     ======================================================= */

  const loadSuggestions =
    useCallback(async () => {
      const response =
        await apiClient.get<SuggestionsResponse>(
          "/ask-loop/suggestions",
        );

      setSuggestions(
        response.data.data,
      );
    }, []);

  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setInitialLoading(true);

        await Promise.all([
          loadConversations(),
          loadSavedQueries(),
          loadSuggestions(),
        ]);
      } catch (loadError) {
        if (mounted) {
          setError(
            getApiErrorMessage(
              loadError,
            ),
          );
        }
      } finally {
        if (mounted) {
          setInitialLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, [
    loadConversations,
    loadSavedQueries,
    loadSuggestions,
  ]);

  /* =======================================================
     LOAD CONVERSATION
     ======================================================= */

  async function openConversation(
    id: string,
  ) {
    try {
      setError(null);
      setInitialLoading(true);

      const response =
        await apiClient.get<ConversationResponse>(
          `/ask-loop/conversations/${id}`,
        );

      const conversation =
        response.data.data;

      setConversationId(
        conversation.id,
      );

      setMessages(
        conversation.messages,
      );

      setActiveTab("chat");
    } catch (loadError) {
      setError(
        getApiErrorMessage(
          loadError,
        ),
      );
    } finally {
      setInitialLoading(false);
    }
  }

  /* =======================================================
     ASK LOOP
     ======================================================= */

  async function handleSubmit(
    event?: FormEvent,
  ) {
    event?.preventDefault();

    const cleanQuestion =
      question.trim();

    if (
      !cleanQuestion ||
      loading
    ) {
      return;
    }

    setError(null);
    setLoading(true);

    const temporaryUserMessage: AskLoopMessage =
      {
        id: `temporary-user-${Date.now()}`,
        conversationId:
          conversationId ?? "temporary",
        role: "USER",
        content: cleanQuestion,
        createdAt:
          new Date().toISOString(),
      };

    setMessages((current) => [
      ...current,
      temporaryUserMessage,
    ]);

    setQuestion("");

    try {
      const response =
        await apiClient.post<AskResponse>(
          "/ask-loop/ask",
          {
            question:
              cleanQuestion,

            ...(conversationId
              ? {
                  conversationId,
                }
              : {}),

            ...(startDate
              ? {
                  startDate:
                    new Date(
                      `${startDate}T00:00:00`,
                    ).toISOString(),
                }
              : {}),

            ...(endDate
              ? {
                  endDate:
                    new Date(
                      `${endDate}T23:59:59.999`,
                    ).toISOString(),
                }
              : {}),
          },
        );

      const answer =
        response.data.data;

      setConversationId(
        answer.conversationId,
      );

      const assistantMessage: AskLoopMessage =
        {
          id: answer.messageId,
          conversationId:
            answer.conversationId,
          role: "ASSISTANT",
          content: answer.answer,
          chart: answer.chart,
          metadata: {
            summary:
              answer.summary ??
              null,
            followUpQuestions:
              answer.followUpQuestions,
          },
          createdAt:
            answer.createdAt,
        };

      setMessages((current) => [
        ...current.filter(
          (message) =>
            message.id !==
            temporaryUserMessage.id,
        ),
        {
          ...temporaryUserMessage,
          conversationId:
            answer.conversationId,
        },
        assistantMessage,
      ]);

      await loadConversations();
    } catch (askError) {
      setMessages((current) =>
        current.filter(
          (message) =>
            message.id !==
            temporaryUserMessage.id,
        ),
      );

      setError(
        getApiErrorMessage(
          askError,
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     QUICK QUESTION
     ======================================================= */

  function askSuggestedQuestion(
    value: string,
  ) {
    setQuestion(value);
    setActiveTab("chat");
  }

  /* =======================================================
     NEW CHAT
     ======================================================= */

  function startNewConversation() {
    setConversationId(undefined);
    setMessages([]);
    setQuestion("");
    setError(null);
    setActiveTab("chat");
  }

  /* =======================================================
     DELETE CONVERSATION
     ======================================================= */

  async function deleteConversation(
    id: string,
  ) {
    try {
      setError(null);

      await apiClient.delete(
        `/ask-loop/conversations/${id}`,
      );

      setConversations(
        (current) =>
          current.filter(
            (item) =>
              item.id !== id,
          ),
      );

      if (conversationId === id) {
        startNewConversation();
      }
    } catch (deleteError) {
      setError(
        getApiErrorMessage(
          deleteError,
        ),
      );
    }
  }

  /* =======================================================
     SAVE QUERY
     ======================================================= */

  async function saveCurrentQuery() {
    const cleanQuestion =
      question.trim();

    /*
     * If the input is empty, save the
     * latest USER message instead.
     */
    const value =
      cleanQuestion ||
      [...messages]
        .reverse()
        .find(
          (message) =>
            message.role === "USER",
        )?.content ||
      "";

    if (!value || savingQuery) {
      return;
    }

    try {
      setSavingQuery(true);
      setError(null);

      const response =
        await apiClient.post<
          ApiResponse<SavedQuery>
        >(
          "/ask-loop/saved-queries",
          {
            question: value,
          },
        );

      setSavedQueries(
        (current) => [
          response.data.data,
          ...current,
        ],
      );
    } catch (saveError) {
      setError(
        getApiErrorMessage(
          saveError,
        ),
      );
    } finally {
      setSavingQuery(false);
    }
  }

  /* =======================================================
     DELETE SAVED QUERY
     ======================================================= */

  async function deleteSavedQuery(
    id: string,
  ) {
    try {
      setError(null);

      await apiClient.delete(
        `/ask-loop/saved-queries/${id}`,
      );

      setSavedQueries(
        (current) =>
          current.filter(
            (query) =>
              query.id !== id,
          ),
      );
    } catch (deleteError) {
      setError(
        getApiErrorMessage(
          deleteError,
        ),
      );
    }
  }

  /* =======================================================
     MESSAGE FEEDBACK
     ======================================================= */

  async function submitMessageFeedback(
    messageId: string,
    helpful: boolean,
  ) {
    try {
      setFeedbackState(
        (current) => ({
          ...current,
          [messageId]: helpful,
        }),
      );

      await apiClient.post(
        `/ask-loop/messages/${messageId}/feedback`,
        {
          helpful,
        },
      );
    } catch (feedbackError) {
      setFeedbackState(
        (current) => ({
          ...current,
          [messageId]: null,
        }),
      );

      setError(
        getApiErrorMessage(
          feedbackError,
        ),
      );
    }
  }

  /* =======================================================
     LATEST ASSISTANT MESSAGE
     ======================================================= */

  const latestAssistant =
    useMemo(
      () =>
        [...messages]
          .reverse()
          .find(
            (message) =>
              message.role ===
              "ASSISTANT",
          ),
      [messages],
    );

  /* =======================================================
     DATA CONTEXT
     ======================================================= */

  const contextTotal =
    latestAssistant?.chart
      ? getChartTotal(
          latestAssistant.chart,
        )
      : null;

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className={styles.page}>
      {/* =================================================
          HEADER
          ================================================= */}

      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <button
            type="button"
            className={styles.mobileMenu}
            aria-label="Open menu"
          >
            <Icon
              name="menu"
              size={23}
            />
          </button>

          <div>
            <div
              className={
                styles.titleWithIcon
              }
            >
              <h1>Ask LOOP AI</h1>

              <span
                className={
                  styles.titleSparkle
                }
              >
                <Icon
                  name="sparkles"
                  size={20}
                />
              </span>
            </div>

            <p>
              Ask questions about your
              customer feedback and get
              AI-powered insights
            </p>
          </div>
        </div>

        <div
          className={
            styles.headerActions
          }
        >
          <div
            className={
              styles.dateRange
            }
          >
            <Icon
              name="calendar"
              size={16}
            />

            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(event) =>
                setStartDate(
                  event.target.value,
                )
              }
            />

            <span>–</span>

            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(event) =>
                setEndDate(
                  event.target.value,
                )
              }
            />
          </div>

          <button
            type="button"
            className={
              styles.headerIconButton
            }
            aria-label="Notifications"
          >
            <Icon
              name="bell"
              size={20}
            />

            <span
              className={
                styles.notificationBadge
              }
            >
              3
            </span>
          </button>

          <button
            type="button"
            className={
              styles.headerIconButton
            }
            aria-label="Help"
          >
            <Icon
              name="help"
              size={20}
            />
          </button>

          <div
            className={
              styles.userHeader
            }
          >
            <div
              className={
                styles.avatar
              }
            >
              A
            </div>

            <div>
              <strong>
                Analyst
              </strong>

              <span>
                Analyst
              </span>
            </div>

            <Icon
              name="chevronDown"
              size={15}
            />
          </div>
        </div>
      </header>

      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div
          className={styles.errorBanner}
          role="alert"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError(null)
            }
          >
            ×
          </button>
        </div>
      )}

      {/* =================================================
          MAIN LAYOUT
          ================================================= */}

      <div className={styles.layout}>
        {/* ===============================================
            LEFT / MAIN
            =============================================== */}

        <section
          className={
            styles.mainColumn
          }
        >
          {/* =============================================
              ASK BOX
              ============================================= */}

          <section
            className={
              styles.askCard
            }
          >
            <div
              className={
                styles.askCardHeader
              }
            >
              <h2>
                Ask a question about
                your feedback
              </h2>
            </div>

            <form
              onSubmit={handleSubmit}
              className={
                styles.questionForm
              }
            >
              <input
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value,
                  )
                }
                placeholder="Ask anything about your customer feedback..."
                maxLength={2000}
                disabled={loading}
              />

              <button
                type="submit"
                disabled={
                  loading ||
                  !question.trim()
                }
                className={
                  styles.sendButton
                }
                aria-label="Ask LOOP AI"
              >
                {loading ? (
                  <span
                    className={
                      styles.spinner
                    }
                  />
                ) : (
                  <Icon
                    name="send"
                    size={20}
                  />
                )}
              </button>
            </form>

            <div
              className={
                styles.examples
              }
            >
              <span>
                Try these examples:
              </span>

              <div
                className={
                  styles.exampleList
                }
              >
                {suggestions
                  .slice(0, 4)
                  .map(
                    (suggestion) => (
                      <button
                        key={
                          suggestion
                        }
                        type="button"
                        onClick={() =>
                          askSuggestedQuestion(
                            suggestion,
                          )
                        }
                      >
                        {suggestion}
                      </button>
                    ),
                  )}
              </div>
            </div>
          </section>

          {/* =============================================
              TABS
              ============================================= */}

          <div
            className={
              styles.tabs
            }
          >
            <button
              type="button"
              className={
                activeTab === "chat"
                  ? styles.activeTab
                  : ""
              }
              onClick={() =>
                setActiveTab("chat")
              }
            >
              Chat
            </button>

            <button
              type="button"
              className={
                activeTab === "saved"
                  ? styles.activeTab
                  : ""
              }
              onClick={() =>
                setActiveTab("saved")
              }
            >
              Saved Queries
            </button>

            <button
              type="button"
              className={
                activeTab ===
                "suggestions"
                  ? styles.activeTab
                  : ""
              }
              onClick={() =>
                setActiveTab(
                  "suggestions",
                )
              }
            >
              Smart Suggestions
            </button>
          </div>

          {/* =============================================
              SAVED QUERIES TAB
              ============================================= */}

          {activeTab === "saved" && (
            <section
              className={
                styles.tabPanel
              }
            >
              <div
                className={
                  styles.tabPanelHeader
                }
              >
                <div>
                  <h3>
                    Saved Queries
                  </h3>

                  <p>
                    Reuse questions
                    you have saved.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    startNewConversation
                  }
                  className={
                    styles.newChatButton
                  }
                >
                  <Icon
                    name="plus"
                    size={15}
                  />
                  New Chat
                </button>
              </div>

              {savedQueries.length ===
              0 ? (
                <div
                  className={
                    styles.emptyState
                  }
                >
                  <Icon
                    name="bookmark"
                    size={30}
                  />

                  <strong>
                    No saved queries
                  </strong>

                  <span>
                    Save useful
                    questions from
                    your chat.
                  </span>
                </div>
              ) : (
                <div
                  className={
                    styles.savedQueryList
                  }
                >
                  {savedQueries.map(
                    (saved) => (
                      <div
                        className={
                          styles.savedQuery
                        }
                        key={
                          saved.id
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            askSuggestedQuestion(
                              saved.question,
                            )
                          }
                          className={
                            styles.savedQueryText
                          }
                        >
                          <strong>
                            {saved.label ||
                              saved.question}
                          </strong>

                          {saved.label && (
                            <span>
                              {
                                saved.question
                              }
                            </span>
                          )}
                        </button>

                        <button
                          type="button"
                          className={
                            styles.deleteButton
                          }
                          onClick={() =>
                            void deleteSavedQuery(
                              saved.id,
                            )
                          }
                          aria-label="Delete saved query"
                        >
                          <Icon
                            name="trash"
                            size={15}
                          />
                        </button>
                      </div>
                    ),
                  )}
                </div>
              )}
            </section>
          )}

          {/* =============================================
              SMART SUGGESTIONS TAB
              ============================================= */}

          {activeTab ===
            "suggestions" && (
            <section
              className={
                styles.tabPanel
              }
            >
              <div
                className={
                  styles.tabPanelHeader
                }
              >
                <div>
                  <h3>
                    Smart Suggestions
                  </h3>

                  <p>
                    Questions designed
                    for your feedback
                    workspace.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.suggestionGrid
                }
              >
                {suggestions.map(
                  (suggestion) => (
                    <button
                      type="button"
                      key={
                        suggestion
                      }
                      onClick={() =>
                        askSuggestedQuestion(
                          suggestion,
                        )
                      }
                    >
                      <Icon
                        name="lightbulb"
                        size={18}
                      />

                      <span>
                        {suggestion}
                      </span>

                      <Icon
                        name="chevronRight"
                        size={15}
                      />
                    </button>
                  ),
                )}
              </div>
            </section>
          )}

          {/* =============================================
              CHAT TAB
              ============================================= */}

          {activeTab === "chat" && (
            <>
              {initialLoading &&
              messages.length === 0 ? (
                <div
                  className={
                    styles.loadingState
                  }
                >
                  <span
                    className={
                      styles.spinnerLarge
                    }
                  />

                  Loading Ask LOOP AI...
                </div>
              ) : (
                <>
                  {messages.length ===
                  0 ? (
                    <section
                      className={
                        styles.welcomeCard
                      }
                    >
                      <div
                        className={
                          styles.welcomeIcon
                        }
                      >
                        <Icon
                          name="sparkles"
                          size={28}
                        />
                      </div>

                      <h2>
                        What would you
                        like to know?
                      </h2>

                      <p>
                        Ask LOOP AI can
                        analyze the
                        feedback stored
                        in your current
                        workspace.
                      </p>

                      <div
                        className={
                          styles.welcomeSuggestions
                        }
                      >
                        {suggestions
                          .slice(
                            0,
                            6,
                          )
                          .map(
                            (
                              suggestion,
                            ) => (
                              <button
                                type="button"
                                key={
                                  suggestion
                                }
                                onClick={() =>
                                  askSuggestedQuestion(
                                    suggestion,
                                  )
                                }
                              >
                                {
                                  suggestion
                                }
                              </button>
                            ),
                          )}
                      </div>
                    </section>
                  ) : (
                    <div
                      className={
                        styles.chatArea
                      }
                    >
                      {messages.map(
                        (message) => {
                          const isUser =
                            message.role ===
                            "USER";

                          const isAssistant =
                            message.role ===
                            "ASSISTANT";

                          return (
                            <article
                              className={
                                isUser
                                  ? styles.userMessage
                                  : styles.assistantMessage
                              }
                              key={
                                message.id
                              }
                            >
                              {isUser ? (
                                <div
                                  className={
                                    styles.userBubble
                                  }
                                >
                                  <div
                                    className={
                                      styles.userMessageAvatar
                                    }
                                  >
                                    A
                                  </div>

                                  <div
                                    className={
                                      styles.userMessageBody
                                    }
                                  >
                                    <p>
                                      {
                                        message.content
                                      }
                                    </p>

                                    <span>
                                      {formatDate(
                                        message.createdAt,
                                      )}{" "}
                                      ·{" "}
                                      {formatTime(
                                        message.createdAt,
                                      )}
                                    </span>
                                  </div>
                                </div>
                              ) : isAssistant ? (
                                <div
                                  className={
                                    styles.answerCard
                                  }
                                >
                                  <div
                                    className={
                                      styles.answerHeader
                                    }
                                  >
                                    <div
                                      className={
                                        styles.aiAvatar
                                      }
                                    >
                                      <Icon
                                        name="sparkles"
                                        size={18}
                                      />
                                    </div>

                                    <div>
                                      <strong>
                                        LOOP AI
                                      </strong>

                                      <span>
                                        AI-powered feedback analysis
                                      </span>
                                    </div>
                                  </div>

                                  <div
                                    className={
                                      styles.answerContent
                                    }
                                  >
                                    <p>
                                      {
                                        message.content
                                      }
                                    </p>

                                    {message.metadata
                                      ?.summary &&
                                      typeof message
                                        .metadata
                                        .summary ===
                                        "string" && (
                                        <div
                                          className={
                                            styles.summaryBox
                                          }
                                        >
                                          <strong>
                                            Summary
                                          </strong>

                                          <span>
                                            {
                                              message
                                                .metadata
                                                .summary
                                          }
                                          </span>
                                        </div>
                                      )}

                                    <AnswerChart
                                      chart={
                                        message.chart
                                      }
                                    />

                                    {message.chart &&
                                      message.chart
                                        .labels
                                        .length >
                                        0 && (
                                        <div
                                          className={
                                            styles.chartDataTable
                                          }
                                        >
                                          {message.chart.labels.map(
                                            (
                                              label,
                                              index,
                                            ) => (
                                              <div
                                                key={`${message.id}-${label}`}
                                              >
                                                <span>
                                                  {
                                                    label
                                                  }
                                                </span>

                                                <strong>
                                                  {
                                                    message
                                                      .chart
                                                      ?.values[
                                                      index
                                                    ]
                                                  }
                                                </strong>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      )}

                                    {message
                                      .metadata
                                      ?.followUpQuestions &&
                                      Array.isArray(
                                        message
                                          .metadata
                                          .followUpQuestions,
                                      ) && (
                                        <div
                                          className={
                                            styles.followUps
                                          }
                                        >
                                          <strong>
                                            Continue
                                            the
                                            analysis
                                          </strong>

                                          <div>
                                            {message
                                              .metadata
                                              .followUpQuestions
                                              .filter(
                                                (
                                                  item,
                                                ): item is string =>
                                                  typeof item ===
                                                  "string",
                                              )
                                              .map(
                                                (
                                                  followUp,
                                                ) => (
                                                  <button
                                                    type="button"
                                                    key={
                                                      followUp
                                                    }
                                                    onClick={() =>
                                                      askSuggestedQuestion(
                                                        followUp,
                                                      )
                                                    }
                                                  >
                                                    {
                                                      followUp
                                                    }
                                                  </button>
                                                ),
                                              )}
                                          </div>
                                        </div>
                                      )}

                                    {/* Citations */}
                                    {message
                                      .metadata &&
                                      Array.isArray(
                                        (
                                          message.metadata as {
                                            citations?: unknown;
                                          }
                                        ).citations,
                                      ) && (
                                        <div
                                          className={
                                            styles.citations
                                          }
                                        >
                                          <strong>
                                            Sources
                                          </strong>
                                        </div>
                                      )}
                                  </div>

                                  <div
                                    className={
                                      styles.answerFooter
                                    }
                                  >
                                    <div
                                      className={
                                        styles.answerActions
                                      }
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void submitMessageFeedback(
                                            message.id,
                                            true,
                                          )
                                        }
                                        className={
                                          feedbackState[
                                            message.id
                                          ] ===
                                          true
                                            ? styles.feedbackActive
                                            : ""
                                        }
                                        title="Helpful"
                                      >
                                        <Icon
                                          name="thumbUp"
                                          size={16}
                                        />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          void submitMessageFeedback(
                                            message.id,
                                            false,
                                          )
                                        }
                                        className={
                                          feedbackState[
                                            message.id
                                          ] ===
                                          false
                                            ? styles.feedbackActive
                                            : ""
                                        }
                                        title="Not helpful"
                                      >
                                        <Icon
                                          name="thumbDown"
                                          size={16}
                                        />
                                      </button>
                                    </div>

                                    <span>
                                      {formatTime(
                                        message.createdAt,
                                      )}
                                    </span>
                                  </div>
                                </div>
                              ) : null}
                            </article>
                          );
                        },
                      )}

                      {loading && (
                        <div
                          className={
                            styles.thinking
                          }
                        >
                          <div
                            className={
                              styles.aiAvatar
                            }
                          >
                            <Icon
                              name="sparkles"
                              size={18}
                            />
                          </div>

                          <span>
                            LOOP AI is
                            analyzing your
                            feedback...
                          </span>

                          <span
                            className={
                              styles.thinkingDots
                            }
                          >
                            <i />
                            <i />
                            <i />
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* =========================================
                  FOLLOW-UP INPUT
                  ========================================= */}

              <section
                className={
                  styles.followUpCard
                }
              >
                <form
                  onSubmit={
                    handleSubmit
                  }
                  className={
                    styles.followUpForm
                  }
                >
                  <input
                    value={question}
                    onChange={(event) =>
                      setQuestion(
                        event.target.value,
                      )
                    }
                    placeholder="Ask a follow-up question..."
                    disabled={loading}
                    maxLength={2000}
                  />

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !question.trim()
                    }
                    aria-label="Send follow-up"
                  >
                    {loading ? (
                      <span
                        className={
                          styles.spinner
                        }
                      />
                    ) : (
                      <Icon
                        name="send"
                        size={17}
                      />
                    )}
                  </button>
                </form>

                <p
                  className={
                    styles.disclaimer
                  }
                >
                  LOOP AI can make
                  mistakes. Always verify
                  important insights.
                </p>
              </section>
            </>
          )}
        </section>

        {/* ===============================================
            RIGHT SIDEBAR
            =============================================== */}

        <aside
          className={
            styles.rightColumn
          }
        >
          {/* =============================================
              CONVERSATION HISTORY
              ============================================= */}

          <section
            className={
              styles.sideCard
            }
          >
            <div
              className={
                styles.sideCardHeader
              }
            >
              <h3>
                Conversation History
              </h3>

              <button
                type="button"
                onClick={() =>
                  setActiveTab("chat")
                }
              >
                View all
              </button>
            </div>

            <button
              type="button"
              className={
                styles.newConversation
              }
              onClick={
                startNewConversation
              }
            >
              <Icon
                name="plus"
                size={15}
              />

              New conversation
            </button>

            <div
              className={
                styles.conversationList
              }
            >
              {conversations.length ===
              0 ? (
                <div
                  className={
                    styles.sideEmpty
                  }
                >
                  No conversations yet.
                </div>
              ) : (
                conversations
                  .slice(0, 6)
                  .map(
                    (
                      conversation,
                    ) => (
                      <div
                        className={
                          conversation.id ===
                          conversationId
                            ? styles.conversationItemActive
                            : styles.conversationItem
                        }
                        key={
                          conversation.id
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            void openConversation(
                              conversation.id,
                            )
                          }
                        >
                          <strong>
                            {
                              conversation.title
                            }
                          </strong>

                          <span>
                            {formatDate(
                              conversation.updatedAt,
                            )}
                          </span>
                        </button>

                        <button
                          type="button"
                          className={
                            styles.conversationDelete
                          }
                          onClick={() =>
                            void deleteConversation(
                              conversation.id,
                            )
                          }
                          title="Delete conversation"
                        >
                          <Icon
                            name="trash"
                            size={13}
                          />
                        </button>
                      </div>
                    ),
                  )
              )}
            </div>
          </section>

          {/* =============================================
              QUICK INSIGHTS
              ============================================= */}

          <section
            className={
              styles.sideCard
            }
          >
            <div
              className={
                styles.sideCardHeader
              }
            >
              <h3>
                Quick Insights
              </h3>

              <button
                type="button"
                onClick={() =>
                  setActiveTab(
                    "suggestions",
                  )
                }
              >
                View all
              </button>
            </div>

            {latestAssistant ? (
              <div
                className={
                  styles.insightList
                }
              >
                <div
                  className={
                    styles.insightItem
                  }
                >
                  <div
                    className={
                      styles.insightIcon
                    }
                  >
                    <Icon
                      name="lightbulb"
                      size={17}
                    />
                  </div>

                  <div>
                    <strong>
                      Latest analysis
                    </strong>

                    <p>
                      {latestAssistant
                        .metadata
                        ?.summary &&
                      typeof latestAssistant
                        .metadata
                        .summary ===
                        "string"
                        ? latestAssistant
                            .metadata
                            .summary
                        : latestAssistant.content}
                    </p>

                    <span>
                      {formatTime(
                        latestAssistant.createdAt,
                      )}
                    </span>
                  </div>
                </div>

                {latestAssistant.chart && (
                  <div
                    className={
                      styles.insightItem
                    }
                  >
                    <div
                      className={
                        styles.insightIcon
                      }
                    >
                      <Icon
                        name="database"
                        size={17}
                      />
                    </div>

                    <div>
                      <strong>
                        Data analyzed
                      </strong>

                      <p>
                        {contextTotal !==
                        null
                          ? `${contextTotal.toLocaleString()} items represented in the returned chart.`
                          : "Workspace feedback data was used for this analysis."}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className={
                  styles.sideEmpty
                }
              >
                Ask LOOP AI a question
                to generate insights.
              </div>
            )}
          </section>

          {/* =============================================
              DATA CONTEXT
              ============================================= */}

          <section
            className={
              styles.sideCard
            }
          >
            <div
              className={
                styles.sideCardHeader
              }
            >
              <h3>
                Data Context
              </h3>

              <Icon
                name="database"
                size={17}
              />
            </div>

            <div
              className={
                styles.contextList
              }
            >
              <div>
                <span>
                  Date Range
                </span>

                <strong>
                  {startDate} –{" "}
                  {endDate}
                </strong>
              </div>

              <div>
                <span>
                  Source
                </span>

                <strong>
                  Workspace feedback
                </strong>
              </div>

              <div>
                <span>
                  Database
                </span>

                <strong>
                  PostgreSQL
                </strong>
              </div>

              <div>
                <span>
                  AI Engine
                </span>

                <strong>
                  LOOP AI / Gemini
                </strong>
              </div>
            </div>
          </section>

          {/* =============================================
              CURRENT CHAT ACTIONS
              ============================================= */}

          <section
            className={
              styles.sideActions
            }
          >
            <button
              type="button"
              onClick={() =>
                void saveCurrentQuery()
              }
              disabled={
                savingQuery ||
                messages.length === 0
              }
            >
              <Icon
                name="bookmark"
                size={16}
              />

              {savingQuery
                ? "Saving..."
                : "Save this question"}
            </button>

            <button
              type="button"
              onClick={() =>
                startNewConversation()
              }
            >
              <Icon
                name="plus"
                size={16}
              />

              New conversation
            </button>
          </section>
        </aside>
      </div>
    </main>
  );
}