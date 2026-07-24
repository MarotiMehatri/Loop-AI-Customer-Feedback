import { generateGeminiContent } from "../../ai/gemini.client.js";

import { ASK_LOOP_SYSTEM_PROMPT } from "../../ai/prompts/askLoop.prompt.js";

import { Prisma } from "../../generated/prisma/client.js";

import { ApiError } from "../../utils/apiError.js";

import { DEFAULT_SUGGESTED_QUESTIONS } from "./askLoop.constants.js";

import { buildAskLoopContext } from "./askLoop.context.js";

import { parseAskLoopResponse } from "./askLoop.mapper.js";

import { askLoopRepository } from "./askLoop.repository.js";

import type { AskLoopAnswer, AskLoopQueryInput } from "./askLoop.types.js";

/**
 * Creates a short title for a new Ask LOOP conversation.
 */
function createConversationTitle(question: string): string {
  const normalizedQuestion = question.replace(/\s+/g, " ").trim();

  if (normalizedQuestion.length <= 70) {
    return normalizedQuestion;
  }

  return `${normalizedQuestion.slice(0, 67)}...`;
}

/**
 * Converts database conversation roles into readable prompt roles.
 */
function formatRole(role: string): string {
  switch (role) {
    case "USER":
      return "User";

    case "ASSISTANT":
      return "LOOP AI";

    case "SYSTEM":
      return "System";

    default:
      return role;
  }
}

/**
 * Creates the complete user prompt sent to Gemini.
 *
 * It combines:
 * 1. Current user question
 * 2. Previous conversation history
 * 3. Workspace customer-feedback context
 */
function createAskLoopUserPrompt(input: {
  question: string;

  context: string;

  history: Array<{
    role: string;
    content: string;
  }>;
}): string {
  const historyText =
    input.history.length > 0
      ? input.history
          .map((message) => `${formatRole(message.role)}: ${message.content}`)
          .join("\n")
      : "No previous conversation history.";

  return `
USER QUESTION:
${input.question}

CONVERSATION HISTORY:
${historyText}

WORKSPACE FEEDBACK CONTEXT:
${input.context}

INSTRUCTIONS:
- Answer the user's question using only the supplied workspace feedback context.
- Consider the previous conversation when it is relevant.
- Do not invent feedback, statistics, customers, themes or dates.
- If the supplied context is insufficient, clearly explain that.
- Return only the JSON structure requested in the system instruction.
`.trim();
}

export const askLoopService = {
  /**
   * Ask a new question or continue an existing conversation.
   */
  async ask(input: AskLoopQueryInput): Promise<AskLoopAnswer> {
    const normalizedQuestion = input.question.trim();

    if (!normalizedQuestion) {
      throw new ApiError(400, "Question is required");
    }

    /*
     * Find an existing conversation or create a new one.
     */
    let conversation;

    if (input.conversationId) {
      conversation = await askLoopRepository.findConversation(
        input.conversationId,
        input.workspaceId,
        input.userId,
      );

      if (!conversation) {
        throw new ApiError(404, "Conversation not found");
      }
    } else {
      conversation = await askLoopRepository.createConversation(
        input.workspaceId,
        input.userId,
        createConversationTitle(normalizedQuestion),
      );
    }

    /*
     * Save the user's question.
     */
    await askLoopRepository.saveMessage({
      conversationId: conversation.id,
      role: "USER",
      content: normalizedQuestion,
    });

    /*
     * Load feedback analytics context and conversation history.
     */
    const [contextData, recentMessages] = await Promise.all([
      askLoopRepository.getContext(
        input.workspaceId,
        input.startDate,
        input.endDate,
      ),

      askLoopRepository.getRecentConversationMessages(conversation.id),
    ]);

    /*
     * The repository normally returns recent messages in descending order.
     * Create a copy before reversing to avoid mutating repository data.
     */
    const history = [...recentMessages].reverse().map((message) => ({
      role: message.role,
      content: message.content,
    }));

    /*
     * Convert database analytics data into text for Gemini.
     */
    const formattedContext = buildAskLoopContext(contextData);

    /*
     * Create the final user prompt.
     */
    const userPrompt = createAskLoopUserPrompt({
      question: normalizedQuestion,
      context: formattedContext,
      history,
    });

    /*
     * Send the prompt to Gemini.
     */
    const aiResult = await generateGeminiContent({
      systemInstruction: ASK_LOOP_SYSTEM_PROMPT,

      prompt: userPrompt,

      temperature: 0.2,

      maxOutputTokens: 2000,

      responseMimeType: "application/json",
    });

    /*
     * Validate and convert Gemini JSON into the application format.
     */
    const parsed = parseAskLoopResponse(aiResult.text);

    /*
     * Convert chart data into a Prisma-compatible JSON value.
     */
    const chartData = parsed.chart
      ? ({
          type: parsed.chart.type,
          title: parsed.chart.title,
          labels: parsed.chart.labels,
          values: parsed.chart.values,
        } satisfies Prisma.InputJsonObject)
      : undefined;

    /*
     * Convert metadata into a Prisma-compatible JSON value.
     */
    const metadata = {
      summary: parsed.summary ?? null,

      followUpQuestions: parsed.followUpQuestions,

      model: aiResult.model,

      totalTokens: aiResult.usage.totalTokens ?? null,
    } satisfies Prisma.InputJsonObject;

    /*
     * Save the assistant response.
     */
    const assistantMessage = await askLoopRepository.saveMessage({
      conversationId: conversation.id,

      role: "ASSISTANT",

      content: parsed.answer,

      chart: chartData,

      metadata,

      promptTokens: aiResult.usage.promptTokens ?? 0,

      completionTokens: aiResult.usage.completionTokens ?? 0,
    });

    return {
      conversationId: conversation.id,

      messageId: assistantMessage.id,

      answer: parsed.answer,

      summary: parsed.summary,

      chart: parsed.chart,

      followUpQuestions: parsed.followUpQuestions,

      createdAt: assistantMessage.createdAt,
    };
  },

  /**
   * Get one conversation and all its messages.
   */
  async getConversation(
    conversationId: string,
    workspaceId: string,
    userId: string,
  ) {
    const conversation = await askLoopRepository.findConversation(
      conversationId,
      workspaceId,
      userId,
    );

    if (!conversation) {
      throw new ApiError(404, "Conversation not found");
    }

    const messages =
      await askLoopRepository.getConversationMessages(conversationId);

    return {
      ...conversation,
      messages,
    };
  },

  /**
   * Get paginated conversations belonging to a user.
   */
  async listConversations(
    workspaceId: string,
    userId: string,
    page: number,
    limit: number,
  ) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);

    const result = await askLoopRepository.listConversations(
      workspaceId,
      userId,
      safePage,
      safeLimit,
    );

    return {
      items: result.items,

      pagination: {
        page: safePage,

        limit: safeLimit,

        total: result.total,

        totalPages: Math.ceil(result.total / safeLimit),
      },
    };
  },

  /**
   * Delete a conversation belonging to the current user.
   */
  async deleteConversation(
    conversationId: string,
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    const result = await askLoopRepository.deleteConversation(
      conversationId,
      workspaceId,
      userId,
    );

    if (result.count === 0) {
      throw new ApiError(404, "Conversation not found");
    }
  },

  /**
   * Return default suggested questions.
   */
  getSuggestions() {
    return DEFAULT_SUGGESTED_QUESTIONS;
  },

  /**
   * Save helpful or not-helpful feedback for an AI message.
   */
  async saveMessageFeedback(input: {
    messageId: string;
    userId: string;
    helpful: boolean;
    note?: string;
  }) {
    const normalizedNote = input.note?.trim();

    return askLoopRepository.saveMessageFeedback({
      messageId: input.messageId,

      userId: input.userId,

      helpful: input.helpful,

      note:
        normalizedNote && normalizedNote.length > 0
          ? normalizedNote
          : undefined,
    });
  },
};
