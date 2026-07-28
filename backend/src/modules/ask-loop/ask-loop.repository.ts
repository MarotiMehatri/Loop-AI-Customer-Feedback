import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

export const askLoopRepository = {
  async saveMessage(input: {
    conversationId: string;
    role: string;
    content: string;
    chart?: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
    promptTokens?: number;
    completionTokens?: number;
  }) {
    return prisma.conversationMessage.create({
      data: {
        conversationId: input.conversationId,
        role: input.role as never,
        content: input.content,
        chart: input.chart,
        metadata: input.metadata,
        promptTokens: input.promptTokens,
        completionTokens: input.completionTokens,
      },
    });
  },

  async getMessageById(messageId: string) {
    return prisma.conversationMessage.findUnique({
      where: { id: messageId },
    });
  },
};
