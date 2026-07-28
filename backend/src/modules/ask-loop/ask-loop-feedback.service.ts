import { prisma } from "../../config/prisma.js";
import { ApiError } from "../../utils/apiError.js";
import { ASK_LOOP_MESSAGES } from "./ask-loop.constants.js";
import type { FeedbackStats, MessageFeedbackInput } from "./ask-loop.types.js";

export const askLoopFeedbackService = {
  async save(input: MessageFeedbackInput) {
    const message = await prisma.conversationMessage.findUnique({
      where: { id: input.messageId },
    });

    if (!message) {
      throw new ApiError(404, ASK_LOOP_MESSAGES.messageNotFound);
    }

    const note = input.note?.trim();
    return prisma.aIMessageFeedback.upsert({
      where: {
        messageId_userId: {
          messageId: input.messageId,
          userId: input.userId,
        },
      },
      update: {
        helpful: input.helpful,
        note: note && note.length > 0 ? note : undefined,
      },
      create: {
        messageId: input.messageId,
        userId: input.userId,
        helpful: input.helpful,
        note: note && note.length > 0 ? note : undefined,
      },
    });
  },

  async getStats(messageId: string): Promise<FeedbackStats> {
    const allFeedback = await prisma.aIMessageFeedback.findMany({
      where: { messageId },
    });

    const totalMessages = allFeedback.length;
    const helpfulCount = allFeedback.filter((f) => f.helpful).length;
    const notHelpfulCount = totalMessages - helpfulCount;
    const averageRating = totalMessages > 0
      ? Number((helpfulCount / totalMessages * 5).toFixed(1))
      : 0;

    return {
      totalMessages,
      helpfulCount,
      notHelpfulCount,
      averageRating,
    };
  },

  async getUserFeedback(messageId: string, userId: string) {
    return prisma.aIMessageFeedback.findUnique({
      where: {
        messageId_userId: { messageId, userId },
      },
    });
  },
};
