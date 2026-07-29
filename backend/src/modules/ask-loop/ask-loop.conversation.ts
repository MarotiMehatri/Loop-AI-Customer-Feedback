import { randomUUID } from "node:crypto";
import { prisma } from "../../config/prisma.js";
import type { MessageRole, Prisma } from "../../generated/prisma/client.js";
import type { AskLoopMessage } from "./ask-loop.types.js";
import { ASK_LOOP_LIMITS } from "./ask-loop.constants.js";

function createConversationTitle(question: string): string {
  const normalized = question.replace(/\s+/g, " ").trim();
  if (normalized.length <= 70) return normalized;
  return `${normalized.slice(0, 67)}...`;
}

function formatRole(role: string): string {
  switch (role) {
    case "USER": return "User";
    case "ASSISTANT": return "LOOP AI";
    case "SYSTEM": return "System";
    default: return role;
  }
}

export const askLoopConversation = {
  createTitle(question: string): string {
    return createConversationTitle(question);
  },

  formatRole(role: string): string {
    return formatRole(role);
  },

  buildHistoryPrompt(
    recentMessages: Array<{ role: string; content: string }>,
  ): string {
    if (recentMessages.length === 0) return "No previous conversation history.";

    return recentMessages
      .map((msg) => `${formatRole(msg.role)}: ${msg.content}`)
      .join("\n");
  },

  buildUserPrompt(input: {
    question: string;
    context: string;
    history: Array<{ role: string; content: string }>;
  }): string {
    const historyText = this.buildHistoryPrompt(input.history);

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
  },

  async findConversation(
    conversationId: string,
    workspaceId: string,
    userId: string,
  ) {
    return prisma.conversation.findFirst({
      where: { id: conversationId, workspaceId, userId },
    });
  },

  async createConversation(
    workspaceId: string,
    userId: string,
    title: string,
  ) {
    return prisma.conversation.create({
      data: { workspaceId, userId, title },
    });
  },

  async saveMessage(input: {
    conversationId: string;
    role: MessageRole;
    content: string;
    chart?: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
    promptTokens?: number;
    completionTokens?: number;
  }) {
    return prisma.conversationMessage.create({
      data: {
        conversationId: input.conversationId,
        role: input.role,
        content: input.content,
        chart: input.chart,
        metadata: input.metadata,
        promptTokens: input.promptTokens,
        completionTokens: input.completionTokens,
      },
    });
  },

  async getConversationMessages(conversationId: string): Promise<AskLoopMessage[]> {
    const messages = await prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });

    return messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      chart: m.chart as unknown as AskLoopMessage["chart"],
      metadata: m.metadata as unknown as AskLoopMessage["metadata"],
      promptTokens: m.promptTokens ?? undefined,
      completionTokens: m.completionTokens ?? undefined,
      createdAt: m.createdAt,
    }));
  },

  async getRecentConversationMessages(conversationId: string) {
    return prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: ASK_LOOP_LIMITS.HISTORY_MESSAGE_LIMIT,
    });
  },

  async listConversations(
    workspaceId: string,
    userId: string,
    page: number,
    limit: number,
  ) {
    const where = { workspaceId, userId };
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: limit,
        include: {
          _count: { select: { messages: true } },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        messageCount: item._count.messages,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      total,
    };
  },

  async deleteConversation(
    conversationId: string,
    workspaceId: string,
    userId: string,
  ) {
    return prisma.conversation.deleteMany({
      where: { id: conversationId, workspaceId, userId },
    });
  },
};
