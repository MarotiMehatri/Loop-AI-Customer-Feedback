
export type DataSourceType =
  | "API"
  | "WEBHOOK"
  | "CSV"
  | "DATABASE"
  | "EMAIL"
  | "SOCIAL_MEDIA"
  | "CUSTOM";

export type DataSourceStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "ERROR"
  | "SYNCING";

export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  description: string | null;
  config: Record<string, unknown>;
  isActive: boolean;
  status: DataSourceStatus;
  lastSyncAt: string | null;
  createdAt: string;
  feedbackImported: number;
  newThisWeek: number;
  successRate: number | null;
  errorsThisWeek: number;
}

export interface DataSourceSummary {
  totalSources: number;
  connectedSources: number;
  totalFeedback: number;
  autoImports: number;
  successRate: number;
  healthySources: number;
  warningSources: number;
  errorSources: number;
}

export interface DataSourcesResponse {
  dataSources: DataSource[];
  summary: DataSourceSummary;
  failedImports: Array<{
    source: string;
    errors: number;
    lastOccurred: string | null;
    status: string;
  }>;
}
