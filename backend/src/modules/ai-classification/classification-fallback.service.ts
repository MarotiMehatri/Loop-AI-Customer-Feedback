import { classifyByKeywords, classifyBatchByKeywords } from "./classification.processor.js";
import type { BatchClassificationResult, ClassificationResult, ClassifyFeedbackInput } from "./classification.types.js";

export const classificationFallbackService = {
  async classify(input: ClassifyFeedbackInput): Promise<ClassificationResult> {
    return classifyByKeywords(input.content);
  },

  async classifyBatch(inputs: ClassifyFeedbackInput[]): Promise<BatchClassificationResult> {
    const results: ClassificationResult[] = [];
    const errors: Array<{ index: number; message: string }> = [];

    for (let i = 0; i < inputs.length; i++) {
      try {
        const result = classifyByKeywords(inputs[i]?.content ?? "");
        results.push({ ...result, method: "fallback" });
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
};
