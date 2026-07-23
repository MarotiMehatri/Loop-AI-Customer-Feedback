export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  details?: unknown;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface SortQuery {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
}
