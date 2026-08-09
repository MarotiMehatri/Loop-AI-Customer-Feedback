import { generateGeminiContent } from "../../ai/gemini.client.js";
import { ASK_LOOP_SYSTEM_PROMPT } from "../../ai/prompts/askLoop.prompt.js";
import { Prisma } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/apiError.js";
import { assertCanAskQuestion, assertCanViewConversations, assertCanDeleteConversation } from "./ask-loop.permissions.js";
import { ASK_LOOP_MESSAGES } from "./ask-loop.constants.js";
import { askLoopConversation } from "./ask-loop.conversation.js";
import { askLoopRetrieval } from "./ask-loop.retrieval.js";
import { askLoopSuggestion } from "./ask-loop.suggestion.js";
import { askLoopFeedbackService } from "./ask-loop-feedback.service.js";
import { askLoopSavedQuery } from "./ask-loop.saved-query.js";
import { askLoopChartService } from "./ask-loop-chart.service.js";
import { parseAskLoopResponse, mapMetadataToJsonValue } from "./ask-loop.mapper.js";
import type { AskLoopActorContext, AskLoopAnswer, AskLoopQueryInput, AskLoopContext, ParsedAIResponse } from "./ask-loop.types.js";

export const askLoopService = {
  async ask(
    actor: AskLoopActorContext,
    input: Omit<AskLoopQueryInput, "workspaceId" | "userId"> & { conversationId?: string },
  ): Promise<AskLoopAnswer> {
    assertCanAskQuestion(actor.role);

    const normalizedQuestion = input.question.trim();
    if (!normalizedQuestion) {
      throw new ApiError(400, ASK_LOOP_MESSAGES.questionRequired);
    }

    let conversation;
    if (input.conversationId) {
      conversation = await askLoopConversation.findConversation(
        input.conversationId,
        actor.workspaceId,
        actor.userId,
      );

      if (!conversation) {
        throw new ApiError(404, ASK_LOOP_MESSAGES.notFound);
      }
    } else {
      conversation = await askLoopConversation.createConversation(
        actor.workspaceId,
        actor.userId,
        askLoopConversation.createTitle(normalizedQuestion),
      );
    }

    await askLoopConversation.saveMessage({
      conversationId: conversation.id,
      role: "USER",
      content: normalizedQuestion,
    });

    const [contextData, recentMessages] = await Promise.all([
      askLoopRetrieval.getContext(actor.workspaceId, input.startDate, input.endDate),
      askLoopConversation.getRecentConversationMessages(conversation.id),
    ]);

    const history = [...recentMessages].reverse().map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const formattedContext = buildAskLoopContext(contextData);

    const userPrompt = askLoopConversation.buildUserPrompt({
      question: normalizedQuestion,
      context: formattedContext,
      history,
    });

    let parsed: ParsedAIResponse;
    let model: string | undefined;
    let totalTokens: number | undefined;
    let promptTokens: number | undefined;
    let completionTokens: number | undefined;

    try {
      const aiResult = await generateGeminiContent({
        systemInstruction: ASK_LOOP_SYSTEM_PROMPT,
        prompt: userPrompt,
        temperature: 0.2,
        maxOutputTokens: 2000,
        responseMimeType: "application/json",
      });
      parsed = parseAskLoopResponse(aiResult.text);
      model = aiResult.model;
      totalTokens = aiResult.usage.totalTokens;
      promptTokens = aiResult.usage.promptTokens;
      completionTokens = aiResult.usage.completionTokens;
    } catch {
      parsed = buildWorkspaceFallback(normalizedQuestion, contextData);
      model = "workspace-data-fallback";
    }

    const assistantMessage = await askLoopConversation.saveMessage({
      conversationId: conversation.id,
      role: "ASSISTANT",
      content: parsed.answer,
      chart: askLoopChartService.toPrismaJson(parsed.chart),
      metadata: mapMetadataToJsonValue({
        summary: parsed.summary,
        followUpQuestions: parsed.followUpQuestions,
        model,
        totalTokens,
      }) as Prisma.InputJsonValue,
      promptTokens,
      completionTokens,
    });

    return {
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      answer: parsed.answer,
      summary: parsed.summary,
      chart: parsed.chart,
      followUpQuestions: parsed.followUpQuestions,
      citations: parsed.citations,
      createdAt: assistantMessage.createdAt,
    };
  },

  async getConversation(actor: AskLoopActorContext, conversationId: string) {
    assertCanViewConversations(actor.role);

    const conversation = await askLoopConversation.findConversation(
      conversationId,
      actor.workspaceId,
      actor.userId,
    );

    if (!conversation) {
      throw new ApiError(404, ASK_LOOP_MESSAGES.notFound);
    }

    const messages = await askLoopConversation.getConversationMessages(conversationId);

    return { ...conversation, messages };
  },

  async listConversations(
    actor: AskLoopActorContext,
    page: number,
    limit: number,
  ) {
    assertCanViewConversations(actor.role);

    const safePage = Math.max(page, 1);
    const safeLimit = Math.max(limit, 1);

    const result = await askLoopConversation.listConversations(
      actor.workspaceId,
      actor.userId,
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

  async deleteConversation(actor: AskLoopActorContext, conversationId: string): Promise<void> {
    assertCanDeleteConversation(actor.role);

    const result = await askLoopConversation.deleteConversation(
      conversationId,
      actor.workspaceId,
      actor.userId,
    );

    if (result.count === 0) {
      throw new ApiError(404, ASK_LOOP_MESSAGES.notFound);
    }
  },

  getSuggestions() {
    return askLoopSuggestion.getDefaults();
  },

  async saveMessageFeedback(actor: AskLoopActorContext, input: {
    messageId: string;
    helpful: boolean;
    note?: string;
  }) {
    return askLoopFeedbackService.save({
      messageId: input.messageId,
      userId: actor.userId,
      helpful: input.helpful,
      note: input.note,
    });
  },

  async saveQuery(actor: AskLoopActorContext, input: {
    question: string;
    label?: string;
  }) {
    return askLoopSavedQuery.create({
      workspaceId: actor.workspaceId,
      userId: actor.userId,
      question: input.question,
      label: input.label,
    });
  },

  async listSavedQueries(actor: AskLoopActorContext) {
    return askLoopSavedQuery.list(actor.workspaceId, actor.userId);
  },

  async deleteSavedQuery(actor: AskLoopActorContext, savedQueryId: string) {
    return askLoopSavedQuery.delete(savedQueryId, actor.workspaceId, actor.userId);
  },
};

function buildWorkspaceFallback(question: string, context: AskLoopContext): ParsedAIResponse {
  const totals = new Map(context.sentiment.map((item) => [item.sentiment, item.count]));
  const positive = totals.get("POSITIVE") ?? 0;
  const neutral = totals.get("NEUTRAL") ?? 0;
  const negative = totals.get("NEGATIVE") ?? 0;
  const percentage = (value: number) => context.totalFeedback === 0 ? 0 : Math.round((value / context.totalFeedback) * 100);
  const q = question.toLowerCase();
  const citations = context.recentFeedback
    .filter((item) => !q.includes("negative") || item.sentiment === "NEGATIVE")
    .slice(0, 3)
    .map((item) => ({
      feedbackId: item.id,
      content: item.content,
      sentiment: item.sentiment ?? "NEUTRAL",
      source: item.source,
      relevance: 0.9,
    }));

  if (context.totalFeedback === 0) {
    return {
      answer: "There is no feedback in this workspace yet, so I cannot identify trends or themes. Add or import feedback and ask again.",
      followUpQuestions: ["How do I import feedback?", "What data sources can I connect?"],
    };
  }

  if (q.includes("sentiment") || q.includes("unhappy") || q.includes("negative")) {
    return {
      answer: `From ${context.totalFeedback} feedback items, ${positive} (${percentage(positive)}%) are positive, ${neutral} (${percentage(neutral)}%) are neutral, and ${negative} (${percentage(negative)}%) are negative. This is the current workspace distribution; use a date-specific question to measure change over time.`,
      summary: `${percentage(negative)}% of feedback is negative.`,
      chart: { type: "pie", title: "Sentiment distribution", labels: ["Positive", "Neutral", "Negative"], values: [positive, neutral, negative] },
      followUpQuestions: ["What are the top negative themes?", "Which source has the most feedback?"],
      citations,
    };
  }

  if (q.includes("source") || q.includes("email") || q.includes("support")) {
    const labels = context.sources.map((item) => item.source);
    const values = context.sources.map((item) => item.count);
    const top = context.sources[0];
    return {
      answer: top ? `${top.source} is the largest feedback source with ${top.count} items. The chart shows the current feedback volume by source.` : "No feedback sources are available yet.",
      chart: { type: "bar", title: "Feedback by source", labels, values },
      followUpQuestions: ["Show me the sentiment distribution.", "What are the top themes?"],
      citations,
    };
  }

  const labels = context.themes.map((item) => item.name);
  const values = context.themes.map((item) => item.count);
  const top = context.themes[0] ?? context.categories[0];
  const topName = top ? ("name" in top ? top.name : top.category) : undefined;
  const topCount = top?.count ?? 0;
  return {
    answer: topName ? `${topName} is the most discussed theme with ${topCount} mentions. The workspace currently contains ${context.totalFeedback} feedback items. Use a date-specific question to narrow this analysis.` : `This workspace contains ${context.totalFeedback} feedback items. No themes have been assigned yet.`,
    chart: { type: "bar", title: "Top feedback themes", labels, values },
    followUpQuestions: ["Show me the sentiment distribution.", "Which source has the most feedback?"],
    citations,
  };
}

function buildAskLoopContext(context: {
  totalFeedback: number;
  sentiment: Array<{ sentiment: string; count: number }>;
  sources: Array<{ source: string; count: number }>;
  categories: Array<{ category: string; count: number }>;
  themes: Array<{ name: string; count: number }>;
  recentFeedback: Array<{
    content: string;
    sentiment: string | null;
    source: string;
    category: string | null;
    createdAt: Date;
  }>;
}): string {
  return JSON.stringify(
    {
      totalFeedback: context.totalFeedback,
      sentimentDistribution: context.sentiment,
      sourceDistribution: context.sources,
      categoryDistribution: context.categories,
      topThemes: context.themes,
      recentFeedback: context.recentFeedback.map((feedback) => ({
        content: feedback.content,
        sentiment: feedback.sentiment,
        source: feedback.source,
        category: feedback.category,
        createdAt: feedback.createdAt.toISOString(),
      })),
    },
    null,
    2,
  );
}
