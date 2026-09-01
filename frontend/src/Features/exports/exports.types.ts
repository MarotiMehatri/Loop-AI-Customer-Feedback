export type ExportFormat =
  | "CSV"
  | "XLSX"
  | "JSON"
  | "PDF";

export type ExportJobStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED";

export interface ExportUser {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  role?: string;
}

export interface ExportJob {
  id: string;

  name: string;
  format: ExportFormat;
  type: string;
  status: ExportJobStatus;

  filters?: Record<string, unknown> | null;

  filePath?: string | null;
  fileUrl?: string | null;
  fileSize?: number | null;

  error?: string | null;

  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  createdBy?: ExportUser | null;
}

export interface ExportSummary {
  totalExports: number;
  completed: number;
  processing: number;
  pending: number;
  failed: number;

  totalDataExported: number;
  averageExportTimeSeconds: number;

  completedPercentage: number;
  processingPercentage: number;
  failedPercentage: number;
}

export interface ExportFormatStat {
  format: ExportFormat;
  count: number;
  percentage: number;
}

export interface ExportTypeStat {
  type: string;
  count: number;
  percentage: number;
}

export interface StorageUsage {
  usedBytes: number;
  limitBytes: number;
  percentage: number;
}

export interface ExportDashboardResponse {
  exports: ExportJob[];

  total: number;
  page: number;
  pageSize: number;
  totalPages: number;

  summary: ExportSummary;

  byFormat: ExportFormatStat[];
  byType: ExportTypeStat[];

  storage: StorageUsage;
}

export interface ExportListParams {
  page?: number;
  pageSize?: number;

  search?: string;

  format?: ExportFormat | "ALL";
  status?: ExportJobStatus | "ALL";
  type?: string | "ALL";

  startDate?: string;
  endDate?: string;
}

export interface CreateExportPayload {
  name: string;
  format: ExportFormat;
  type: string;

  filters?: Record<string, unknown>;

  startDate?: string;
  endDate?: string;
}

export interface ExportDownloadResponse {
  fileUrl: string;
}