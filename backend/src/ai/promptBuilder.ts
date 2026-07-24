import type { AIConversationMessage, FeedbackDocument } from "./ai.types.js";

export function formatConversationHistory(
  messages: AIConversationMessage[],
): string {
  if (messages.length === 0) {
    return "No previous conversation.";
  }

  return messages
    .map((message) => {
      const role =
        message.role === "assistant" ? "LOOP AI" : message.role.toUpperCase();

      return `${role}: ${message.content}`;
    })
    .join("\n");
}

export function formatFeedbackDocuments(documents: FeedbackDocument[]): string {
  if (documents.length === 0) {
    return "No relevant feedback documents were found.";
  }

  return documents
    .map((document, index) => {
      return [
        `[SOURCE ${index + 1}]`,
        `ID: ${document.id}`,
        `Title: ${document.title ?? "Customer feedback"}`,
        `Source: ${document.source ?? "Unknown"}`,
        `Content: ${document.content}`,
      ].join("\n");
    })
    .join("\n\n");
}

export function buildAskLoopPrompt(input: {
  question: string;
  history: AIConversationMessage[];
  documents: FeedbackDocument[];
}): string {
  return `
USER QUESTION:
${input.question}

CONVERSATION HISTORY:
${formatConversationHistory(input.history)}

RELEVANT CUSTOMER FEEDBACK:
${formatFeedbackDocuments(input.documents)}

Answer the user's question using the supplied feedback context.
Return only the required JSON object.
`.trim();
}

export function buildClassificationPrompt(feedback: string): string {
  return `
Classify the following customer feedback:

${feedback}

Return valid JSON only.
`.trim();
}

export function buildSummaryPrompt(feedback: FeedbackDocument[]): string {
  return `
Summarize the following customer feedback:

${formatFeedbackDocuments(feedback)}

Return a clear business summary.
`.trim();
}
