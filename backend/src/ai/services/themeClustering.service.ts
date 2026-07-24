import type { FeedbackDocument, ThemeCluster } from "../ai.types.js";

import { generateGeminiContent } from "../gemini.client.js";

import { formatFeedbackDocuments } from "../promptBuilder.js";

import { parseThemeClusterResponse } from "../responseParser.js";

import { THEME_CLUSTERING_SYSTEM_PROMPT } from "../prompts/themeClustering.prompt.js";

class ThemeClusteringService {
  async clusterThemes(feedback: FeedbackDocument[]): Promise<ThemeCluster[]> {
    if (feedback.length === 0) {
      return [];
    }

    const response = await generateGeminiContent({
      systemInstruction: THEME_CLUSTERING_SYSTEM_PROMPT,

      prompt: `
Create themes for this customer feedback:

${formatFeedbackDocuments(feedback)}
        `.trim(),

      responseMimeType: "application/json",

      temperature: 0.2,

      maxOutputTokens: 2500,
    });

    return parseThemeClusterResponse(response.text);
  }
}

export const themeClusteringService = new ThemeClusteringService();
