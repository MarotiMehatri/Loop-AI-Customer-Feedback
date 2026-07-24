import type { AskLoopAnswer, AskLoopRequest } from "../ai.types.js";

import { generateGeminiContent } from "../gemini.client.js";

import { buildAskLoopPrompt } from "../promptBuilder.js";

import { parseAskLoopResponse } from "../responseParser.js";

import { ASK_LOOP_SYSTEM_PROMPT } from "../prompts/askLoop.prompt.js";

import { retrievalService } from "./retrieval.service.js";

import { citationService } from "./citation.service.js";

import { conversationService } from "./conversation.service.js";

class AskLoopService {
  async ask(input: AskLoopRequest): Promise<AskLoopAnswer> {
    const question = input.question.trim();

    if (!question) {
      throw new Error("Question cannot be empty.");
    }

    const conversation = conversationService.getOrCreateConversation({
      conversationId: input.conversationId,

      userId: input.userId,

      workspaceId: input.workspaceId,
    });

    const history = conversationService.getRecentMessages(
      conversation.conversationId,
      10,
    );

    const retrievalResults = await retrievalService.retrieve({
      workspaceId: input.workspaceId,
      query: question,
      limit: input.limit ?? 5,
    });

    const documents = retrievalResults.map((result) => result.document);

    const prompt = buildAskLoopPrompt({
      question,
      history,
      documents,
    });

    conversationService.addMessage({
      conversationId: conversation.conversationId,

      role: "user",

      content: question,
    });

    const response = await generateGeminiContent({
      systemInstruction: ASK_LOOP_SYSTEM_PROMPT,

      prompt,

      temperature: 0.2,

      responseMimeType: "application/json",

      maxOutputTokens: 2000,
    });

    const parsed = parseAskLoopResponse(response.text);

    const citations = citationService.createCitations(
      retrievalResults,
      parsed.referencedSourceIds,
    );

    conversationService.addMessage({
      conversationId: conversation.conversationId,

      role: "assistant",

      content: parsed.answer,
    });

    return {
      conversationId: conversation.conversationId,

      answer: parsed.answer,

      summary: parsed.summary,

      followUpQuestions: parsed.followUpQuestions,

      citations,

      usage: response.usage,
    };
  }
}

export const askLoopService = new AskLoopService();
