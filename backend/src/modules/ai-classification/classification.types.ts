import type { FeedbackClassification } from "../../ai/ai.types.js";

export type ClassificationSentiment = "POS" | "NEU" | "NEG";

export type ClassificationMethod = "ai" | "keyword" | "fallback";

export interface ClassifyFeedbackInput {
  content: string;
  source?: string;
  customerName?: string;
}

export interface ClassifyBatchInput {
  items: ClassifyFeedbackInput[];
}

export interface ClassificationResult {
  sentiment: ClassificationSentiment;
  category: string;
  tags: string[];
  confidence: number;
  summary?: string;
  method?: ClassificationMethod;
}

export interface BatchClassificationResult {
  results: ClassificationResult[];
  processedCount: number;
  failedCount: number;
  errors?: Array<{
    index: number;
    message: string;
  }>;
}

export interface SaveClassificationInput {
  feedbackId: string;
  sentiment: string;
  category: string;
  tags: string[];
  confidence: number;
  summary?: string;
  classifiedById: string;
  workspaceId: string;
}

export interface ClassificationRecord {
  id: string;
  feedbackId: string;
  sentiment: string;
  category: string;
  tags: string[];
  confidence: number;
  summary: string | null;
  method: string;
  classifiedById: string;
  workspaceId: string;
  createdAt: Date;
}

import type { Role } from "../../generated/prisma/client.js";

export interface ClassificationActorContext {
  userId: string;
  workspaceId: string;
  role: Role;
}

export interface ClassificationConfig {
  useAI: boolean;
  minConfidence: number;
  autoClassify: boolean;
  categories: string[];
  provider?: string;
}

export type AIClassificationPayload = FeedbackClassification;

export interface ListClassificationsQuery {
  page: number;
  limit: number;
  sentiment?: string;
  category?: string;
  startDate?: Date;
  endDate?: Date;
}
