export type AskLoopChartType = "bar" | "line" | "pie" | "none";

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
}

export interface AskLoopAnswer {
  conversationId: string;
  messageId: string;
  answer: string;
  summary?: string;
  chart?: AskLoopChart;
  followUpQuestions: string[];
  createdAt: Date;
}
