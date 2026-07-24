import type {
  AIConversationMessage,
  ConversationMemoryEntry,
} from "../ai.types.js";

class ConversationMemory {
  private readonly conversations = new Map<string, ConversationMemoryEntry>();

  create(input: {
    conversationId: string;
    userId: string;
    workspaceId: string;
  }): ConversationMemoryEntry {
    const entry: ConversationMemoryEntry = {
      conversationId: input.conversationId,

      userId: input.userId,

      workspaceId: input.workspaceId,

      messages: [],

      updatedAt: new Date(),
    };

    this.conversations.set(input.conversationId, entry);

    return entry;
  }

  get(conversationId: string): ConversationMemoryEntry | null {
    return this.conversations.get(conversationId) ?? null;
  }

  addMessage(
    conversationId: string,
    message: AIConversationMessage,
  ): ConversationMemoryEntry {
    const conversation = this.conversations.get(conversationId);

    if (!conversation) {
      throw new Error("Conversation not found.");
    }

    conversation.messages.push(message);
    conversation.updatedAt = new Date();

    return conversation;
  }

  getRecentMessages(
    conversationId: string,
    limit = 10,
  ): AIConversationMessage[] {
    const conversation = this.get(conversationId);

    if (!conversation) {
      return [];
    }

    return conversation.messages.slice(-limit);
  }

  delete(conversationId: string): boolean {
    return this.conversations.delete(conversationId);
  }
}

export const conversationMemory = new ConversationMemory();
