import type {
  FeedbackChannel,
  FeedbackStatus,
  ImportStatus,
  Sentiment,
} from "../../generated/prisma/client.js";

export interface CsvFeedbackRow {
  content?: string;
  source?: string;
  customerName?: string;
  customerEmail?: string;
  sentiment?: string;
  status?: string;
  category?: string;
  tags?: string;
  createdAt?: string;
}

export interface NormalizedFeedbackRow {
  content: string;
  source: FeedbackChannel;
  customerName: string | null;
  customerEmail: string | null;
  sentiment: Sentiment;
  status: FeedbackStatus;
  category: string | null;
  tags: string[];
  createdAt?: Date;
}

export interface FeedbackImportErrorInput {
  rowNumber: number;
  field?: string;
  rawData?: Record<string, unknown>;
  errorMessage: string;
}

export interface FeedbackImportResult {
  importId: string;
  status: ImportStatus;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  duplicateRows: number;
}

export interface FeedbackImportListQuery {
  page: number;
  limit: number;
  status?: ImportStatus;
}

export interface FeedbackImportListResult {
  items: unknown[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
