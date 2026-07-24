export type AIMessageRole = "user" | "assistant" | "system";

export type Sentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE";

export type FeedbackPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type FeedbackCategory =
  | "BUG"
  | "FEATURE_REQUEST"
  | "CUSTOMER_SUPPORT"
  | "PRICING"
  | "USER_EXPERIENCE"
  | "PERFORMANCE"
  | "SECURITY"
  | "OTHER";

export interface AIConversationMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  createdAt: Date;
}

export interface AIUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface AIGenerationRequest {
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  responseMimeType?: "text/plain" | "application/json";
}

export interface AIGenerationResponse {
  text: string;
  model: string;
  usage: AIUsage;
}

export interface EmbeddingResult {
  text: string;
  values: number[];
  model: string;
}

export interface FeedbackClassification {
  sentiment: Sentiment;
  sentimentScore: number;
  category: FeedbackCategory;
  priority: FeedbackPriority;
  themes: string[];
  summary: string;
  actionable: boolean;
  suggestedAction: string | null;
  confidence: number;
}

export interface FeedbackDocument {
  id: string;
  workspaceId: string;
  content: string;
  title?: string;
  source?: string;
  createdAt?: Date;
  metadata?: Record<string, unknown>;
}

export interface VectorDocument extends FeedbackDocument {
  vector: number[];
}

export interface VectorSearchResult {
  document: VectorDocument;
  score: number;
}

export interface Citation {
  number: number;
  sourceId: string;
  title: string;
  source?: string;
  excerpt: string;
  score?: number;
}

export interface AskLoopRequest {
  workspaceId: string;
  userId: string;
  question: string;
  conversationId?: string;
  limit?: number;
}

export interface AskLoopAnswer {
  conversationId: string;
  answer: string;
  summary: string | null;
  followUpQuestions: string[];
  citations: Citation[];
  usage: AIUsage;
}

export interface AskLoopStructuredResponse {
  answer: string;
  summary: string | null;
  followUpQuestions: string[];
  referencedSourceIds: string[];
}

export interface ReportGenerationInput {
  title: string;
  reportType: string;
  period: string;
  feedback: FeedbackDocument[];
}

export interface GeneratedReport {
  title: string;
  executiveSummary: string;
  keyFindings: string[];
  positiveInsights: string[];
  negativeInsights: string[];
  recommendations: string[];
  conclusion: string;
}

export interface ThemeCluster {
  name: string;
  description: string;
  keywords: string[];
  feedbackIds: string[];
  sentiment: Sentiment;
  importance: number;
}

export interface ConversationMemoryEntry {
  conversationId: string;
  userId: string;
  workspaceId: string;
  messages: AIConversationMessage[];
  updatedAt: Date;
}
