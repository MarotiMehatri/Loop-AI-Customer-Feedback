export const SENTIMENTS = {
  POSITIVE: "POSITIVE",
  NEUTRAL: "NEUTRAL",
  NEGATIVE: "NEGATIVE",
} as const;

export type Sentiment = (typeof SENTIMENTS)[keyof typeof SENTIMENTS];

export const SENTIMENT_LABELS: Record<Sentiment, string> = {
  [SENTIMENTS.POSITIVE]: "Positive",
  [SENTIMENTS.NEUTRAL]: "Neutral",
  [SENTIMENTS.NEGATIVE]: "Negative",
};

export const SENTIMENT_COLORS: Record<Sentiment, string> = {
  [SENTIMENTS.POSITIVE]: "#22c55e",
  [SENTIMENTS.NEUTRAL]: "#eab308",
  [SENTIMENTS.NEGATIVE]: "#ef4444",
};

export const SENTIMENT_THRESHOLDS = {
  POSITIVE_MIN_SCORE: 0.6,
  NEGATIVE_MAX_SCORE: 0.4,
} as const;
