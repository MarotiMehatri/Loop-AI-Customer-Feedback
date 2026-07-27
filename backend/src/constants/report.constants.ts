export const REPORT_STATUSES = {
  PENDING: "PENDING",
  GENERATING: "GENERATING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;

export type ReportStatus = (typeof REPORT_STATUSES)[keyof typeof REPORT_STATUSES];

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  [REPORT_STATUSES.PENDING]: "Pending",
  [REPORT_STATUSES.GENERATING]: "Generating",
  [REPORT_STATUSES.COMPLETED]: "Completed",
  [REPORT_STATUSES.FAILED]: "Failed",
};

export const REPORT_TYPES = {
  FEEDBACK_SUMMARY: "FEEDBACK_SUMMARY",
  SENTIMENT_ANALYSIS: "SENTIMENT_ANALYSIS",
  THEME_ANALYSIS: "THEME_ANALYSIS",
  TREND_REPORT: "TREND_REPORT",
  CUSTOMER_SATISFACTION: "CUSTOMER_SATISFACTION",
  CUSTOM: "CUSTOM",
} as const;

export type ReportType = (typeof REPORT_TYPES)[keyof typeof REPORT_TYPES];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  [REPORT_TYPES.FEEDBACK_SUMMARY]: "Feedback Summary",
  [REPORT_TYPES.SENTIMENT_ANALYSIS]: "Sentiment Analysis",
  [REPORT_TYPES.THEME_ANALYSIS]: "Theme Analysis",
  [REPORT_TYPES.TREND_REPORT]: "Trend Report",
  [REPORT_TYPES.CUSTOMER_SATISFACTION]: "Customer Satisfaction",
  [REPORT_TYPES.CUSTOM]: "Custom",
};

export const REPORT_EXPORT_FORMATS = {
  PDF: "pdf",
  CSV: "csv",
  XLSX: "xlsx",
  JSON: "json",
} as const;

export type ReportExportFormat = (typeof REPORT_EXPORT_FORMATS)[keyof typeof REPORT_EXPORT_FORMATS];

export const REPORT_EXPORT_FORMAT_LABELS: Record<ReportExportFormat, string> = {
  [REPORT_EXPORT_FORMATS.PDF]: "PDF",
  [REPORT_EXPORT_FORMATS.CSV]: "CSV",
  [REPORT_EXPORT_FORMATS.XLSX]: "Excel",
  [REPORT_EXPORT_FORMATS.JSON]: "JSON",
};
