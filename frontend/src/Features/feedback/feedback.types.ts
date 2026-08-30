export type FeedbackInboxItem = {
  id: string;
  externalId?: string | null;

  text: string;

  customerName?: string | null;
  customerEmail?: string | null;

  source?: string | null;
  channel?: string | null;

  sentiment?: string | null;
  theme?: string | null;
  status?: string | null;

  createdAt: string;
  updatedAt?: string;
};

export type FeedbackInboxMetrics = {
  total: number;
  new: number;
  negative: number;
  pending: number;
  classified: number;
};

export type FeedbackInboxPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type FeedbackInboxResponse = {
  items: FeedbackInboxItem[];

  metrics: FeedbackInboxMetrics;

  pagination: FeedbackInboxPagination;
};

export type FeedbackInboxParams = {
  page?: number;
  limit?: number;

  search?: string;
  source?: string;
  sentiment?: string;
  theme?: string;
  status?: string;

  startDate?: string;
  endDate?: string;
};