import { GoogleGenAI } from "@google/genai";

import { env } from "./env.js";

export const geminiConfig = {
  apiKey: env.GEMINI_API_KEY,
  model: env.GEMINI_MODEL,
  embeddingModel: env.GEMINI_EMBEDDING_MODEL,
} as const;

export const geminiClient = new GoogleGenAI({
  apiKey: geminiConfig.apiKey,
});

export const geminiDefaults = {
  temperature: 0.2,
  maxOutputTokens: 2000,
  responseMimeType: "text/plain" as const,
} as const;
