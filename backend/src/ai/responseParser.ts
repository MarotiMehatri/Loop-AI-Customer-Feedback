import { z } from "zod";

import { AIServiceError } from "./aiErrorHandler.js";

import type {
  AskLoopStructuredResponse,
  FeedbackClassification,
  GeneratedReport,
  ThemeCluster,
} from "./ai.types.js";

const askLoopResponseSchema = z.object({
  answer: z.string().min(1),

  summary: z.string().nullable().default(null),

  followUpQuestions: z.array(z.string()).default([]),

  referencedSourceIds: z.array(z.string()).default([]),
});

const classificationSchema = z.object({
  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),

  sentimentScore: z.number().min(-1).max(1),

  category: z.enum([
    "BUG",
    "FEATURE_REQUEST",
    "CUSTOMER_SUPPORT",
    "PRICING",
    "USER_EXPERIENCE",
    "PERFORMANCE",
    "SECURITY",
    "OTHER",
  ]),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),

  themes: z.array(z.string()),

  summary: z.string(),

  actionable: z.boolean(),

  suggestedAction: z.string().nullable(),

  confidence: z.number().min(0).max(1),
});

const generatedReportSchema = z.object({
  title: z.string(),
  executiveSummary: z.string(),
  keyFindings: z.array(z.string()),
  positiveInsights: z.array(z.string()),
  negativeInsights: z.array(z.string()),
  recommendations: z.array(z.string()),
  conclusion: z.string(),
});

const themeClusterSchema = z.object({
  name: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
  feedbackIds: z.array(z.string()),

  sentiment: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),

  importance: z.number().min(0).max(1),
});

function removeMarkdownCodeBlock(value: string): string {
  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

export function parseJSONResponse(value: string): unknown {
  try {
    return JSON.parse(removeMarkdownCodeBlock(value));
  } catch (error) {
    throw new AIServiceError(
      "INVALID_RESPONSE",
      "Gemini returned invalid JSON.",
      502,
      error,
    );
  }
}

export function parseAskLoopResponse(value: string): AskLoopStructuredResponse {
  const parsed = parseJSONResponse(value);

  return askLoopResponseSchema.parse(parsed);
}

export function parseClassificationResponse(
  value: string,
): FeedbackClassification {
  const parsed = parseJSONResponse(value);

  return classificationSchema.parse(parsed);
}

export function parseReportResponse(value: string): GeneratedReport {
  const parsed = parseJSONResponse(value);

  return generatedReportSchema.parse(parsed);
}

export function parseThemeClusterResponse(value: string): ThemeCluster[] {
  const parsed = parseJSONResponse(value);

  return z.array(themeClusterSchema).parse(parsed);
}
