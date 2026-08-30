export type AskLoopRole =
  | "USER"
  | "ASSISTANT"
  | "SYSTEM";

export type AskLoopMessage = {
  id: string;
  conversationId: string;
  role: AskLoopRole;
  content: string;

  chart?: unknown;
  metadata?: Record<string, unknown> | null;

  promptTokens?: number | null;
  completionTokens?: number | null;

  createdAt: string;

  userFeedback?: {
    helpful: boolean;
    note?: string | null;
  } | null;
};

export type AskLoopConversation = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;

  messages?: AskLoopMessage[];
};

export type SavedAskLoopQuery = {
  id: string;
  question: string;
  label?: string | null;
  createdAt: string;
};

export type AskLoopAskRequest = {
  question: string;
  conversationId?: string;
};

export type AskLoopAskResponse = {
  conversation: AskLoopConversation;
  userMessage: AskLoopMessage;
  assistantMessage: AskLoopMessage;
};

export type AskLoopFeedbackRequest = {
  messageId: string;
  helpful: boolean;
  note?: string;
};