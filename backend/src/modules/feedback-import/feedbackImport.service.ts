import fs from "node:fs/promises";

import { ImportStatus, type Prisma } from "../../generated/prisma/client.js";

import { ImportNotFoundError } from "./feedbackImport.error.js";

import { calculateImportStatus, processCsvRows } from "./feedbackImport.processor.js";
import { parseCsvFile, validateFileSize, validateRowCount } from "./feedbackImport.parser.js";

import {
  createImportedFeedback,
  createImportErrors,
  createImportRecord,
  deleteImportRecord,
  findImportById,
  findImportHistory,
  updateImportStatus,
} from "./feedbackImport.repository.js";

import type {
  FeedbackImportListQuery,
  FeedbackImportResult,
} from "./feedbackImport.types.js";

interface ImportCsvInput {
  file: Express.Multer.File;
  workspaceId: string;
  userId: string;
}

export const importFeedbackCsv = async (
  input: ImportCsvInput,
): Promise<FeedbackImportResult> => {
  const importRecord = await createImportRecord({
    fileName: input.file.filename,
    originalName: input.file.originalname,
    fileType: input.file.mimetype,
    fileSize: input.file.size,
    workspaceId: input.workspaceId,
    importedById: input.userId,
  });

  try {
    await updateImportStatus(importRecord.id, {
      status: ImportStatus.PROCESSING,
      startedAt: new Date(),
    });

    validateFileSize(input.file.size);

    const { rows } = await parseCsvFile(input.file.path);

    validateRowCount(rows.length);

    const { valid, errors } = processCsvRows({
      rows,
      workspaceId: input.workspaceId,
      userId: input.userId,
    });

    let successfulRows = 0;

    if (valid.length > 0) {
      const createResult = await createImportedFeedback(valid);
      successfulRows = createResult.count;
    }

    await createImportErrors(
      errors.map((error) => ({
        feedbackImportId: importRecord.id,
        rowNumber: error.rowNumber,
        field: error.field,
        rawData: error.rawData as Prisma.InputJsonValue,
        errorMessage: error.errorMessage,
      })),
    );

    const duplicateRows = valid.length - successfulRows;

    const { status: finalStatus } = calculateImportStatus(
      rows.length,
      successfulRows,
      errors.length,
      duplicateRows,
    );

    const prismaStatus = finalStatus as ImportStatus;

    await updateImportStatus(importRecord.id, {
      status: prismaStatus,
      totalRows: rows.length,
      successfulRows,
      failedRows: errors.length,
      duplicateRows,
      completedAt: new Date(),
    });

    return {
      importId: importRecord.id,
      status: prismaStatus,
      totalRows: rows.length,
      successfulRows,
      failedRows: errors.length,
      duplicateRows,
    };
  } catch (error) {
    await updateImportStatus(importRecord.id, {
      status: ImportStatus.FAILED,
      completedAt: new Date(),
      errorMessage:
        error instanceof Error ? error.message : "Feedback import failed",
    });

    throw error;
  } finally {
    await fs.unlink(input.file.path).catch(() => undefined);
  }
};

export const getFeedbackImportHistory = async (
  workspaceId: string,
  query: FeedbackImportListQuery,
) => {
  const result = await findImportHistory(workspaceId, query);

  return {
    items: result.items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / query.limit),
    },
  };
};

export const getFeedbackImportDetails = async (
  importId: string,
  workspaceId: string,
) => {
  const importRecord = await findImportById(importId, workspaceId);

  if (!importRecord) {
    throw new ImportNotFoundError(importId);
  }

  return importRecord;
};

export const removeFeedbackImport = async (
  importId: string,
  workspaceId: string,
) => {
  const importRecord = await findImportById(importId, workspaceId);

  if (!importRecord) {
    throw new ImportNotFoundError(importId);
  }

  await deleteImportRecord(importId);
};
