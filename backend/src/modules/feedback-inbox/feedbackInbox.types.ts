import type {
  FeedbackChannel,
  FeedbackStatus,
  Sentiment,
} from "../../generated/prisma/client.js";

export interface FeedbackInboxQuery {
  page: number;
  limit: number;
  search?: string;
  source?: FeedbackChannel;
  sentiment?: Sentiment;
  status?: FeedbackStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface FeedbackInboxPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface FeedbackInboxSummary {
  totalFeedback: number;

  positive: {
    count: number;
    percentage: number;
  };

  neutral: {
    count: number;
    percentage: number;
  };

  negative: {
    count: number;
    percentage: number;
  };

  unresolved: number;
}

export interface UpdateFeedbackInboxInput {
  content?: string;
  sentiment?: Sentiment;
  status?: FeedbackStatus;
  source?: FeedbackChannel;
  customerName?: string | null;
  customerEmail?: string | null;
}

export interface UpdateFeedbackStatusInput {
  status: FeedbackStatus;
}
