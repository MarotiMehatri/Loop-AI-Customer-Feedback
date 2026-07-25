import { generateGeminiContent } from "../../ai/gemini.client.js";

import { REPORT_SYSTEM_PROMPT } from "../../ai/prompts/report.prompt.js";

import { parseReportResponse } from "../../ai/responseParser.js";

import type { GeneratedReport } from "../../ai/ai.types.js";

import type { ReportPreview } from "./report.types.js";

export async function generateAIReport(input: {
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
}
