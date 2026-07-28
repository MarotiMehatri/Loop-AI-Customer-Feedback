export const ASK_LOOP_LIMITS = {
  CONTEXT_FEEDBACK_LIMIT: 50,
  HISTORY_MESSAGE_LIMIT: 12,
  SUGGESTION_LIMIT: 6,
  MAX_QUESTION_LENGTH: 2000,
  MIN_QUESTION_LENGTH: 2,
  MAX_NOTE_LENGTH: 500,
  CONVERSATION_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
  SAVED_QUERY_LIMIT: 50,
} as const;

export const DEFAULT_SUGGESTED_QUESTIONS = [
  "What are customers complaining about most?",
  "Show me the negative feedback trend.",
  "What are the top themes this week?",
  "Which source has the most negative feedback?",
  "Show me the sentiment distribution.",
  "What do customers like the most?",
] as const;

export const CITATION_SOURCES = {
  FEEDBACK: "feedback",
  THEME: "theme",
  ANALYTICS: "analytics",
} as const;

export const ASK_LOOP_MESSAGES = {
  answered: "Question answered successfully",
  conversationRetrieved: "Conversation retrieved successfully",
  conversationsListed: "Conversations listed successfully",
  conversationDeleted: "Conversation deleted successfully",
  suggestionsRetrieved: "Suggestions retrieved successfully",
  feedbackSaved: "Feedback saved successfully",
  feedbackRetrieved: "Feedback retrieved successfully",
  savedQueryCreated: "Saved query created successfully",
  savedQueryListed: "Saved queries listed successfully",
  savedQueryDeleted: "Saved query deleted successfully",
  savedQueryUpdated: "Saved query updated successfully",
  notFound: "Conversation not found",
  queryNotFound: "Saved query not found",
  authenticationRequired: "Authentication is required",
  workspaceRequired: "Workspace is required",
  forbidden: "You do not have permission to perform this action",
  questionRequired: "Question is required",
  messageNotFound: "Message not found",
} as const;
