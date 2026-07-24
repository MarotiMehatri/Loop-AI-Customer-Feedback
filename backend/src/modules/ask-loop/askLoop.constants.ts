export const ASK_LOOP_LIMITS = {
  CONTEXT_FEEDBACK_LIMIT: 50,
  HISTORY_MESSAGE_LIMIT: 12,
  SUGGESTION_LIMIT: 6,
} as const;

export const DEFAULT_SUGGESTED_QUESTIONS = [
  "What are customers complaining about most?",
  "Show me the negative feedback trend.",
  "What are the top themes this week?",
  "Which source has the most negative feedback?",
  "Show me the sentiment distribution.",
  "What do customers like the most?",
] as const;