export const FEEDBACK_IMPORT_CONFIG = {
  maximumFileSize: 5 * 1024 * 1024,
  maximumRows: 10_000,
  allowedMimeTypes: [
    "text/csv",
    "application/vnd.ms-excel",
  ],
} as const;

export const REQUIRED_CSV_COLUMNS = [
  "content",
  "source",
] as const;

export const OPTIONAL_CSV_COLUMNS = [
  "customerName",
  "customerEmail",
  "sentiment",
  "status",
  "category",
  "tags",
  "createdAt",
] as const;