import type { FeedbackClassification } from "../ai/ai.types.js";

import { classificationService } from "../ai/services/classification.service.js";

import { logger } from "../config/logger.js";

import { prisma } from "../config/prisma.js";

export interface ClassifyFeedbackJobInput {
  feedbackId: string;
  workspaceId: string;
}

export interface ClassifyFeedbackJobResult {
  feedbackId: string;
  workspaceId: string;
  classification: FeedbackClassification;
}

function validateJobInput(input: ClassifyFeedbackJobInput): void {
  if (!input.feedbackId.trim()) {
    throw new Error("Feedback ID is required for classification.");
  }

  if (!input.workspaceId.trim()) {
    throw new Error("Workspace ID is required for classification.");
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function runClassifyFeedbackJob(
  input: ClassifyFeedbackJobInput,
): Promise<ClassifyFeedbackJobResult> {
  validateJobInput(input);

  try {
    logger.info(
      `[ClassifyFeedbackJob] Starting classification for feedback ${input.feedbackId}`,
    );

    const feedback = await prisma.feedback.findFirst({
      where: {
        id: input.feedbackId,
        workspaceId: input.workspaceId,
      },

      select: {
        id: true,
        content: true,
        workspaceId: true,
      },
    });

    if (!feedback) {
      throw new Error(
        `Feedback ${input.feedbackId} was not found in workspace ${input.workspaceId}.`,
      );
    }

    const normalizedContent = feedback.content.trim();

    if (!normalizedContent) {
      throw new Error(`Feedback ${feedback.id} has empty content.`);
    }

    const classification =
      await classificationService.classifyFeedback(normalizedContent);

    logger.info(
      `[ClassifyFeedbackJob] Classification completed for feedback ${feedback.id}`,
    );

    return {
      feedbackId: feedback.id,
      workspaceId: feedback.workspaceId,
      classification,
    };
  } catch (error) {
    logger.error(
      `[ClassifyFeedbackJob] Classification failed for feedback ${input.feedbackId}: ${getErrorMessage(error)}`,
    );

    throw error;
  }
}
