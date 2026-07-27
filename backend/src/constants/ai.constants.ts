export const AI_MODELS = {
  GPT_4O: "gpt-4o",
  GPT_4O_MINI: "gpt-4o-mini",
  GPT_3_5_TURBO: "gpt-3.5-turbo",
} as const;

export type AIModel = (typeof AI_MODELS)[keyof typeof AI_MODELS];

export const AI_MODEL_LABELS: Record<AIModel, string> = {
  [AI_MODELS.GPT_4O]: "GPT-4o",
  [AI_MODELS.GPT_4O_MINI]: "GPT-4o Mini",
  [AI_MODELS.GPT_3_5_TURBO]: "GPT-3.5 Turbo",
};

export const AI_DEFAULTS = {
  MODEL: AI_MODELS.GPT_4O_MINI,
  TEMPERATURE: 0.7,
  MAX_TOKENS: 2048,
  TOP_P: 1.0,
  FREQUENCY_PENALTY: 0,
  PRESENCE_PENALTY: 0,
} as const;

export const AI_TOKEN_LIMITS: Record<AIModel, number> = {
  [AI_MODELS.GPT_4O]: 128000,
  [AI_MODELS.GPT_4O_MINI]: 128000,
  [AI_MODELS.GPT_3_5_TURBO]: 16385,
};

export const AI_RATE_LIMITS = {
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_REQUESTS_PER_DAY: 10000,
  MAX_CONCURRENT_REQUESTS: 5,
} as const;
