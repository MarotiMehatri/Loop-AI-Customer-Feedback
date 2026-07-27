import path from "node:path";
import fs from "node:fs/promises";

import { ApiError } from "../../utils/apiError.js";

import {
  createExportRecord,
  deleteExportRecord,
  findExportById,
  findExportList,
  updateExportRecord,
} from "./exports.repository.js";

import type {
  CreateExportInput,
  ExportJob,
  ExportListFilters,
  PaginationMetadata,
} from "./exports.types.js";

const EXPORTS_DIR = path.resolve(process.cwd(), "uploads", "exports");

const ensureExportsDir = async () => {
  try {
    await fs.access(EXPORTS_DIR);
  } catch {
    await fs.mkdir(EXPORTS_DIR, { recursive: true });
  }
};

const generateExportFile = async (
  exportJob: ExportJob,
  workspaceId: string,
): Promise<{ filePath: string; fileSize: number }> => {
  await ensureExportsDir();

  const fileName = `${exportJob.id}-${Date.now()}.${exportJob.format.toLowerCase()}`;
  const filePath = path.join(EXPORTS_DIR, fileName);

  // Placeholder: replace with actual export generation logic per format/type
  const content = JSON.stringify(
    {
      exportId: exportJob.id,
      type: exportJob.type,
      format: exportJob.format,
      filters: exportJob.filters,
      workspaceId,
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  );

  await fs.writeFile(filePath, content, "utf-8");

  const stats = await fs.stat(filePath);

  return {
    filePath,
    fileSize: stats.size,
  };
};

export const createExport = async (
  input: CreateExportInput,
  workspaceId: string,
  userId: string,
) => {
  const exportJob = await createExportRecord({
    ...input,
    name: input.name.trim(),
    workspaceId,
    createdById: userId,
  });

  // Start async processing
  processExport(exportJob.id, workspaceId).catch(() => {
    // Error is logged and stored in the export record
  });

  return exportJob;
};

const processExport = async (
  exportId: string,
  workspaceId: string,
) => {
  await updateExportRecord(exportId, workspaceId, {
    status: "PROCESSING",
  });

  try {
    const exportJob = await findExportById(exportId, workspaceId);
    if (!exportJob) {
      throw new Error("Export job not found");
    }

    const { filePath, fileSize } = await generateExportFile(
      exportJob as unknown as ExportJob,
      workspaceId,
    );

    await updateExportRecord(exportId, workspaceId, {
      status: "COMPLETED",
      filePath,
      fileSize,
      completedAt: new Date(),
    });
  } catch (error) {
    await updateExportRecord(exportId, workspaceId, {
      status: "FAILED",
      error: error instanceof Error ? error.message : "Export failed",
    });
  }
};

export const getExport = async (
  exportId: string,
  workspaceId: string,
) => {
  const exportJob = await findExportById(exportId, workspaceId);

  if (!exportJob) {
    throw new ApiError(404, "Export job was not found");
  }

  return exportJob;
};

export const getExportList = async (
  workspaceId: string,
  filters: ExportListFilters,
) => {
  const result = await findExportList(workspaceId, filters);

  const totalPages = Math.ceil(result.totalItems / filters.limit);

  const pagination: PaginationMetadata = {
    page: filters.page,
    limit: filters.limit,
    totalItems: result.totalItems,
    totalPages,
    hasNextPage: filters.page < totalPages,
    hasPreviousPage: filters.page > 1,
  };

  return {
    exports: result.exports,
    pagination,
  };
};

export const getExportDownload = async (
  exportId: string,
  workspaceId: string,
) => {
  const exportJob = await getExport(exportId, workspaceId);

  if (exportJob.status !== "COMPLETED") {
    throw new ApiError(400, "Export is not ready for download");
  }

  if (!exportJob.filePath) {
    throw new ApiError(404, "Export file was not found");
  }

  try {
    await fs.access(exportJob.filePath);
  } catch {
    throw new ApiError(404, "Export file no longer exists");
  }

  return {
    filePath: exportJob.filePath,
    fileName: `${exportJob.name}.${exportJob.format.toLowerCase()}`,
    fileSize: exportJob.fileSize,
    format: exportJob.format,
  };
};
