export type FeedbackSource =
  | "SUPPORT"
  | "APP_STORE"
  | "SURVEY"
  | "SALES"
  | "SOCIAL"
  | "WEBSITE"
  | "EMAIL"
  | "MANUAL";

export type FeedbackStatus =
  | "NEW"
  | "REVIEWED"
  | "ACTIONED"
  | "ARCHIVED";

export type FeedbackSentiment =
  | "POSITIVE"
  | "NEUTRAL"
  | "NEGATIVE";

export interface CreateFeedbackPayload {
  content: string;
  customerName?: string;
  source: FeedbackSource;
  category?: string;
  feedbackDate?: string;
}

export interface Feedback {
  id: string;
  content: string;
  customerName: string | null;
  customerEmail?: string | null;
  source: FeedbackSource;
  sentiment: FeedbackSentiment;
  status: FeedbackStatus;
  category: string | null;
  rating?: number | null;
  feedbackDate: string | null;
  createdAt: string;
  updatedAt: string;

  isImportant?: boolean;
  isRead?: boolean;
  isPinned?: boolean;

  workspaceId?: string;
  createdById?: string;
  assignedToId?: string | null;
}

export interface FeedbackListFilters {
  page?: number;
  limit?: number;
  search?: string;
  source?: FeedbackSource;
  status?: FeedbackStatus;
  sentiment?: FeedbackSentiment;
  category?: string;
}

export type FeedbackInboxParams = FeedbackListFilters;

export interface FeedbackListResponse {
  items: Feedback[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}