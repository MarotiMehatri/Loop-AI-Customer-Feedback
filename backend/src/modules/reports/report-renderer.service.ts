import { generateGeminiContent } from "../../ai/gemini.client.js";
import { REPORT_SYSTEM_PROMPT } from "../../ai/prompts/report.prompt.js";
import { parseReportResponse } from "../../ai/responseParser.js";
import type { GeneratedReport } from "../../ai/ai.types.js";
import type { Report, ReportExportFormat, ReportPreview } from "./report.types.js";

export interface ReportExportResult {
  fileName: string;
  contentType: string;
  content: Buffer;
}

function escapeCsv(value: unknown): string {
  const text = value === null || value === undefined
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

function createFileName(title: string, extension: string): string {
  const normalized = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const date = new Date().toISOString().slice(0, 10);
  return `${normalized || "report"}-${date}.${extension}`;
}

export const reportRendererService = {
  async generateAIReportContent(input: {
    title: string;
    type: string;
    description?: string | null;
    startDate?: Date | null;
    endDate?: Date | null;
    preview: ReportPreview;
  }): Promise<GeneratedReport> {
    const prompt = `
REPORT TITLE:
${input.title}

REPORT TYPE:
${input.type}

DESCRIPTION:
${input.description ?? "No description provided"}

DATE RANGE:
${input.startDate?.toISOString() ?? "Not specified"}
to
${input.endDate?.toISOString() ?? "Not specified"}

REPORT DATA:
${JSON.stringify(input.preview, null, 2)}

Create an accurate customer-feedback report.
Return valid JSON only.
    `.trim();

    const result = await generateGeminiContent({
      systemInstruction: REPORT_SYSTEM_PROMPT,
      prompt,
      temperature: 0.2,
      maxOutputTokens: 3000,
      responseMimeType: "application/json",
    });

    return parseReportResponse(result.text);
  },

  exportReport(
    report: Report,
    format: ReportExportFormat,
  ): ReportExportResult {
    if (format === "JSON") {
      return {
        fileName: createFileName(report.title, "json"),
        contentType: "application/json; charset=utf-8",
        content: Buffer.from(JSON.stringify(report, null, 2), "utf8"),
      };
    }

    return {
      fileName: createFileName(report.title, "csv"),
      contentType: "text/csv; charset=utf-8",
      content: Buffer.from(createCsv(report), "utf8"),
    };
  },
};
