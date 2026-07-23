import fs from "node:fs/promises";

import { ImportStatus, type Prisma } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";
import { parseCsvFile } from "../../utils/csvParser.js";

import { FEEDBACK_IMPORT_CONFIG } from "./feedbackImport.constants.js";
import { mapCsvRowToFeedback } from "./feedbackImport.mapper.js";

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
  CsvFeedbackRow,
  FeedbackImportErrorInput,
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

    const rows = await parseCsvFile<CsvFeedbackRow>(input.file.path);

    if (rows.length === 0) {
      throw new ApiError(400, "CSV file does not contain feedback rows");
    }

    if (rows.length > FEEDBACK_IMPORT_CONFIG.maximumRows) {
      throw new ApiError(
        400,
        `CSV cannot contain more than ${FEEDBACK_IMPORT_CONFIG.maximumRows} rows`,
      );
    }

    const validFeedback: Prisma.FeedbackCreateManyInput[] = [];

    const errors: FeedbackImportErrorInput[] = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;

      try {
        const mapped = mapCsvRowToFeedback(row);

        validFeedback.push({
          ...mapped,
          workspaceId: input.workspaceId,
          createdById: input.userId,
        });
      } catch (error) {
        errors.push({
          rowNumber,
          rawData: row as Record<string, unknown>,

          errorMessage:
            error instanceof Error ? error.message : "Invalid feedback row",
        });
      }
    });

    let successfulRows = 0;

    if (validFeedback.length > 0) {
      const createResult = await createImportedFeedback(validFeedback);

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

    const duplicateRows = validFeedback.length - successfulRows;

    const finalStatus =
      successfulRows === 0
        ? ImportStatus.FAILED
        : errors.length > 0 || duplicateRows > 0
          ? ImportStatus.PARTIALLY_COMPLETED
          : ImportStatus.COMPLETED;

    await updateImportStatus(importRecord.id, {
      status: finalStatus,
      totalRows: rows.length,
      successfulRows,
      failedRows: errors.length,
      duplicateRows,
      completedAt: new Date(),
    });

    return {
      importId: importRecord.id,
      status: finalStatus,
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
    throw new ApiError(404, "Feedback import not found");
  }

  return importRecord;
};

export const removeFeedbackImport = async (
  importId: string,
  workspaceId: string,
) => {
  const importRecord = await findImportById(importId, workspaceId);

  if (!importRecord) {
    throw new ApiError(404, "Feedback import not found");
  }

  await deleteImportRecord(importId);
};
