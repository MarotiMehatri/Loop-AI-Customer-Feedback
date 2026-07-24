import type { Citation, VectorSearchResult } from "../ai.types.js";

function createExcerpt(content: string, maximumLength = 220): string {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (normalized.length <= maximumLength) {
    return normalized;
  }

  return `${normalized.slice(0, maximumLength)}...`;
}

class CitationService {
  createCitations(
    results: VectorSearchResult[],
    referencedSourceIds?: string[],
  ): Citation[] {
    const allowedIds = new Set(referencedSourceIds ?? []);

    const filteredResults =
      allowedIds.size > 0
        ? results.filter((result) => allowedIds.has(result.document.id))
        : results;

    return filteredResults.map((result, index) => ({
      number: index + 1,
      sourceId: result.document.id,

      title: result.document.title ?? "Customer feedback",

      source: result.document.source,

      excerpt: createExcerpt(result.document.content),

      score: Number(result.score.toFixed(4)),
    }));
  }

  appendCitations(answer: string, citations: Citation[]): string {
    if (citations.length === 0) {
      return answer;
    }

    const citationText = citations
      .map((citation) => `[${citation.number}] ${citation.title}`)
      .join("\n");

    return `${answer}\n\nSources:\n${citationText}`;
  }
}

export const citationService = new CitationService();
