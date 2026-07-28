import type { Prisma } from "../../generated/prisma/client.js";

import { FEEDBACK_IMPORT_CONFIG } from "./feedbackImport.constants.js";
import {
  FeedbackMappingError,
  RowLimitExceededError,
} from "./feedbackImport.error.js";
import { mapCsvRowToFeedback } from "./feedbackImport.mapper.js";

import type {
  CsvFeedbackRow,
  FeedbackImportErrorInput,
} from "./feedbackImport.types.js";

interface ProcessRowResult {
  valid: Prisma.FeedbackCreateManyInput[];
  errors: FeedbackImportErrorInput[];
  duplicates: number;
}

interface ProcessCsvInput {
  rows: CsvFeedbackRow[];
  workspaceId: string;
  userId: string;
}

export const processCsvRows = (input: ProcessCsvInput): ProcessRowResult => {
  const { rows, workspaceId, userId } = input;

  if (rows.length > FEEDBACK_IMPORT_CONFIG.maximumRows) {
    throw new RowLimitExceededError(FEEDBACK_IMPORT_CONFIG.maximumRows);
  }

  const valid: Prisma.FeedbackCreateManyInput[] = [];
  const errors: FeedbackImportErrorInput[] = [];
  let duplicates = 0;

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index] as CsvFeedbackRow;
    const rowNumber = index + 2;

    try {
      const mapped = mapCsvRowToFeedback(row);

      valid.push({
        ...mapped,
        workspaceId,
        createdById: userId,
      });
    } catch (error) {
      if (error instanceof FeedbackMappingError) {
        errors.push({
          rowNumber,
          field: error.field,
          rawData: row as unknown as Record<string, unknown>,
          errorMessage: error.message,
        });
      } else {
        errors.push({
          rowNumber,
          rawData: row as unknown as Record<string, unknown>,
          errorMessage: error instanceof Error ? error.message : "Invalid feedback row",
        });
      }
    }
  }

  return { valid, errors, duplicates };
};

export const calculateImportStatus = (
  totalRows: number,
  successfulRows: number,
  errorCount: number,
  duplicateCount: number,
): {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "PARTIALLY_COMPLETED" | "FAILED";
  shouldMarkFailed: boolean;
} => {
  if (successfulRows === 0 && errorCount > 0) {
    return { status: "FAILED", shouldMarkFailed: true };
  }

  if (errorCount > 0 || duplicateCount > 0) {
    return { status: "PARTIALLY_COMPLETED", shouldMarkFailed: false };
  }

  return { status: "COMPLETED", shouldMarkFailed: false };
};

export const buildBatchInsertData = (
  validRows: Prisma.FeedbackCreateManyInput[],
  batchSize: number = 500,
): Prisma.FeedbackCreateManyInput[][] => {
  const batches: Prisma.FeedbackCreateManyInput[][] = [];

  for (let i = 0; i < validRows.length; i += batchSize) {
    batches.push(validRows.slice(i, i + batchSize));
  }

  return batches;
};
