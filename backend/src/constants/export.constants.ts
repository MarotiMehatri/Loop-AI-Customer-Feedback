export const EXPORT_FORMATS = {
  PDF: "pdf",
  CSV: "csv",
  XLSX: "xlsx",
  JSON: "json",
} as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[keyof typeof EXPORT_FORMATS];

export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  [EXPORT_FORMATS.PDF]: "PDF",
  [EXPORT_FORMATS.CSV]: "CSV",
  [EXPORT_FORMATS.XLSX]: "Excel",
  [EXPORT_FORMATS.JSON]: "JSON",
};

export const EXPORT_FORMAT_MIME_TYPES: Record<ExportFormat, string> = {
  [EXPORT_FORMATS.PDF]: "application/pdf",
  [EXPORT_FORMATS.CSV]: "text/csv",
  [EXPORT_FORMATS.XLSX]: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  [EXPORT_FORMATS.JSON]: "application/json",
};

export const EXPORT_MAX_ROWS = {
  CSV: 100000,
  XLSX: 1000000,
  PDF: 10000,
  JSON: 1000000,
} as const;

export const EXPORT_DEFAULTS = {
  FORMAT: EXPORT_FORMATS.CSV,
  MAX_ROWS: 10000,
  BATCH_SIZE: 1000,
} as const;
