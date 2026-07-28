export type AskLoopChartType = "bar" | "line" | "pie" | "none";

export interface AskLoopActorContext {
  userId: string;
  workspaceId: string;
  role: string;
}

export interface AskLoopQueryInput {
  workspaceId: string;
  userId: string;
  question: string;
  conversationId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AskLoopContext {
  totalFeedback: number;
  sentiment: Array<{
    sentiment: string;
    count: number;
  }>;
  sources: Array<{
    source: string;
    count: number;
  }>;
  categories: Array<{
    category: string;
    count: number;
  }>;
  themes: Array<{
    name: string;
    count: number;
  }>;
  recentFeedback: Array<{
    id: string;
    content: string;
    sentiment: string | null;
    source: string;
    category: string | null;
    createdAt: Date;
  }>;
}

export interface AskLoopChart {
  type: AskLoopChartType;
  title: string;
  labels: string[];
  values: number[];
}

export interface ParsedAIResponse {
  answer: string;
  summary?: string;
  chart?: AskLoopChart;
  followUpQuestions: string[];
  citations?: AskLoopCitation[];
}

export interface AskLoopAnswer {
  conversationId: string;
  messageId: string;
  answer: string;
  summary?: string;
  chart?: AskLoopChart;
  followUpQuestions: string[];
  citations?: AskLoopCitation[];
  createdAt: Date;
}

export interface AskLoopCitation {
  feedbackId: string;
  content: string;
  sentiment: string;
  source: string;
  relevance: number;
}

export interface ConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AskLoopMessage {
  id: string;
  conversationId: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  chart?: AskLoopChart;
  metadata?: Record<string, unknown>;
  promptTokens?: number;
  completionTokens?: number;
  createdAt: Date;
}

export interface SavedQueryInput {
  workspaceId: string;
  userId: string;
  question: string;
  label?: string;
}

export interface SavedQuery {
  id: string;
  workspaceId: string;
  userId: string;
  question: string;
  label: string | null;
  createdAt: Date;
}

export interface MessageFeedbackInput {
  messageId: string;
  userId: string;
  helpful: boolean;
  note?: string;
}

export interface FeedbackStats {
  totalMessages: number;
  helpfulCount: number;
  notHelpfulCount: number;
  averageRating: number;
}

export interface RetrievalOptions {
  workspaceId: string;
  startDate?: Date;
  endDate?: Date;
  query?: string;
  limit?: number;
}
