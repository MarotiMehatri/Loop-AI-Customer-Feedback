import { ApiError } from "../../utils/apiError.js";

import type {
  BatchClassificationResult,
  ClassifyBatchInput,
  ClassifyFeedbackInput,
  ClassificationResult,
} from "./aiClassification.types.js";

const MAX_BATCH_SIZE = 50;

const classifySingle = async (
  input: ClassifyFeedbackInput,
): Promise<ClassificationResult> => {
  const content = input.content.trim().toLowerCase();

  let sentiment: ClassificationResult["sentiment"] = "NEU";
  let confidence = 0.5;

  const positiveWords = [
    "great",
    "excellent",
    "amazing",
    "love",
    "fantastic",
    "wonderful",
    "perfect",
    "best",
    "happy",
    "satisfied",
    "thank",
    "awesome",
    "outstanding",
    "superb",
    "brilliant",
  ];
  const negativeWords = [
    "terrible",
    "awful",
    "hate",
    "worst",
    "horrible",
    "bad",
    "poor",
    "disappointed",
    "frustrated",
    "broken",
    "useless",
    "annoying",
    "waste",
    "fail",
    "problem",
  ];

  const posCount = positiveWords.filter((w) => content.includes(w)).length;
  const negCount = negativeWords.filter((w) => content.includes(w)).length;

  if (posCount > negCount) {
    sentiment = "POS";
    confidence = Math.min(0.95, 0.6 + posCount * 0.1);
  } else if (negCount > posCount) {
    sentiment = "NEG";
    confidence = Math.min(0.95, 0.6 + negCount * 0.1);
  }

  const categoryKeywords: Record<string, string[]> = {
    "Bug Report": ["bug", "error", "crash", "broken", "fix", "issue", "fail"],
    "Feature Request": [
      "feature",
      "request",
      "add",
      "wish",
      "need",
      "want",
      "should",
    ],
    "Performance": [
      "slow",
      "fast",
      "speed",
      "performance",
      "lag",
      "loading",
    ],
    Pricing: ["price", "cost", "expensive", "cheap", "plan", "subscription"],
    "User Experience": [
      "ui",
      "ux",
      "design",
      "interface",
      "easy",
      "difficult",
      "confusing",
    ],
    "Customer Support": [
      "support",
      "help",
      "response",
      "service",
      "agent",
      "ticket",
    ],
  };

  let category = "General";
  let maxMatches = 0;

  for (const [cat, keywords] of Object.entries(categoryKeywords)) {
    const matches = keywords.filter((k) => content.includes(k)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      category = cat;
    }
  }

  const tagSet = new Set<string>();

  if (sentiment === "POS") tagSet.add("positive");
  if (sentiment === "NEG") tagSet.add("negative");
  if (maxMatches > 0) tagSet.add(category.toLowerCase().replace(/\s+/g, "-"));
  if (content.length > 500) tagSet.add("detailed");
  if (input.source) tagSet.add(input.source.toLowerCase());

  return {
    sentiment,
    category,
    tags: Array.from(tagSet),
    confidence: Math.round(confidence * 100) / 100,
  };
};

export const classifyFeedback = async (
  input: ClassifyFeedbackInput,
): Promise<ClassificationResult> => {
  if (!input.content || input.content.trim().length === 0) {
    throw new ApiError(400, "Feedback content is required for classification");
  }

  return classifySingle(input);
};

export const classifyFeedbackBatch = async (
  input: ClassifyBatchInput,
): Promise<BatchClassificationResult> => {
  if (!input.items || input.items.length === 0) {
    throw new ApiError(400, "At least one item is required for batch classification");
  }

  if (input.items.length > MAX_BATCH_SIZE) {
    throw new ApiError(
      400,
      `Batch size cannot exceed ${MAX_BATCH_SIZE} items`,
    );
  }

  const results: ClassificationResult[] = [];
  const errors: Array<{ index: number; message: string }> = [];

  for (let i = 0; i < input.items.length; i++) {
    try {
      const result = await classifySingle(input.items[i]!);
      results.push(result);
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
};
