import { logger } from "../config/logger.js";

import { embeddingService } from "../ai/embedding.service.js";

export interface GenerateEmbeddingJobInput {
  feedbackId: string;
  workspaceId: string;
}

function validateInput(input: GenerateEmbeddingJobInput): void {
  if (!input.feedbackId) {
    throw new Error("Feedback ID is required for embedding generation");
  }

  if (!input.workspaceId) {
    throw new Error("Workspace ID is required for embedding generation");
  }
}

export async function runGenerateEmbeddingJob(
  input: GenerateEmbeddingJobInput,
): Promise<void> {
  validateInput(input);

  try {
    logger.info(
      `[GenerateEmbeddingJob] Starting embedding generation for feedback ${input.feedbackId}`,
    );

    await embeddingService.generateFeedbackEmbedding({
      feedbackId: input.feedbackId,
      workspaceId: input.workspaceId,
    });

    logger.info(
      `[GenerateEmbeddingJob] Embedding generated for feedback ${input.feedbackId}`,
    );
  } catch (error) {
    logger.error(
      `[GenerateEmbeddingJob] Embedding generation failed for feedback ${input.feedbackId}`,
      error,
    );

    throw error;
  }
}
