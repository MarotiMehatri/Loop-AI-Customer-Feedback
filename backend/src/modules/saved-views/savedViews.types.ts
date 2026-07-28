export interface CreateSavedViewInput {
  name: string;
  filters: Record<string, unknown>;
  description?: string;
  isDefault?: boolean;
}

export interface UpdateSavedViewInput {
  name?: string;
  filters?: Record<string, unknown>;
  description?: string | null;
  isDefault?: boolean;
}

export interface SavedViewListFilters {
  page: number;
  limit: number;
  search?: string;
  sortBy: "createdAt" | "updatedAt" | "name";
  sortOrder: "asc" | "desc";
}

export interface SavedViewFilters {
  search?: string;
  status?: string;
  sentiment?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  themes?: string[];
  rating?: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
