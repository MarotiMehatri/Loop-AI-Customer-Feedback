import type { GeneratedReport, ReportGenerationInput } from "../ai.types.js";

import { generateGeminiContent } from "../gemini.client.js";

import { formatFeedbackDocuments } from "../promptBuilder.js";

import { parseReportResponse } from "../responseParser.js";

import { REPORT_SYSTEM_PROMPT } from "../prompts/report.prompt.js";

class ReportService {
  async generateReport(input: ReportGenerationInput): Promise<GeneratedReport> {
    const prompt = `
REPORT TITLE:
${input.title}

REPORT TYPE:
${input.reportType}

PERIOD:
${input.period}

FEEDBACK:
${formatFeedbackDocuments(input.feedback)}

Return the report as valid JSON.
`.trim();

    const response = await generateGeminiContent({
      systemInstruction: REPORT_SYSTEM_PROMPT,

      prompt,

      responseMimeType: "application/json",

      temperature: 0.2,

      maxOutputTokens: 3000,
    });

    return parseReportResponse(response.text);
  }
}

export const reportService = new ReportService();
