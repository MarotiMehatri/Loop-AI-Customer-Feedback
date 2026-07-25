import type { Report } from "../../generated/prisma/client.js";

import { createReportFileName } from "./report.helper.js";

import type { ReportExportFormat } from "./report.types.js";

export interface ReportExportResult {
  fileName: string;
  contentType: string;
  content: Buffer;
}

function escapeCsv(value: unknown): string {
  const text =
    value === null || value === undefined
      ? ""
      : typeof value === "string"
        ? value
        : JSON.stringify(value);

  return `"${text.replace(/"/g, '""')}"`;
}

function createCsv(report: Report): string {
  const rows = [
    ["Field", "Value"],
    ["Report ID", report.id],
    ["Title", report.title],
    ["Description", report.description ?? ""],
    ["Type", report.type],
    ["Status", report.status],
    ["Start Date", report.startDate?.toISOString() ?? ""],
    ["End Date", report.endDate?.toISOString() ?? ""],
    ["AI Summary", report.aiSummary ?? ""],
    ["Tags", report.tags.join(", ")],
    ["Generated At", report.generatedAt?.toISOString() ?? ""],
    ["Data", report.data ?? ""],
  ];

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

export function exportReport(
  report: Report,
  format: ReportExportFormat,
): ReportExportResult {
  if (format === "JSON") {
    return {
      fileName: createReportFileName(report.title, "json"),

      contentType: "application/json; charset=utf-8",

      content: Buffer.from(JSON.stringify(report, null, 2), "utf8"),
    };
  }

  return {
    fileName: createReportFileName(report.title, "csv"),

    contentType: "text/csv; charset=utf-8",

    content: Buffer.from(createCsv(report), "utf8"),
  };
}
