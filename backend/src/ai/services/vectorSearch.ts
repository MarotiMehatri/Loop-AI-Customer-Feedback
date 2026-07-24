import type { VectorDocument, VectorSearchResult } from "../ai.types.js";

function cosineSimilarity(first: number[], second: number[]): number {
  if (
    first.length === 0 ||
    second.length === 0 ||
    first.length !== second.length
  ) {
    return 0;
  }

  let dotProduct = 0;
  let firstMagnitude = 0;
  let secondMagnitude = 0;

  for (let index = 0; index < first.length; index += 1) {
    const firstValue = first[index] ?? 0;
    const secondValue = second[index] ?? 0;

    dotProduct += firstValue * secondValue;
    firstMagnitude += firstValue ** 2;
    secondMagnitude += secondValue ** 2;
  }

  if (firstMagnitude === 0 || secondMagnitude === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(firstMagnitude) * Math.sqrt(secondMagnitude));
}

class VectorSearchService {
  private readonly documents = new Map<string, VectorDocument>();

  upsert(document: VectorDocument): void {
    const key = this.createKey(document.workspaceId, document.id);

    this.documents.set(key, document);
  }

  upsertMany(documents: VectorDocument[]): void {
    for (const document of documents) {
      this.upsert(document);
    }
  }

  remove(workspaceId: string, documentId: string): boolean {
    return this.documents.delete(this.createKey(workspaceId, documentId));
  }

  search(input: {
    workspaceId: string;
    queryVector: number[];
    limit?: number;
    minimumScore?: number;
  }): VectorSearchResult[] {
    const limit = input.limit ?? 5;
    const minimumScore = input.minimumScore ?? 0.2;

    return Array.from(this.documents.values())
      .filter((document) => document.workspaceId === input.workspaceId)
      .map((document) => ({
        document,

        score: cosineSimilarity(input.queryVector, document.vector),
      }))
      .filter((result) => result.score >= minimumScore)
      .sort((first, second) => second.score - first.score)
      .slice(0, limit);
  }

  clearWorkspace(workspaceId: string): void {
    for (const [key, document] of this.documents.entries()) {
      if (document.workspaceId === workspaceId) {
        this.documents.delete(key);
      }
    }
  }

  private createKey(workspaceId: string, documentId: string): string {
    return `${workspaceId}:${documentId}`;
  }
}

export const vectorSearchService = new VectorSearchService();
