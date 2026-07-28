import type { Role } from "../../generated/prisma/client.js";

export type ExportFormat = "CSV" | "XLSX" | "JSON" | "PDF";

export type ExportStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

export interface ExportActorContext {
  userId: string;
  workspaceId: string;
  role: Role;
}

export interface CreateExportInput {
  name: string;
  format: ExportFormat;
  type: "feedback" | "analytics" | "themes" | "reports";
  filters?: Record<string, unknown>;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ExportJob {
  id: string;
  name: string;
  format: ExportFormat;
  type: string;
  status: ExportStatus;
  filters: Record<string, unknown> | null;
  filePath: string | null;
  fileSize: number | null;
  error: string | null;
  workspaceId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ExportListFilters {
  page: number;
  limit: number;
  search?: string;
  format?: ExportFormat;
  status?: ExportStatus;
  type?: string;
  sortBy: "createdAt" | "updatedAt" | "name" | "status";
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
