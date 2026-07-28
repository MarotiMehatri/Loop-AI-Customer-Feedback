import { ApiError } from "../../utils/apiError.js";

import {
  assertCanReadExports,
  assertCanCreateExports,
  assertCanDeleteExports,
} from "./export.permissions.js";

import { exportRepository } from "./export.repository.js";

import { mapExport, mapExportList } from "./export.mapper.js";

import { exportGeneratorService } from "./export-generator.service.js";

import { exportFileService } from "./export-file.service.js";

import { EXPORT_MESSAGES } from "./export.constants.js";

import type {
  CreateExportInput,
  ExportActorContext,
  ExportListFilters,
} from "./export.types.js";

async function processExport(
  exportId: string,
  workspaceId: string,
): Promise<void> {
  await exportRepository.update(exportId, workspaceId, {
    status: "PROCESSING",
  });

  try {
    const exportJob = await exportRepository.findById(exportId, workspaceId);

    if (!exportJob) {
      throw new Error("Export job not found");
    }

    const { fileName, buffer, fileSize } =
      await exportGeneratorService.generate(
        exportJob as never,
        workspaceId,
      );

    const finalPath = await exportFileService.write(fileName, buffer);

    await exportRepository.update(exportId, workspaceId, {
      status: "COMPLETED",
      filePath: finalPath,
      fileSize,
      completedAt: new Date(),
    });
  } catch (error) {
    await exportRepository.update(exportId, workspaceId, {
      status: "FAILED",
      error: error instanceof Error ? error.message : "Export failed",
    });
  }
}

export const exportService = {
  async create(actor: ExportActorContext, input: CreateExportInput) {
    assertCanCreateExports(actor.role);

    const exportJob = await exportRepository.create({
      ...input,
      name: input.name.trim(),
      workspaceId: actor.workspaceId,
      createdById: actor.userId,
    });

    processExport(exportJob.id, actor.workspaceId).catch(() => {});

    return mapExport(exportJob);
  },

  async getById(actor: ExportActorContext, exportId: string) {
    assertCanReadExports(actor.role);

    const exportJob = await exportRepository.findById(
      exportId,
      actor.workspaceId,
    );

    if (!exportJob) {
      throw new ApiError(404, EXPORT_MESSAGES.notFound);
    }

    return mapExport(exportJob);
  },

  async list(actor: ExportActorContext, filters: ExportListFilters) {
    assertCanReadExports(actor.role);

    const result = await exportRepository.list(actor.workspaceId, filters);

    const totalPages = Math.ceil(result.total / filters.limit);

    return {
      exports: mapExportList(result.items),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        totalItems: result.total,
        totalPages,
        hasNextPage: filters.page < totalPages,
        hasPreviousPage: filters.page > 1,
      },
    };
  },

  async getDownload(actor: ExportActorContext, exportId: string) {
    assertCanReadExports(actor.role);

    const exportJob = await this.getById(actor, exportId);

    if (exportJob.status !== "COMPLETED") {
      throw new ApiError(400, EXPORT_MESSAGES.notReady);
    }

    if (!exportJob.filePath) {
      throw new ApiError(404, EXPORT_MESSAGES.fileNotFound);
    }

    const download = await exportFileService.getDownloadInfo(
      exportJob.filePath,
      exportJob.name,
      exportJob.format,
    );

    if (!download) {
      throw new ApiError(404, EXPORT_MESSAGES.fileNotFound);
    }

    return download;
  },
};
