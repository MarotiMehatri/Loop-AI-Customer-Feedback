import { env } from "./env.js";

export const embeddingConfig = {
  model: env.GEMINI_EMBEDDING_MODEL,

  dimensions: 768,

  batchSize: 10,

  similarityThreshold: 0.7,

  maxRetries: 3,

  retryDelayMs: 1000,
} as const;
