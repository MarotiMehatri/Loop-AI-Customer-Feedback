import { randomUUID } from "node:crypto";

import type {
  AIConversationMessage,
  AIMessageRole,
  ConversationMemoryEntry,
} from "../ai.types.js";

import {
  conversationMemory,
} from "./conversationMemory.js";

class ConversationService {
  createConversation(input: {
    userId: string;
    workspaceId: string;
  }): ConversationMemoryEntry {
    return conversationMemory.create({
      conversationId: randomUUID(),
      userId: input.userId,
      workspaceId: input.workspaceId,
    });
  }

  getOrCreateConversation(input: {
    conversationId?: string;
    userId: string;
    workspaceId: string;
  }): ConversationMemoryEntry {
    if (input.conversationId) {
      const existing =
        conversationMemory.get(
          input.conversationId,
        );

      if (existing) {
        if (
          existing.userId !== input.userId ||
          existing.workspaceId !==
            input.workspaceId
        ) {
          throw new Error(
            "Conversation access denied.",
          );
        }

        return existing;
      }
    }

    return this.createConversation({
      userId: input.userId,
      workspaceId: input.workspaceId,
    });
  }

  addMessage(input: {
    conversationId: string;
    role: AIMessageRole;
    content: string;
  }): AIConversationMessage {
    const message: AIConversationMessage = {
      id: randomUUID(),
      role: input.role,
      content: input.content,
      createdAt: new Date(),
    };

    conversationMemory.addMessage(
      input.conversationId,
      message,
    );

    return message;
  }

  getRecentMessages(
    conversationId: string,
    limit = 10,
  ): AIConversationMessage[] {
    return conversationMemory.getRecentMessages(
      conversationId,
      limit,
    );
  }
}

export const conversationService =
  new ConversationService();