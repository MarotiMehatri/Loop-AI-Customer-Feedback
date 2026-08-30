export type ReportStatus =
  | "DRAFT"
  | "GENERATING"
  | "COMPLETED"
  | "FAILED"
  | "SCHEDULED";

export type ReportType =
  | "VOICE_OF_CUSTOMER"
  | "INSIGHTS"
  | "ANALYTICS"
  | "SUMMARY"
  | "SENTIMENT"
  | "THEMES"
  | "CUSTOM";

export type ReportExportFormat = "PDF" | "CSV" | "XLSX";

export interface ReportExport {
  id: string;
  format: ReportExportFormat;
  fileName: string;
  fileUrl: string;
  fileSize?: number | null;
  downloadedAt?: string | null;
  createdAt: string;
}

export interface ReportSchedule {
  id: string;
  frequency: string;
  cronExpression?: string | null;
  recipients: string[];
  isActive: boolean;
  nextRunAt?: string | null;
  lastRunAt?: string | null;
}

export interface Report {
  id: string;
  title: string;
  description?: string | null;
  type: ReportType;
  status: ReportStatus;
  startDate?: string | null;
  endDate?: string | null;
  sources?: unknown;
  filters?: unknown;
  metrics?: unknown;
  charts?: unknown;
  data?: unknown;
  aiSummary?: string | null;
  tags: string[];
  generatedAt?: string | null;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  workspaceId: string;
  userId?: string | null;
  templateId?: string | null;
  exports?: ReportExport[];
  schedule?: ReportSchedule | null;
  user?: { id: string; name: string; avatarUrl?: string | null } | null;
}

export interface ReportListResponse {
  reports: Report[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface CreateReportPayload {
  title: string;
  description?: string;
  type: ReportType;
  startDate?: string;
  endDate?: string;
  sources?: string[];
  filters?: Record<string, unknown>;
  metrics?: string[];
  charts?: Record<string, unknown>;
  tags?: string[];
  status?: ReportStatus;
  scheduledAt?: string;
}
