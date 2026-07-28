import fs from "node:fs/promises";

import { parse } from "csv-parse/sync";

import { FEEDBACK_IMPORT_CONFIG, REQUIRED_CSV_COLUMNS } from "./feedbackImport.constants.js";
import { CsvParsingError, CsvValidationError } from "./feedbackImport.error.js";

import type { CsvFeedbackRow } from "./feedbackImport.types.js";

interface ParsedCsvResult {
  rows: CsvFeedbackRow[];
  totalRows: number;
  headers: string[];
}

export const parseCsvBuffer = (buffer: Buffer): ParsedCsvResult => {
  let records: Record<string, string>[];

  try {
    records = parse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
      relax_column_count: true,
    });
  } catch (error) {
    throw new CsvParsingError(
      error instanceof Error ? error.message : "Failed to parse CSV file",
      error,
    );
  }

  if (records.length === 0) {
    throw new CsvParsingError("CSV file is empty or contains no data rows");
  }

  const headers = Object.keys(records[0] ?? {});

  validateCsvHeaders(headers);

  const rows = records as unknown as CsvFeedbackRow[];

  return {
    rows,
    totalRows: rows.length,
    headers,
  };
};

export const parseCsvFile = async (filePath: string): Promise<ParsedCsvResult> => {
  let fileContent: Buffer;

  try {
    fileContent = await fs.readFile(filePath);
  } catch {
    throw new CsvParsingError("Failed to read CSV file");
  }

  return parseCsvBuffer(fileContent);
};

export const validateCsvHeaders = (headers: string[]): void => {
  const normalizedHeaders = headers.map((h) => h.trim().toLowerCase());

  const missingRequired = REQUIRED_CSV_COLUMNS.filter(
    (col) => !normalizedHeaders.includes(col.toLowerCase()),
  );

  if (missingRequired.length > 0) {
    throw new CsvValidationError(
      `Missing required CSV columns: ${missingRequired.join(", ")}. Found columns: ${headers.join(", ")}`,
      { field: missingRequired.join(",") },
    );
  }
};

export const validateFileSize = (fileSize: number): void => {
  if (fileSize > FEEDBACK_IMPORT_CONFIG.maximumFileSize) {
    throw new CsvValidationError(
      `File size ${(fileSize / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${(FEEDBACK_IMPORT_CONFIG.maximumFileSize / 1024 / 1024).toFixed(2)}MB`,
    );
  }
};

export const validateRowCount = (count: number): void => {
  if (count === 0) {
    throw new CsvValidationError("CSV file contains no data rows");
  }

  if (count > FEEDBACK_IMPORT_CONFIG.maximumRows) {
    throw new CsvValidationError(
      `CSV file contains ${count} rows, exceeding the maximum allowed limit of ${FEEDBACK_IMPORT_CONFIG.maximumRows}`,
    );
  }
};
