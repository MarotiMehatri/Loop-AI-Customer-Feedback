import { ApiError } from "../../utils/apiError.js";

export class FeedbackImportError extends ApiError {
  public readonly importId?: string;
  public readonly rowNumber?: number;
  public readonly field?: string;
  public readonly errorCode?: string;

  constructor(
    statusCode: number,
    message: string,
    options?: {
      importId?: string;
      rowNumber?: number;
      field?: string;
      errorCode?: string;
      details?: unknown;
    },
  ) {
    super(statusCode, message, options?.details);
    this.name = "FeedbackImportError";
    this.importId = options?.importId;
    this.rowNumber = options?.rowNumber;
    this.field = options?.field;
    this.errorCode = options?.errorCode;
  }
}

export class CsvValidationError extends FeedbackImportError {
  constructor(message: string, options?: { rowNumber?: number; field?: string }) {
    super(400, message, {
      rowNumber: options?.rowNumber,
      field: options?.field,
      errorCode: "CSV_VALIDATION_ERROR",
    });
    this.name = "CsvValidationError";
  }
}

export class CsvParsingError extends FeedbackImportError {
  constructor(message: string, details?: unknown) {
    super(400, message, {
      errorCode: "CSV_PARSING_ERROR",
      details,
    });
    this.name = "CsvParsingError";
  }
}

export class FeedbackMappingError extends FeedbackImportError {
  constructor(message: string, options?: { rowNumber?: number; field?: string }) {
    super(400, message, {
      rowNumber: options?.rowNumber,
      field: options?.field,
      errorCode: "MAPPING_ERROR",
    });
    this.name = "FeedbackMappingError";
  }
}

export class ImportNotFoundError extends FeedbackImportError {
  constructor(importId?: string) {
    super(404, "Feedback import not found", {
      importId,
      errorCode: "IMPORT_NOT_FOUND",
    });
    this.name = "ImportNotFoundError";
  }
}

export class ImportAlreadyProcessingError extends FeedbackImportError {
  constructor(importId: string) {
    super(409, "This import is already being processed", {
      importId,
      errorCode: "IMPORT_ALREADY_PROCESSING",
    });
    this.name = "ImportAlreadyProcessingError";
  }
}

export class FileSizeExceededError extends FeedbackImportError {
  constructor(maxSizeBytes: number) {
    super(400, `File size exceeds the maximum allowed size of ${maxSizeBytes} bytes`, {
      errorCode: "FILE_SIZE_EXCEEDED",
    });
    this.name = "FileSizeExceededError";
  }
}

export class RowLimitExceededError extends FeedbackImportError {
  constructor(maxRows: number) {
    super(400, `CSV file exceeds the maximum allowed rows of ${maxRows}`, {
      errorCode: "ROW_LIMIT_EXCEEDED",
    });
    this.name = "RowLimitExceededError";
  }
}
