export const CLASSIFICATION_MAX_BATCH_SIZE = 50;
export const CLASSIFICATION_MAX_CONTENT_LENGTH = 10000;
export const CLASSIFICATION_MIN_CONTENT_LENGTH = 1;
export const CLASSIFICATION_DEFAULT_CONFIDENCE = 0.5;
export const CLASSIFICATION_CACHE_TTL_MS = 60 * 60 * 1000;
export const CLASSIFICATION_RETRY_MAX_ATTEMPTS = 3;
export const CLASSIFICATION_RETRY_DELAY_MS = 1000;

export const CLASSIFICATION_SENTIMENT_LABELS = {
  POS: "Positive",
  NEU: "Neutral",
  NEG: "Negative",
} as const;

export const CLASSIFICATION_CATEGORIES = [
  "Bug Report",
  "Feature Request",
  "Performance",
  "Pricing",
  "User Experience",
  "Customer Support",
  "General",
] as const;

export const CLASSIFICATION_MESSAGES = {
  classified: "Feedback classified successfully",
  batchClassified: "Batch classification completed",
  retrieved: "Classification retrieved successfully",
  listed: "Classifications listed successfully",
  deleted: "Classification deleted successfully",
  notFound: "Classification not found",
  authenticationRequired: "Authentication is required",
  workspaceRequired: "Workspace is required",
  forbidden: "You do not have permission to perform classification",
  contentRequired: "Feedback content is required for classification",
  batchSizeExceeded: `Batch size cannot exceed ${CLASSIFICATION_MAX_BATCH_SIZE} items`,
  aiServiceUnavailable: "AI classification service is unavailable, using keyword-based fallback",
  feedbackNotFound: "Feedback record not found",
} as const;
