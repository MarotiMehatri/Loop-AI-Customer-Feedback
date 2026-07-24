import { generateGeminiEmbedding } from "../gemini.client.js";

import type { EmbeddingResult } from "../ai.types.js";

class EmbeddingService {
  async createEmbedding(text: string): Promise<EmbeddingResult> {
    return generateGeminiEmbedding(text);
  }

  async createEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    return Promise.all(texts.map((text) => this.createEmbedding(text)));
  }
}

export const embeddingService = new EmbeddingService();
