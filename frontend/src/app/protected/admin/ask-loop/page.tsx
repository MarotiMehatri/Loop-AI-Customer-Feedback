"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, ChevronRight, Send, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { apiClient } from "../../../../lib/api/api-client";
import { getErrorMessage } from "../../../../lib/api/api-error";

import { AdminShell } from "../_components/AdminShell";
import styles from "./ask-loop.module.css";

interface Chart {
  type: "bar" | "line" | "pie" | "none";
  title: string;
  labels: string[];
  values: number[];
}

interface Citation {
  feedbackId: string;
  content: string;
  sentiment: string;
  source: string;
  relevance: number;
}

interface AskAnswer {
  conversationId: string;
  messageId: string;
  answer: string;
  summary?: string;
  chart?: Chart;
  followUpQuestions: string[];
  citations?: Citation[];
  createdAt: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  summary?: string;
  chart?: Chart;
  citations?: Citation[];
  followUps?: string[];
  createdAt: string;
}

interface Suggestion {
  id: string;
  question: string;
  category: string;
}

interface Conversation {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: string;
}

interface SavedQuery {
  id: string;
  label: string | null;
  question: string;
  createdAt: string;
}

const WELCOME_SUGGESTIONS = [
  "How has sentiment changed over the last 7 days?",
  "What are the most common complaints this month?",
  "Which themes are trending upward?",
  "Show me pricing feedback from email",
];

function SimpleChart({ chart }: { chart: Chart }) {
  if (!chart || chart.type === "none") return null;
  const max = Math.max(...chart.values, 1);
  const colors = ["#5b2cf0", "#2563eb", "#1b9d76", "#f59e0b", "#e45bb9"];
  return (
    <div style={{ marginTop: 10 }}>
      <b style={{ fontSize: 11, color: "#344054" }}>{chart.title}</b>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginTop: 8, height: 110 }}>
        {chart.values.map((value, index) => (
          <div key={index} style={{ display: "grid", gap: 4, alignItems: "center", textAlign: "center" }}>
            <b style={{ fontSize: 10, color: "#667085" }}>{value}</b>
            <div
              style={{
                width: 26,
                height: Math.max((value / max) * 80, 4),
                background: colors[index % colors.length],
                borderRadius: "5px 5px 0 0",
              }}
            />
            <small style={{ fontSize: 9, color: "#98a2b3" }}>{chart.labels[index]}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AskLoopPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient
      .get<{ data: Suggestion[] }>("/ask-loop/suggestions")
      .then(({ data }) => setSuggestions(data.data ?? []))
      .catch(() => undefined);

    apiClient
      .get<{ data: { items: Conversation[] } }>("/ask-loop/conversations", {
        params: { page: 1, limit: 10 },
      })
      .then(({ data }) => setConversations(data.data.items ?? []))
      .catch(() => undefined);

    apiClient
      .get<{ data: SavedQuery[] }>("/ask-loop/saved-queries")
      .then(({ data }) => setSavedQueries(data.data ?? []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const pushMessage = (message: Message) => setMessages((current) => [...current, message]);

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    pushMessage({ id: crypto.randomUUID(), role: "user", content: trimmed, createdAt: new Date().toISOString() });
    setQuestion("");
    setLoading(true);
    try {
      const { data } = await apiClient.post<{ data: AskAnswer }>("/ask-loop/ask", {
        question: trimmed,
        conversationId,
      });
      const answer = data.data;
      setConversationId(answer.conversationId);
      pushMessage({
        id: answer.messageId,
        role: "assistant",
        content: answer.answer,
        summary: answer.summary,
        chart: answer.chart,
        citations: answer.citations,
        followUps: answer.followUpQuestions,
        createdAt: answer.createdAt,
      });
    } catch (error) {
      pushMessage({
        id: crypto.randomUUID(),
        role: "assistant",
        content: `I ran into a problem answering that: ${getErrorMessage(error)}`,
        createdAt: new Date().toISOString(),
      });
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    ask(question);
  };

  const suggestionsToShow = messages.length === 0
    ? (suggestions.length > 0 ? suggestions.map((s) => s.question) : WELCOME_SUGGESTIONS)
    : messages[messages.length - 1]?.followUps ?? [];

  return (
    <AdminShell title="Ask LOOP AI" subtitle="Ask questions about your customer feedback in plain language" active="ask-loop">
      <div className={styles.body}>
        <aside className={styles.rail}>
          <section className={styles.sideSection}>
            <h2>Suggested Questions</h2>
            <div className={styles.suggestionList}>{suggestionsToShow.map((suggestion, index) => <button key={`${suggestion}-${index}`} onClick={() => ask(suggestion)}>{suggestion}<ChevronRight size={15} /></button>)}</div>
          </section>
          <section className={styles.sideSection}>
            <h2>Key Insights</h2>
            <div className={styles.keyInsight}><i className={styles.negative}><TrendingUp size={18} /></i><p><b>Negative feedback needs attention</b><span>Ask LOOP for the latest trend and affected themes.</span></p></div>
            <div className={styles.keyInsight}><i className={styles.positive}><TrendingDown size={18} /></i><p><b>Explore what customers love</b><span>Find positive themes and successful sources.</span></p></div>
            <div className={styles.keyInsight}><i className={styles.theme}><Sparkles size={18} /></i><p><b>Discover your top theme</b><span>Use a question to explore recurring feedback.</span></p></div>
          </section>
          <section className={styles.sideSection}>
          <h2>Recent Conversations</h2>
          {conversations.length === 0 && <p style={{ fontSize: 11, color: "#98a2b3" }}>No conversations yet.</p>}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={styles.railItem}
              onClick={() => {
                setConversationId(conversation.id);
                toast.info(`Switched to "${conversation.title}"`);
              }}
            >
              <b>{conversation.title}</b>
              <small>{conversation.messageCount} messages</small>
            </button>
          ))}
          {savedQueries.length > 0 && (
            <>
              <h2 style={{ marginTop: 12 }}>Saved queries</h2>
              {savedQueries.map((query) => (
                <button key={query.id} className={styles.railItem} onClick={() => ask(query.question)}>
                  {query.label ?? query.question}
                </button>
              ))}
            </>
          )}
          </section>
        </aside>

        <section className={styles.chat}>
          <div className={styles.messages} ref={listRef}>
            {messages.length === 0 && (
              <div className={styles.welcome}>
                <div className={styles.orb}><Bot size={30} /></div>
                <h2>Ask LOOP anything about your feedback</h2>
                <p>
                  LOOP answers using your actual feedback data — sentiment, themes,
                  sources and recent comments — with citations you can trace back.
                </p>
                <div className={styles.chips}>
                  {WELCOME_SUGGESTIONS.map((suggestion) => (
                    <button key={suggestion} className={styles.chip} onClick={() => ask(suggestion)}>
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`${styles.message} ${message.role === "user" ? styles.user : styles.assistant}`}>
                <div className={styles.bubble}>{message.content}</div>
                {message.summary && <div className={styles.summary}>Summary: {message.summary}</div>}
                {message.chart && message.chart.type !== "none" && <SimpleChart chart={message.chart} />}
                {message.citations && message.citations.length > 0 && (
                  <div className={styles.citations}>
                    {message.citations.slice(0, 3).map((citation) => (
                      <div key={citation.feedbackId} className={styles.citation}>
                        <b>{citation.source} · {citation.sentiment}</b>
                        {citation.content}
                      </div>
                    ))}
                  </div>
                )}
                {message.followUps && message.followUps.length > 0 && (
                  <div className={styles.followups}>
                    {message.followUps.map((followUp) => (
                      <button key={followUp} className={styles.followup} onClick={() => ask(followUp)}>
                        {followUp}
                      </button>
                    ))}
                  </div>
                )}
                <span className={styles.meta}>
                  {new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}

            {loading && (
              <div className={`${styles.message} ${styles.assistant}`}>
                <div className={`${styles.bubble} ${styles.typing}`}><i /><i /><i /></div>
              </div>
            )}
          </div>

          <form className={styles.composer} onSubmit={handleSubmit}>
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask LOOP a question about your feedback…"
              autoComplete="off"
            />
            <button type="submit" disabled={loading || !question.trim()}>
              <Send size={16} /> Ask
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  );
}
