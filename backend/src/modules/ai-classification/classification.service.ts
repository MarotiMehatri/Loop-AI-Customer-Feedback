import { ApiError } from "../../utils/apiError.js";

import { classifyByKeywords, mergeClassificationResults, validateContent } from "./classification.processor.js";
import { classificationRepository } from "./classification.repository.js";
import { classificationFallbackService } from "./classification-fallback.service.js";
import { assertCanClassify } from "./classification.permissions.js";
import { CLASSIFICATION_MESSAGES } from "./classification.constants.js";
import { mapClassificationResult } from "./classification.mapper.js";

import type {
  BatchClassificationResult,
  ClassifyBatchInput,
  ClassifyFeedbackInput,
  ClassificationActorContext,
  ClassificationResult,
  ListClassificationsQuery,
  SaveClassificationInput,
} from "./classification.types.js";

async function classifyWithAI(content: string): Promise<ClassificationResult | null> {
  try {
    const { classificationService } = await import("../../ai/services/classification.service.js");

    const result = await classificationService.classifyFeedback(content);

    const sentimentMap: Record<string, "POS" | "NEU" | "NEG"> = {
      POSITIVE: "POS",
      NEUTRAL: "NEU",
      NEGATIVE: "NEG",
    };

    return {
      sentiment: sentimentMap[result.sentiment] ?? "NEU",
      category: result.category ?? "General",
      tags: result.themes ?? [],
      confidence: result.confidence ?? 0.5,
      summary: result.summary,
      method: "ai",
    };
  } catch {
    return null;
  }
}

export const classificationService = {
  async classify(
    actor: ClassificationActorContext,
    input: ClassifyFeedbackInput,
  ): Promise<ClassificationResult> {
    assertCanClassify(actor.role);

    const validationError = validateContent(input.content);
    if (validationError) {
      throw new ApiError(400, validationError);
    }

    const aiResult = await classifyWithAI(input.content);
    const keywordResult = classifyByKeywords(input.content);

    return mergeClassificationResults(aiResult, keywordResult);
  },

  async classifyBatch(
    actor: ClassificationActorContext,
    input: ClassifyBatchInput,
  ): Promise<BatchClassificationResult> {
    assertCanClassify(actor.role);

    if (!input.items || input.items.length === 0) {
      throw new ApiError(400, CLASSIFICATION_MESSAGES.contentRequired);
    }

    if (input.items.length > 50) {
      throw new ApiError(400, CLASSIFICATION_MESSAGES.batchSizeExceeded);
    }

    const results: ClassificationResult[] = [];
    const errors: Array<{ index: number; message: string }> = [];

    for (let i = 0; i < input.items.length; i++) {
      try {
        const item = input.items[i];
        if (!item) continue;

        const validationError = validateContent(item.content);
        if (validationError) {
          errors.push({ index: i, message: validationError });
          continue;
        }

        const result = await classifyWithAI(item.content);
        const keywordResult = classifyByKeywords(item.content);
        const merged = mergeClassificationResults(result, keywordResult);

        results.push(merged);
      } catch (error) {
        errors.push({
          index: i,
          message: error instanceof Error ? error.message : "Classification failed",
        });
      }
    }

    return {
      results,
      processedCount: results.length,
      failedCount: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    };
  },

  async classifyFeedbackById(
    actor: ClassificationActorContext,
    feedbackId: string,
  ): Promise<ClassificationResult> {
    assertCanClassify(actor.role);

    const feedback = await classificationRepository.findById(feedbackId, actor.workspaceId);
    if (!feedback) {
      throw new ApiError(404, CLASSIFICATION_MESSAGES.feedbackNotFound);
    }

    const input: ClassifyFeedbackInput = {
      content: feedback.content,
      source: feedback.source,
    };

    const result = await this.classify(actor, input);

    await classificationRepository.save({
      feedbackId,
      sentiment: result.sentiment === "POS" ? "POSITIVE" : result.sentiment === "NEG" ? "NEGATIVE" : "NEUTRAL",
      category: result.category,
      tags: result.tags,
      confidence: result.confidence,
      summary: result.summary,
      classifiedById: actor.userId,
      workspaceId: actor.workspaceId,
    });

    return result;
  },

  async list(
    actor: ClassificationActorContext,
    query: ListClassificationsQuery,
  ) {
    assertCanClassify(actor.role);

    const result = await classificationRepository.list(actor.workspaceId, query);

    return {
      items: result.items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    };
  },

  async classifyAndSave(
    actor: ClassificationActorContext,
    feedbackId: string,
    input: ClassifyFeedbackInput,
  ): Promise<ClassificationResult> {
    assertCanClassify(actor.role);

    const result = await this.classify(actor, input);

    await classificationRepository.save({
      feedbackId,
      sentiment: result.sentiment === "POS" ? "POSITIVE" : result.sentiment === "NEG" ? "NEGATIVE" : "NEUTRAL",
      category: result.category,
      tags: result.tags,
      confidence: result.confidence,
      summary: result.summary,
      classifiedById: actor.userId,
      workspaceId: actor.workspaceId,
    });

    return result;
  },
};
