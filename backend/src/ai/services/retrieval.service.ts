import type {
  FeedbackDocument,
  VectorDocument,
  VectorSearchResult,
} from "../ai.types.js";

import { embeddingService } from "./embedding.service.js";

import { vectorSearchService } from "./vectorSearch.js";

class RetrievalService {
  async indexDocument(document: FeedbackDocument): Promise<VectorDocument> {
    const embedding = await embeddingService.createEmbedding(document.content);

    const vectorDocument: VectorDocument = {
      ...document,
      vector: embedding.values,
    };

    vectorSearchService.upsert(vectorDocument);

    return vectorDocument;
  }

  async indexDocuments(
    documents: FeedbackDocument[],
  ): Promise<VectorDocument[]> {
    const indexedDocuments = await Promise.all(
      documents.map((document) => this.indexDocument(document)),
    );

    return indexedDocuments;
  }

  async retrieve(input: {
    workspaceId: string;
    query: string;
    limit?: number;
  }): Promise<VectorSearchResult[]> {
    const queryEmbedding = await embeddingService.createEmbedding(input.query);

    return vectorSearchService.search({
      workspaceId: input.workspaceId,
      queryVector: queryEmbedding.values,
      limit: input.limit ?? 5,
    });
  }
}

export const retrievalService = new RetrievalService();
