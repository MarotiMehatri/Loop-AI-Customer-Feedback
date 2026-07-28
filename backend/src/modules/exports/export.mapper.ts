import type { Prisma } from "../../generated/prisma/client.js";

import type { ExportFormat, ExportStatus } from "./export.types.js";

export type ExportRecord = Prisma.ExportJobGetPayload<{
  include: {
    createdBy: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

export interface ExportResponse {
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
  createdBy: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

export function mapExport(record: ExportRecord): ExportResponse {
  return {
    id: record.id,
    name: record.name,
    format: record.format as ExportFormat,
    type: record.type,
    status: record.status as ExportStatus,
    filters: record.filters as Record<string, unknown> | null,
    filePath: record.filePath,
    fileSize: record.fileSize,
    error: record.error,
    workspaceId: record.workspaceId,
    createdBy: record.createdBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    completedAt: record.completedAt,
  };
}

export function mapExportList(records: ExportRecord[]): ExportResponse[] {
  return records.map(mapExport);
}
