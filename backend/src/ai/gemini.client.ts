import { GoogleGenAI } from "@google/genai";

import { env } from "../config/env.js";
import { AIServiceError, handleAIError } from "./aiErrorHandler.js";

import type {
  AIGenerationRequest,
  AIGenerationResponse,
  EmbeddingResult,
} from "./ai.types.js";

const geminiClient = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

export async function generateGeminiContent(
  input: AIGenerationRequest,
): Promise<AIGenerationResponse> {
  try {
    const prompt = input.prompt.trim();

    if (!prompt) {
      throw new AIServiceError(
        "INVALID_RESPONSE",
        "Gemini prompt cannot be empty.",
        400,
      );
    }

    const response = await geminiClient.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: prompt,

      config: {
        systemInstruction: input.systemInstruction,

        temperature: input.temperature ?? 0.2,

        maxOutputTokens: input.maxOutputTokens ?? 2000,

        responseMimeType: input.responseMimeType ?? "text/plain",
      },
    });

    const text = response.text?.trim();

    if (!text) {
      throw new AIServiceError(
        "EMPTY_RESPONSE",
        "Gemini returned an empty response.",
        502,
      );
    }

    return {
      text,
      model: env.GEMINI_MODEL,

      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount,

        completionTokens: response.usageMetadata?.candidatesTokenCount,

        totalTokens: response.usageMetadata?.totalTokenCount,
      },
    };
  } catch (error) {
    throw handleAIError(error);
  }
}

export async function generateGeminiEmbedding(
  text: string,
): Promise<EmbeddingResult> {
  try {
    const normalizedText = text.trim();

    if (!normalizedText) {
      throw new AIServiceError(
        "INVALID_RESPONSE",
        "Embedding text cannot be empty.",
        400,
      );
    }

    const response = await geminiClient.models.embedContent({
      model: env.GEMINI_EMBEDDING_MODEL,
      contents: normalizedText,
    });

    const values = response.embeddings?.[0]?.values;

    if (!values || values.length === 0) {
      throw new AIServiceError(
        "EMPTY_RESPONSE",
        "Gemini returned an empty embedding.",
        502,
      );
    }

    return {
      text: normalizedText,
      values,
      model: env.GEMINI_EMBEDDING_MODEL,
    };
  } catch (error) {
    throw handleAIError(error);
  }
}

export async function countGeminiTokens(content: string): Promise<number> {
  try {
    const response = await geminiClient.models.countTokens({
      model: env.GEMINI_MODEL,
      contents: content,
    });

    return response.totalTokens ?? 0;
  } catch (error) {
    throw handleAIError(error);
  }
}

export { geminiClient };
