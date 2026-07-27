export type DataSourceType =
  | "API"
  | "WEBHOOK"
  | "CSV"
  | "DATABASE"
  | "EMAIL"
  | "SOCIAL_MEDIA"
  | "CUSTOM";

export type DataSourceStatus = "ACTIVE" | "INACTIVE" | "ERROR" | "SYNCING";

export interface CreateDataSourceInput {
  name: string;
  type: DataSourceType;
  description?: string;
  config: Record<string, unknown>;
  isActive?: boolean;
}

export interface UpdateDataSourceInput {
  name?: string;
  type?: DataSourceType;
  description?: string | null;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

export interface DataSourceListFilters {
  page: number;
  limit: number;
  search?: string;
  type?: DataSourceType;
  status?: DataSourceStatus;
  sortBy: "createdAt" | "updatedAt" | "name" | "type" | "status";
  sortOrder: "asc" | "desc";
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SyncResult {
  dataSourceId: string;
  status: "completed" | "failed" | "in_progress";
  recordsProcessed: number;
  recordsAdded: number;
  recordsUpdated: number;
  errors: string[];
  startedAt: Date;
  completedAt?: Date;
}
