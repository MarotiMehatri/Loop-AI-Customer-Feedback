import type {
  FeedbackChannel,
  FeedbackStatus,
  Sentiment,
} from "../../generated/prisma/client.js";

export type { FeedbackStatus };

export interface CreateFeedbackInput {
  source: FeedbackChannel;
  sentiment: Sentiment;
  customerName?: string;
  customerEmail?: string;
  content: string;
  tags?: string[];
  category?: string;
  status?: FeedbackStatus;
  isImportant?: boolean;
}

export interface UpdateFeedbackInput {
  source?: FeedbackChannel;
  sentiment?: Sentiment;
  customerName?: string | null;
  customerEmail?: string | null;
  content?: string;
  tags?: string[];
  category?: string | null;
  status?: FeedbackStatus;
  isImportant?: boolean;
}

export interface UpdateFeedbackStatusInput {
  status: FeedbackStatus;
}

export interface FeedbackListFilters {
  page: number;
  limit: number;
  search?: string;
  source?: FeedbackChannel;
  sentiment?: Sentiment;
  status?: FeedbackStatus;
  category?: string;
  isImportant?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  sortBy:
    | "createdAt"
    | "updatedAt"
    | "customerName"
    | "status"
    | "sentiment"
    | "source";
  sortOrder: "asc" | "desc";
}

export interface RequestUser {
  userId: string;
  email: string;
  role: "ADMIN" | "ANALYST" | "VIEWER";
  workspaceId: string;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}