import type { FeedbackClassification } from "../ai.types.js";

import { generateGeminiContent } from "../gemini.client.js";

import { buildClassificationPrompt } from "../promptBuilder.js";

import { parseClassificationResponse } from "../responseParser.js";

import { CLASSIFICATION_SYSTEM_PROMPT } from "../prompts/classification.prompt.js";

class ClassificationService {
  async classifyFeedback(feedback: string): Promise<FeedbackClassification> {
    const normalizedFeedback = feedback.trim();

    if (!normalizedFeedback) {
      throw new Error("Feedback cannot be empty.");
    }

    const response = await generateGeminiContent({
      systemInstruction: CLASSIFICATION_SYSTEM_PROMPT,

      prompt: buildClassificationPrompt(normalizedFeedback),

      temperature: 0.1,

      responseMimeType: "application/json",

      maxOutputTokens: 1000,
    });

    return parseClassificationResponse(response.text);
  }

  async classifyMany(
    feedbackItems: Array<{
      id: string;
      content: string;
    }>,
  ): Promise<
    Array<{
      id: string;
      classification: FeedbackClassification;
    }>
  > {
    return Promise.all(
      feedbackItems.map(async (item) => ({
        id: item.id,

        classification: await this.classifyFeedback(item.content),
      })),
    );
  }
}

export const classificationService = new ClassificationService();
