export interface GenerateFeedbackEmbeddingInput {
  feedbackId: string;
  workspaceId: string;
}

export const embeddingService = {
  async generateFeedbackEmbedding(
    input: GenerateFeedbackEmbeddingInput,
  ): Promise<void> {
    // Embedding implementation
  },
};
